import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCorsHeaders } from '@/lib/cors'
import { crearLeadAutomatico } from '@/lib/leads/crearLeadAutomatico'

export const runtime = 'nodejs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY_ASISTENTE! })
const MODEL   = 'claude-haiku-4-5-20251001'

// Rate limiting simple en memoria (por IP, max 20 mensajes/hora)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now    = Date.now()
  const entry  = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

// Extrae nombre y teléfono del historial si el usuario los mencionó
function extraerContacto(historial: { role: string; content: string }[]): { nombre?: string; telefono?: string } {
  const texto = historial.map(m => m.content).join(' ')
  const tel   = texto.match(/(?:^|\s)(\d[\d\s\-]{8,14}\d)(?:\s|$)/)?.[1]?.replace(/\D/g, '')
  const nom   = texto.match(/(?:soy|me llamo|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i)?.[1]
  return { nombre: nom, telefono: tel }
}

const SYSTEM_PROMPT = `Sos el asistente virtual de Aires de Paz, el primer crematorio exclusivo de mascotas en Rosario, Santa Fe, Argentina. Llevamos más de 20 años acompañando a las familias.

## Servicios que ofrecemos

**Cremación individual** — La mascota es cremada sola. Se devuelven las cenizas en urna.
**Cremación Siempre Juntos** — Cremación individual con la posibilidad de estar presente.
**Cremación comunitaria (Huellitas)** — Sin devolución de cenizas. Opción más accesible.
**Jardín del Recuerdo** — Entierro en parcela o nicho en nuestro cementerio parque.

## Planes de previsión
Planes mensuales para contratar antes de que llegue el momento:
- **Cobertura progresiva**: 0% meses 1-6 · 50% meses 7-12 · 100% desde el mes 13
- Mascota adicional: +50% sobre la cuota base
- Beneficio: precio fijo, sin aumentos, sin apuro cuando llegue el momento

## Datos de contacto
- WhatsApp: 341 359-0030
- Dirección: Ruta A012 KM 1.2 — S2002 Pueblo Esther, Santa Fe
- Oficina comercial: San Lorenzo 2369, Rosario 2000
- Horario: Lunes a Viernes 8:00 a 17:00 · Sábados y Domingos 9:00 a 17:00 · Feriados 9:00 a 17:00
- Atención de urgencias: 24 horas

## Convenios
Trabajamos con veterinarias, petshops, clínicas y refugios de Rosario. Si sos profesional y querés ofrecer este servicio a tus clientes, comunicate con nosotros.

## Tu rol
- Respondé en español rioplatense argentino, con calidez y empatía
- Sé breve y claro (máximo 3-4 oraciones por respuesta)
- Si la persona pregunta por precios exactos, explicá que varían por especie y peso y ofrecé conectarlos con un asesor
- Si la persona quiere ser contactada, pedí su nombre y teléfono amablemente
- Nunca inventés información que no esté en este contexto
- Cuando sea apropiado, sugerí hablar con un asesor por WhatsApp (341 359-0030)`

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request.headers.get('origin')) })
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'))

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados mensajes. Intentá en un rato.' }, { status: 429, headers: corsHeaders })
  }

  try {
    const { mensaje, historial = [] } = await request.json()
    if (!mensaje?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400, headers: corsHeaders })
    }

    // Limitar historial a últimos 10 turnos para evitar tokens excesivos
    const historialReciente = historial.slice(-10)

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 350,
      system: SYSTEM_PROMPT,
      messages: [
        ...historialReciente,
        { role: 'user', content: mensaje.slice(0, 500) },
      ],
    })

    const respuesta = response.content[0].type === 'text' ? response.content[0].text : ''

    // Intentar crear lead si el usuario mencionó nombre y teléfono
    const nuevoHistorial = [...historialReciente, { role: 'user', content: mensaje }, { role: 'assistant', content: respuesta }]
    const { nombre, telefono } = extraerContacto(nuevoHistorial)

    if (nombre && telefono && telefono.length >= 8) {
      try {
        await crearLeadAutomatico({
          nombre,
          telefono,
          origen: 'chatbot',
          mensaje: `Contacto vía chat web. Historial: ${historialReciente.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join(' | ')}`.slice(0, 500),
        })
      } catch { /* No interrumpir el chat si falla el lead */ }
    }

    return NextResponse.json({ respuesta }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error chat público:', error)
    return NextResponse.json(
      { respuesta: 'Lo siento, no pude procesar tu mensaje. Podés escribirnos directo por WhatsApp al 341 359-0030.' },
      { headers: corsHeaders }
    )
  }
}
