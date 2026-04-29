import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes } from '@/db/schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-\(\)\+]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const { telefono } = await request.json()
    if (!telefono?.trim()) {
      return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 })
    }

    const telefonoNorm = normalizePhone(telefono)

    const todos = await db.select({
      id: clientes.id,
      nombre: clientes.nombre,
      email: clientes.email,
      telefono: clientes.telefono,
      tokenPortal: clientes.tokenPortal,
    }).from(clientes)

    const cliente = todos.find(c => {
      if (!c.telefono) return false
      const t = normalizePhone(c.telefono)
      return t === telefonoNorm || t.endsWith(telefonoNorm) || telefonoNorm.endsWith(t)
    })

    if (!cliente || !cliente.tokenPortal) {
      return NextResponse.json({ found: false })
    }

    if (cliente.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://huellasde-paz.vercel.app'
      const portalLink = `${appUrl}/portal/${cliente.tokenPortal}`

      await resend.emails.send({
        from: 'Huellas de Paz <onboarding@resend.dev>',
        to: cliente.email,
        subject: 'Tu link de acceso al portal — Huellas de Paz',
        html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
    <div style="background:#111827;border-radius:16px;padding:36px;text-align:center;margin-bottom:32px;">
      <div style="font-size:36px;margin-bottom:12px;">🐾</div>
      <h1 style="color:white;font-size:20px;font-weight:600;margin:0 0 6px;">Huellas de Paz</h1>
      <p style="color:#9ca3af;font-size:13px;margin:0;">Rosario, Argentina</p>
    </div>

    <h2 style="font-size:19px;font-weight:600;color:#111827;margin:0 0 10px;">Hola, ${cliente.nombre} 👋</h2>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
      Recibimos tu solicitud de acceso. Hacé clic en el botón para entrar a tu portal personal:
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${portalLink}" style="display:inline-block;background:#2d8a54;color:white;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;">
        Entrar a mi portal →
      </a>
    </div>

    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 8px;">
      Si no solicitaste este acceso, podés ignorar este mensaje. El link es personal, guardalo en un lugar seguro.
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      Con cariño, el equipo de <strong>Huellas de Paz</strong>
    </p>
  </div>
</body>
</html>`,
      })

      return NextResponse.json({ found: true, hasEmail: true, emailMasked: maskEmail(cliente.email) })
    }

    return NextResponse.json({ found: true, hasEmail: false })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
