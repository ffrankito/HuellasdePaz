export default function Header() {
  return (
    <header className="site-header" style={{
      background: 'linear-gradient(135deg, #f7f0e8 0%, #eef5ec 100%)',
      borderBottom: '1px solid #e8e0d4',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>

      {/* Huellitas decorativas de fondo */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', userSelect: 'none',
        overflow: 'hidden',
      }}>
        <span style={{ position: 'absolute', fontSize: 28, opacity: 0.08, top: '10%', left: '2%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 22, opacity: 0.07, top: '50%', left: '8%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 18, opacity: 0.06, bottom: '10%', left: '15%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 24, opacity: 0.07, top: '15%', left: '25%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 20, opacity: 0.06, bottom: '15%', left: '35%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 26, opacity: 0.07, top: '20%', right: '30%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 18, opacity: 0.06, bottom: '10%', right: '20%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 22, opacity: 0.07, top: '10%', right: '10%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 20, opacity: 0.06, bottom: '20%', right: '5%' }}>🐾</span>
        <span style={{ position: 'absolute', fontSize: 16, opacity: 0.05, top: '40%', right: '3%' }}>🐾</span>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="site-header__inner">

          <a
            href="https://huellasde-paz-pl2f.vercel.app/"
            className="site-header__logo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir al sitio de Huellas de Paz"
            style={{ textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>🐾</span>
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#2d6a4f',
                letterSpacing: '-0.02em',
              }}>
                Huellas de Paz
              </span>
            </div>
          </a>

          <nav className="site-header__nav">
            <a
              href="https://huellasde-paz-pl2f.vercel.app/"
              className="site-header__nav-link site-header__nav-link--hidden-mobile"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2d6a4f' }}
            >
              Sitio principal
            </a>
            <a
              href="tel:+5493410000000"
              className="site-header__nav-link site-header__nav-link--phone"
            >
              📞 341 000-0000
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}