import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="login-root">

      {/* Panel izquierdo */}
      <div className="login-left">

        {/* Logo */}
        <div className="login-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="white" fillOpacity="0.9"/>
            <circle cx="9" cy="7" r="1.5" fill="white" fillOpacity="0.6"/>
            <circle cx="15" cy="7" r="1.5" fill="white" fillOpacity="0.6"/>
            <circle cx="7" cy="11" r="1.2" fill="white" fillOpacity="0.6"/>
            <circle cx="17" cy="11" r="1.2" fill="white" fillOpacity="0.6"/>
          </svg>
          <span className="login-logo-text">Huellas de Paz</span>
        </div>

        {/* Cita */}
        <div className="login-quote">
          <div className="login-quote-mark">"</div>
          <h1 className="login-heading">
            Cada despedida<br />merece ser<br />recordada.
          </h1>
          <p className="login-subheading">
            Sistema de gestión interno para el equipo de Huellas de Paz.
          </p>
        </div>

        {/* Decoración de patas */}
        <div className="login-paws" aria-hidden="true">
          {[
            { top: '18%', left: '8%', size: 32, opacity: 0.06, rotate: -20 },
            { top: '32%', left: '72%', size: 20, opacity: 0.05, rotate: 15 },
            { top: '55%', left: '20%', size: 26, opacity: 0.07, rotate: 30 },
            { top: '70%', left: '60%', size: 18, opacity: 0.05, rotate: -10 },
            { top: '82%', left: '35%', size: 22, opacity: 0.06, rotate: 45 },
          ].map((p, i) => (
            <svg
              key={i}
              width={p.size} height={p.size}
              viewBox="0 0 24 24"
              fill="white"
              style={{ position: 'absolute', top: p.top, left: p.left, opacity: p.opacity, transform: `rotate(${p.rotate}deg)` }}
            >
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
              <circle cx="9" cy="7" r="1.5"/>
              <circle cx="15" cy="7" r="1.5"/>
              <circle cx="7" cy="11" r="1.2"/>
              <circle cx="17" cy="11" r="1.2"/>
            </svg>
          ))}
        </div>

        <p className="login-footer-text">© 2025 Huellas de Paz · Rosario, Argentina</p>
      </div>

      {/* Panel derecho */}
      <div className="login-right">
        <div className="login-form-wrap">

          <div style={{ marginBottom: 32 }}>
            <div className="login-mobile-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#2d8a54">
                <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
                <circle cx="9" cy="7" r="1.5" fill="#aadfc2"/>
                <circle cx="15" cy="7" r="1.5" fill="#aadfc2"/>
                <circle cx="7" cy="11" r="1.2" fill="#aadfc2"/>
                <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
              </svg>
              <span style={{ fontWeight: 600, color: '#1c1917', fontSize: 15 }}>Huellas de Paz</span>
            </div>
            <h2 className="login-form-title">Bienvenido de nuevo</h2>
            <p className="login-form-subtitle">Ingresá con tu cuenta para continuar</p>
          </div>

          <LoginForm />

        </div>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          background: #f9fafb;
        }

        /* ── Panel izquierdo ── */
        .login-left {
          width: 46%;
          background: linear-gradient(155deg, #1a5233 0%, #2d8a54 45%, #1c3a28 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 56px;
          position: relative;
          overflow: hidden;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .login-logo-text {
          font-size: 15px;
          font-weight: 600;
          color: white;
          letter-spacing: 0.02em;
        }

        .login-quote {
          position: relative;
          z-index: 1;
        }
        .login-quote-mark {
          font-size: 80px;
          line-height: 0.7;
          color: rgba(255,255,255,0.15);
          font-family: Georgia, serif;
          margin-bottom: 12px;
          user-select: none;
        }
        .login-heading {
          font-size: 34px;
          font-weight: 700;
          color: white;
          line-height: 1.25;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .login-subheading {
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          line-height: 1.7;
          max-width: 280px;
          margin: 0;
        }

        .login-paws { position: absolute; inset: 0; pointer-events: none; }

        .login-footer-text {
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          position: relative;
          z-index: 1;
          margin: 0;
        }

        /* ── Panel derecho ── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 380px;
        }

        .login-mobile-logo {
          display: none;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .login-form-title {
          font-size: 26px;
          font-weight: 700;
          color: #1c1917;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .login-form-subtitle {
          font-size: 14px;
          color: #78716c;
          margin: 0;
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { background: white; }
          .login-mobile-logo { display: flex; }
        }
      `}</style>
    </main>
  )
}
