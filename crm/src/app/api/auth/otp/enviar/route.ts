import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { Resend } from 'resend'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

function generarOtp(): string {
  const buf = randomBytes(3)
  const num = buf.readUIntBE(0, 3) % 1000000
  return num.toString().padStart(6, '0')
}

function hashOtp(codigo: string, userId: string): string {
  return createHash('sha256').update(codigo + userId).digest('hex')
}

export async function POST() {
  const auth = await requireAuth(undefined, { skipMfa: true })
  if (!auth.ok) return auth.response

  const { usuario } = auth

  // Evitar reenvíos en menos de 60 segundos
  if (usuario.otpExpiraEn) {
    const segundosRestantes = (usuario.otpExpiraEn.getTime() - Date.now()) / 1000
    if (segundosRestantes > 540) { // quedan más de 9 min → código reciente
      return NextResponse.json({ error: 'Esperá 60 segundos antes de pedir otro código.' }, { status: 429 })
    }
  }

  const codigo = generarOtp()
  const hash = hashOtp(codigo, usuario.id)
  const expiraEn = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

  await db.update(usuarios)
    .set({ otpCodigo: hash, otpExpiraEn: expiraEn, otpIntentos: 0 })
    .where(eq(usuarios.id, usuario.id))

  try {
    await resend.emails.send({
      from: 'Huellas de Paz <onboarding@resend.dev>',
      to: usuario.email,
      subject: `${codigo} — tu código de verificación`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

    <div style="background:#111827;border-radius:16px;padding:36px;text-align:center;margin-bottom:28px;">
      <div style="font-size:36px;margin-bottom:12px;">🐾</div>
      <h1 style="color:white;font-size:20px;font-weight:600;margin:0 0 6px;">Huellas de Paz</h1>
      <p style="color:#9ca3af;font-size:13px;margin:0;">Panel de gestión interno</p>
    </div>

    <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e5e7eb;text-align:center;">
      <p style="font-size:15px;color:#374151;margin:0 0 24px;line-height:1.6;">
        Hola <strong>${usuario.nombre}</strong>, tu código de verificación es:
      </p>
      <div style="background:#f0faf5;border:2px solid #2d8a54;border-radius:14px;padding:24px;margin:0 0 24px;">
        <span style="font-size:40px;font-weight:700;color:#111827;letter-spacing:10px;font-variant-numeric:tabular-nums;">${codigo}</span>
      </div>
      <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
        Este código expira en <strong>10 minutos</strong>.<br/>
        Si no fuiste vos, ignorá este email.
      </p>
    </div>

    <p style="font-size:11px;color:#d1d5db;text-align:center;margin:24px 0 0;">
      © Huellas de Paz · Rosario, Argentina
    </p>
  </div>
</body>
</html>`,
    })
  } catch (err) {
    console.error('Error enviando OTP por email:', err)
    return NextResponse.json({ error: 'No se pudo enviar el email. Intentá de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
