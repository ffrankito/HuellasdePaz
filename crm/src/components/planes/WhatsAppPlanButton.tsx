'use client'

type Props = {
  telefono: string
  nombre: string
  cuotasPagadas: number
  planNombre: string
}

export function WhatsAppPlanButton({ telefono, nombre, cuotasPagadas, planNombre }: Props) {
  const numero = telefono.replace(/\D/g, '')
  const texto = encodeURIComponent(
    `Hola ${nombre}, te contactamos de Huellas de Paz. Queremos recordarte que tu cuota #${cuotasPagadas + 1} del ${planNombre} está pendiente de pago. Ante cualquier consulta, estamos a tu disposición. ¡Gracias!`
  )

  return (
    <button
      onClick={() => window.open(
        `https://wa.me/549${numero}?text=${texto}`,
        'whatsapp',
        'width=480,height=700,top=100,left=100'
      )}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 16, background: '#25D366', color: 'white',
        borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', border: 'none', width: '100%',
      }}
    >
      💬 Enviar recordatorio por WhatsApp
    </button>
  )
}
