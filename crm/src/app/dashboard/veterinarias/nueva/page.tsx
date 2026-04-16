import { VeterinariaForm } from '@/components/veterinarias/VeterinariaForm'

export default function NuevaVeterinariaPage() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Nueva veterinaria</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Registrá una veterinaria y configurá su convenio
        </p>
      </div>
      <VeterinariaForm />
    </div>
  )
}