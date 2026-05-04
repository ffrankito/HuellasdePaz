import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomUUID } from 'crypto'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'

function hashOtp(codigo: string, userId: string): string {
  return createHash('sha256').update(codigo + userId).digest('hex')
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(undefined, { skipMfa: true })
  if (!auth.ok) return auth.response

  const { usuario } = auth
  const body = await request.json()
  const { codigo, proposito } = body as { codigo: string; proposito: 'login' | 'activar' | 'desactivar' }

  if (!codigo || !proposito) {
    return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 })
  }

  // Verificar que hay un OTP pendiente
  if (!usuario.otpCodigo || !usuario.otpExpiraEn) {
    return NextResponse.json({ error: 'No hay un código pendiente. Solicitá uno nuevo.' }, { status: 400 })
  }

  // Verificar expiración
  if (new Date() > usuario.otpExpiraEn) {
    await db.update(usuarios)
      .set({ otpCodigo: null, otpExpiraEn: null, otpIntentos: 0 })
      .where(eq(usuarios.id, usuario.id))
    return NextResponse.json({ error: 'El código expiró. Solicitá uno nuevo.' }, { status: 400 })
  }

  // Verificar intentos
  const intentos = usuario.otpIntentos ?? 0
  if (intentos >= 3) {
    await db.update(usuarios)
      .set({ otpCodigo: null, otpExpiraEn: null, otpIntentos: 0 })
      .where(eq(usuarios.id, usuario.id))
    return NextResponse.json({ error: 'Demasiados intentos fallidos. Solicitá un código nuevo.' }, { status: 400 })
  }

  // Verificar hash
  const hashIngresado = hashOtp(codigo.trim(), usuario.id)
  if (hashIngresado !== usuario.otpCodigo) {
    await db.update(usuarios)
      .set({ otpIntentos: intentos + 1 })
      .where(eq(usuarios.id, usuario.id))
    const restantes = 3 - (intentos + 1)
    return NextResponse.json({
      error: restantes > 0
        ? `Código incorrecto. ${restantes} intento${restantes !== 1 ? 's' : ''} restante${restantes !== 1 ? 's' : ''}.`
        : 'Código incorrecto. Solicitá un código nuevo.',
    }, { status: 400 })
  }

  // Código correcto — limpiar OTP
  const ahora = new Date()
  const update: Record<string, unknown> = {
    otpCodigo: null,
    otpExpiraEn: null,
    otpIntentos: 0,
    actualizadoEn: ahora,
  }

  if (proposito === 'activar') {
    update.mfaEmailActivo = true
  } else if (proposito === 'desactivar') {
    update.mfaEmailActivo = false
    update.mfaSesionToken = null
    update.mfaSesionExpiraEn = null
  }

  // Para login y activar: generar nueva sesión MFA
  let sesionToken: string | null = null
  if (proposito === 'login' || proposito === 'activar') {
    sesionToken = randomUUID()
    update.mfaSesionToken = sesionToken
    update.mfaSesionExpiraEn = new Date(ahora.getTime() + 8 * 60 * 60 * 1000) // 8 horas
  }

  await db.update(usuarios).set(update).where(eq(usuarios.id, usuario.id))

  const response = NextResponse.json({ ok: true })

  if (sesionToken) {
    response.cookies.set('mfa_s', `${usuario.id}:${sesionToken}`, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
  }

  if (proposito === 'desactivar') {
    response.cookies.delete('mfa_s')
  }

  return response
}
