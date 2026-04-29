import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const estadoInfo: Record<string, { label: string; descripcion: string; emoji: string; color: string }> = {
  en_proceso: {
    label: 'En proceso',
    descripcion: 'Tu mascota llegó a nuestras instalaciones. La estamos atendiendo con todo el cuidado que merece.',
    emoji: '🕯️',
    color: '#1d4ed8',
  },
  listo: {
    label: 'Listo para retirar',
    descripcion: 'El proceso fue completado. Las cenizas están listas para ser entregadas. Podés coordinar el retiro con nosotros.',
    emoji: '✅',
    color: '#15803d',
  },
  entregado: {
    label: 'Entregado',
    descripcion: 'Las cenizas de tu compañero/a fueron entregadas. Agradecemos tu confianza.',
    emoji: '💚',
    color: '#15803d',
  },
}

export async function notificarCambioEstado({
  email,
  nombreCliente,
  nombreMascota,
  nuevoEstado,
  tokenPortal,
}: {
  email: string
  nombreCliente: string
  nombreMascota: string
  nuevoEstado: string
  tokenPortal: string | null
}) {
  const info = estadoInfo[nuevoEstado]
  if (!info) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.split(' ').at(-1) ?? ''
  const portalUrl = tokenPortal ? `${appUrl}/portal/${tokenPortal}` : null

  const { error } = await resend.emails.send({
    from: 'Huellas de Paz <onboarding@resend.dev>',
    to: email,
    subject: `${info.emoji} ${nombreMascota}: ${info.label}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">

    <div style="background:#111827;border-radius:16px;padding:32px 40px;margin-bottom:24px;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Huellas de Paz · Rosario</p>
      <h1 style="color:white;font-size:20px;font-weight:700;margin:0;line-height:1.3;">
        Actualización del servicio de ${nombreMascota}
      </h1>
    </div>

    <p style="font-size:15px;color:#374151;margin:0 0 20px;">Hola, <strong>${nombreCliente}</strong>:</p>

    <div style="background:white;border-radius:16px;border:1px solid #e5e7eb;padding:28px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="font-size:32px;">${info.emoji}</div>
        <div>
          <p style="font-size:12px;color:#9ca3af;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Estado actual</p>
          <p style="font-size:18px;font-weight:700;color:${info.color};margin:0;">${info.label}</p>
        </div>
      </div>
      <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">${info.descripcion}</p>
    </div>

    ${portalUrl ? `
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${portalUrl}" style="display:inline-block;background:#111827;color:white;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;">
        Ver portal →
      </a>
      <p style="font-size:12px;color:#9ca3af;margin:10px 0 0;">Desde tu portal podés ver el estado en tiempo real y el memorial.</p>
    </div>
    ` : ''}

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      Con cariño, el equipo de <strong>Huellas de Paz</strong>
    </p>

  </div>
</body>
</html>
    `,
  })

  if (error) console.error('Error enviando email de estado:', error.message)
}
