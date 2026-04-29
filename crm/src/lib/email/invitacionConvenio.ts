import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarInvitacionConvenio({
  nombre,
  email,
  linkActivacion,
}: {
  nombre: string
  email: string
  linkActivacion: string
}) {
  const { error } = await resend.emails.send({
    from: 'Huellas de Paz <onboarding@resend.dev>',
    to: email,
    subject: `Tu portal de socios de Huellas de Paz está listo`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">

    <div style="background:#111827;border-radius:16px;padding:40px;text-align:center;margin-bottom:32px;">
      <div style="font-size:40px;margin-bottom:16px;">🐾</div>
      <h1 style="color:white;font-size:22px;font-weight:600;margin:0 0 8px;">Huellas de Paz</h1>
      <p style="color:#9ca3af;font-size:14px;margin:0;">Portal de socios</p>
    </div>

    <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 12px;">
      Hola, ${nombre} 👋
    </h2>

    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
      Te damos acceso al portal de socios de Huellas de Paz. Desde ahí vas a poder derivar clientes directamente, sin necesidad de llamarnos.
    </p>

    <div style="background:#f3f4f6;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:14px;color:#374151;">📋 &nbsp;<strong>Cargar leads</strong> de tus clientes en segundos</p>
      <p style="margin:0 0 10px;font-size:14px;color:#374151;">📊 &nbsp;<strong>Ver el estado</strong> de cada derivación en tiempo real</p>
      <p style="margin:0;font-size:14px;color:#374151;">🔒 &nbsp;<strong>Acceso seguro</strong> con tu email y contraseña</p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${linkActivacion}" style="display:inline-block;background:#2d8a54;color:white;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;">
        Activar mi acceso →
      </a>
    </div>

    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 8px;">
      Este link es personal y expira en 24 horas. Si no lo solicitaste, podés ignorar este mensaje.
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      El equipo de <strong>Huellas de Paz</strong> · Rosario, Argentina
    </p>

  </div>
</body>
</html>
    `,
  })

  if (error) throw new Error(`Error enviando email: ${error.message}`)
  return { ok: true }
}
