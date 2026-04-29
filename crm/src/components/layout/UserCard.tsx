'use client'

const rolLabel: Record<string, string> = {
  admin:      'Administrador',
  manager:    'Manager',
  contadora:  'Contadora',
  televenta:  'Agente de ventas',
  transporte: 'Transporte',
  cremacion:  'Cremación',
  entrega:    'Entrega',
}

export function UserCard({ nombre, rol }: { nombre: string; rol: string }) {
  const inicial = nombre.charAt(0).toUpperCase()

  return (
    <div className="uc-card">

      {/* Borde animado */}
      <div className="uc-border" />

      {/* Contenido central */}
      <div className="uc-content">
        {/* Avatar con pata + inicial */}
        <div className="uc-avatar-wrap">
          <div className="uc-avatar-logo">
            {/* Pata (logo1) */}
            <svg className="uc-logo1" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              <circle cx="9"  cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="15" cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="7"  cy="11" r="1.2" fill="#aadfc2"/>
              <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
            </svg>
            {/* Inicial (logo2, empieza desplazado) */}
            <span className="uc-logo2">{inicial}</span>
            {/* Trail shimmer */}
            <div className="uc-trail" />
          </div>
          {/* Nombre debajo del avatar */}
          <p className="uc-name">{nombre}</p>
        </div>
      </div>

      {/* Texto inferior */}
      <span className="uc-bottom">{rolLabel[rol] ?? rol}</span>

      <style>{`
        .uc-card {
          width: 100%;
          height: 110px;
          background: #111827;
          position: relative;
          display: grid;
          place-content: center;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.5s ease-in-out;
          cursor: default;
        }
        .uc-card:hover {
          border-radius: 6px;
          transform: scale(1.03);
        }

        .uc-border {
          position: absolute;
          inset: 0;
          border: 1.5px solid #2d8a54;
          border-radius: 12px;
          opacity: 0;
          transform: rotate(10deg);
          transition: all 0.5s ease-in-out;
        }
        .uc-card:hover .uc-border {
          inset: 10px;
          opacity: 1;
          transform: rotate(0deg);
          border-radius: 4px;
        }

        .uc-content {
          transition: all 0.5s ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .uc-avatar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .uc-avatar-logo {
          height: 32px;
          position: relative;
          width: 30px;
          overflow: hidden;
          transition: all 1s ease-in-out;
        }
        .uc-card:hover .uc-avatar-logo {
          width: 110px;
          animation: uc-opacity 1s ease-in-out;
        }

        .uc-logo1 {
          height: 30px;
          width: 30px;
          position: absolute;
          left: 0;
          flex-shrink: 0;
        }

        .uc-logo2 {
          height: 30px;
          width: 80px;
          position: absolute;
          left: 30px;
          display: flex;
          align-items: center;
          padding-left: 10px;
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.03em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          white-space: nowrap;
        }

        .uc-trail {
          position: absolute;
          right: 0;
          height: 100%;
          width: 100%;
          opacity: 0;
        }
        .uc-card:hover .uc-trail {
          animation: uc-trail 1s ease-in-out;
        }

        .uc-name {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          margin-top: 28px;
          color: rgba(255,255,255,0.6);
          font-size: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          opacity: 0;
          white-space: nowrap;
          transition: all 0.5s ease-in-out 0.5s;
          margin: 28px 0 0;
        }
        .uc-card:hover .uc-name {
          opacity: 1;
          letter-spacing: 0.5px;
        }

        .uc-bottom {
          position: absolute;
          left: 50%;
          bottom: 10px;
          transform: translateX(-50%);
          font-size: 6.5px;
          text-transform: uppercase;
          padding: 0 6px 0 8px;
          color: #2d8a54;
          background: #111827;
          opacity: 0;
          letter-spacing: 6px;
          white-space: nowrap;
          transition: all 0.5s ease-in-out;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 600;
        }
        .uc-card:hover .uc-bottom {
          letter-spacing: 3px;
          opacity: 1;
        }

        @keyframes uc-opacity {
          0%   { border-right: 1px solid transparent; }
          10%  { border-right: 1px solid #2d8a54; }
          80%  { border-right: 1px solid #2d8a54; }
          100% { border-right: 1px solid transparent; }
        }

        @keyframes uc-trail {
          0%  { background: linear-gradient(90deg, rgba(45,138,84,0) 90%, rgba(45,138,84,1) 100%); opacity: 0; }
          30% { background: linear-gradient(90deg, rgba(45,138,84,0) 70%, rgba(45,138,84,1) 100%); opacity: 1; }
          70% { background: linear-gradient(90deg, rgba(45,138,84,0) 70%, rgba(45,138,84,1) 100%); opacity: 1; }
          95% { background: linear-gradient(90deg, rgba(45,138,84,0) 90%, rgba(45,138,84,1) 100%); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
