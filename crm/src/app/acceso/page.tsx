export default function AccesoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f2ee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #e8f5ed 0%, #d1ead9 100%)', border: '1px solid rgba(45,138,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
            <circle cx="9"  cy="7"  r="1.5" fill="#aadfc2"/>
            <circle cx="15" cy="7"  r="1.5" fill="#aadfc2"/>
            <circle cx="7"  cy="11" r="1.2" fill="#aadfc2"/>
            <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Huellas de Paz</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rosario, Argentina</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          ¿A dónde querés ingresar?
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Elegí según tu tipo de cuenta</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 440 }}>

        <a href="/portal/login" className="acceso-card">
          <div className="acceso-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Mi portal</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Seguí tus servicios, planes y el memorial de tu mascota</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>

        <a href="/portal/convenio/login" className="acceso-card">
          <div className="acceso-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Portal socios</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Veterinarias, petshops y clínicas con convenio activo</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>

      </div>

      <p style={{ marginTop: 40, fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
        <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Volver al sitio</a>
      </p>

      <style>{`
        .acceso-card {
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 20px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .acceso-card:hover {
          border-color: #2d8a54;
          box-shadow: 0 0 0 4px rgba(45,138,84,0.07);
        }
        .acceso-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #f0faf5;
          border: 1px solid #d1ead9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

    </div>
  )
}
