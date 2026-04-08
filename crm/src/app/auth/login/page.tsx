import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{ width: '50%', background: '#030712', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 64px' }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: 8 }} />
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>
            Cada despedida<br />merece ser recordada.
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
            Sistema de gestión interno para el equipo de Huellas de Paz.
          </p>
        </div>
        <p style={{ color: '#374151', fontSize: 12 }}>© 2025 Huellas de Paz · Rosario, Argentina</p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Bienvenido</h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Ingresá con tu cuenta para continuar</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}