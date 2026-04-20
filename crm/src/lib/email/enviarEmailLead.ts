import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailLead({
  para,
  asunto,
  cuerpo,
  nombreAgente,
}: {
  para: string
  asunto: string
  cuerpo: string
  nombreAgente: string
}) {
  const { error } = await resend.emails.send({
    from: 'Huellas de Paz <onboarding@resend.dev>',
    to: para,
    subject: asunto,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">

    <div style="background:#111827;border-radius:16px;padding:40px;text-align:center;margin-bottom:32px;">
      <div style="font-size:40px;margin-bottom:16px;">🐾</div>
      <h1 style="color:white;font-size:22px;font-weight:600;margin:0 0 8px;">Huellas de Paz</h1>
      <p style="color:#9ca3af;font-size:14px;margin:0;">Rosario, Argentina</p>
    </div>

    <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <div style="white-space:pre-wrap;font-size:15px;color:#374151;line-height:1.7;">${cuerpo}</div>
    </div>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      ${nombreAgente} · <strong>Huellas de Paz</strong> · Rosario, Argentina
    </p>

  </div>
</body>
</html>
    `,
  })

  if (error) throw new Error(`Error enviando email: ${error.message}`)
  return { ok: true }
}