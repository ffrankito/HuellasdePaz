import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq, and, gte, count, sum } from 'drizzle-orm'
import { buildSystemPrompt } from '@/lib/asistente/docs'
import { asistenteLog } from '@/db/schema'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY_ASISTENTE! })

const RATE_LIMIT_PER_MINUTE = Number(process.env.ASISTENTE_RATE_LIMIT_POR_MINUTO ?? 5)
const BUDGET_MONTHLY_USD = Number(process.env.ASISTENTE_PRESUPUESTO_USD ?? 10)
const MAX_TOKENS = Number(process.env.ASISTENTE_MAX_TOKENS ?? 400)
const MODEL = process.env.ASISTENTE_MODELO ?? 'claude-haiku-4-5-20251001'
const COST_PER_INPUT_TOKEN = 0.80 / 1_000_000
const COST_PER_OUTPUT_TOKEN = 4.00 / 1_000_000

export async function POST(request: NextRequest) {
  try {
    // 1. Auth — nunca confiar en datos del frontend
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // 2. Rol real desde DB
    const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
    if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    const rolReal = usuario.rol

    // 3. Solo message, history y screenContext del frontend
    const body = await request.json()
    const { message, history, screenContext } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    // Protección básica contra prompt injection
    const injectionPatterns = [
      'ignorá las reglas', 'ignora las reglas', 'ignore previous',
      'actúa como admin', 'actuá como admin', 'eres un', 'sos un asistente diferente',
      'mostrame el prompt', 'reveal prompt', 'system prompt',
      'ejecutá sql', 'ejecuta sql', 'drop table', 'select * from',
    ]
    const msgLower = message.toLowerCase()
    if (injectionPatterns.some(p => msgLower.includes(p))) {
      return NextResponse.json({ error: 'No puedo ayudar con eso.' }, { status: 400 })
    }

    // 4. Rate limit
    const unMinutoAtras = new Date(Date.now() - 60 * 1000)
    const [{ total: mensajesRecientes }] = await db
      .select({ total: count() })
      .from(asistenteLog)
      .where(and(eq(asistenteLog.usuarioId, user.id), gte(asistenteLog.creadoEn, unMinutoAtras)))

    if (mensajesRecientes >= RATE_LIMIT_PER_MINUTE) {
      return NextResponse.json({ error: 'Demasiadas consultas. Esperá un momento.' }, { status: 429 })
    }

    // 5. Control de presupuesto mensual
    const inicioMes = new Date()
    inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)
    const [uso] = await db
      .select({ totalInput: sum(asistenteLog.tokensInput), totalOutput: sum(asistenteLog.tokensOutput) })
      .from(asistenteLog)
      .where(gte(asistenteLog.creadoEn, inicioMes))

    const costoMes =
      (Number(uso?.totalInput ?? 0) * COST_PER_INPUT_TOKEN) +
      (Number(uso?.totalOutput ?? 0) * COST_PER_OUTPUT_TOKEN)

    if (costoMes >= BUDGET_MONTHLY_USD) {
      return NextResponse.json({ error: 'El asistente alcanzó el límite mensual. Contactá al administrador.' }, { status: 402 })
    }

    // 6. System prompt con docs filtradas por rol real
    const systemPrompt = buildSystemPrompt(rolReal, screenContext)

    // 7. Construir historial de mensajes
    const historialPrevio: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(history)
      ? history.slice(-10) // máximo 10 mensajes previos
      : []

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...historialPrevio,
      { role: 'user', content: message },
    ]

    // 8. Streaming con Anthropic SDK
    const encoder = new TextEncoder()
    let tokensInput = 0
    let tokensOutput = 0

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = client.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: systemPrompt,
            messages,
          })

          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
            if (event.type === 'message_delta' && event.usage) {
              tokensOutput = event.usage.output_tokens
            }
            if (event.type === 'message_start' && event.message.usage) {
              tokensInput = event.message.usage.input_tokens
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

          // 9. Log sin datos sensibles
          await db.insert(asistenteLog).values({
            usuarioId: user.id,
            rol: rolReal,
            pregunta: message.slice(0, 500),
            screenContext: screenContext ?? null,
            tokensInput,
            tokensOutput,
          })
        } catch (err) {
          console.error('Error en stream del asistente:', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Error al generar respuesta' })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error en asistente:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
