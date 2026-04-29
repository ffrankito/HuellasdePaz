import { LoginForm } from '@/components/auth/LoginForm'

const PAWS = [
  { top: '5%',  left: '4%',   size: 56, opacity: 0.07, rotate: -22, delay: '0s',   dur: '9s'  },
  { top: '10%', left: '80%',  size: 32, opacity: 0.09, rotate: 38,  delay: '1.8s', dur: '11s' },
  { top: '38%', left: '2%',   size: 22, opacity: 0.06, rotate: 12,  delay: '3.2s', dur: '8s'  },
  { top: '50%', left: '90%',  size: 46, opacity: 0.06, rotate: -35, delay: '0.6s', dur: '12s' },
  { top: '65%', left: '11%',  size: 28, opacity: 0.08, rotate: 55,  delay: '2.4s', dur: '10s' },
  { top: '76%', left: '84%',  size: 18, opacity: 0.09, rotate: -8,  delay: '1.1s', dur: '7s'  },
  { top: '86%', left: '40%',  size: 38, opacity: 0.06, rotate: 28,  delay: '2.9s', dur: '13s' },
  { top: '22%', left: '54%',  size: 16, opacity: 0.05, rotate: -48, delay: '0.4s', dur: '9s'  },
  { top: '92%', left: '66%',  size: 24, opacity: 0.07, rotate: 18,  delay: '3.6s', dur: '11s' },
]

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0faf5',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>

      {/* Glows suaves */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(45,138,84,0.1) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(45,138,84,0.07) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '85%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(45,138,84,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>

      {/* Patas flotantes */}
      {PAWS.map((p, i) => (
        <svg
          key={i}
          width={p.size} height={p.size}
          viewBox="0 0 24 24"
          fill="#2d8a54"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
            animation: `lp-float ${p.dur} ease-in-out ${p.delay} infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
          <circle cx="9"  cy="7"  r="1.5"/>
          <circle cx="15" cy="7"  r="1.5"/>
          <circle cx="7"  cy="11" r="1.2"/>
          <circle cx="17" cy="11" r="1.2"/>
        </svg>
      ))}

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 28,
        padding: '52px 48px 44px',
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(45,138,84,0.1), 0 0 0 1px rgba(45,138,84,0.08)',
      }}>

        {/* Acento verde arriba de la card */}
        <div style={{ position: 'absolute', top: 0, left: 48, right: 48, height: 3, background: 'linear-gradient(90deg, transparent, #2d8a54, transparent)', borderRadius: '0 0 4px 4px' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #e8f5ed 0%, #d1ead9 100%)',
            border: '1px solid rgba(45,138,84,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              <circle cx="9"  cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="15" cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="7"  cy="11" r="1.2" fill="#aadfc2"/>
              <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
              Huellas de Paz
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Huellas de Paz
            </p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Bienvenido de nuevo
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Ingresá con tu cuenta para continuar
          </p>
        </div>

        <LoginForm />

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#d1d5db', margin: 0, letterSpacing: '0.04em' }}>
            © 2025 Huellas de Paz · Rosario, Argentina
          </p>
        </div>
      </div>

      <style>{`
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-14px); }
        }
      `}</style>
    </main>
  )
}
