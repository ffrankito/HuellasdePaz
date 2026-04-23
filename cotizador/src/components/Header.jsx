export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">

          <a
            href="https://huellasde-paz-pl2f.vercel.app/"
            className="site-header__logo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir al sitio de Huellas de Paz"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="26" height="26" viewBox="0 0 40 40" fill="#2d8a54">
                <ellipse cx="20" cy="26" rx="9" ry="7"/>
                <ellipse cx="10" cy="17" rx="4" ry="3.5" transform="rotate(-15 10 17)"/>
                <ellipse cx="17" cy="13" rx="3.5" ry="3" transform="rotate(-5 17 13)"/>
                <ellipse cx="24" cy="13" rx="3.5" ry="3" transform="rotate(5 24 13)"/>
                <ellipse cx="30" cy="17" rx="4" ry="3.5" transform="rotate(15 30 17)"/>
              </svg>
              <span className="site-header__logo-text">Huellas de Paz</span>
            </div>
          </a>

          <nav className="site-header__nav">
            <a
              href="https://huellasde-paz-pl2f.vercel.app/"
              className="site-header__nav-link site-header__nav-link--hidden-mobile"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sitio principal
            </a>
            <a
              href="tel:+5493410000000"
              className="site-header__nav-link site-header__nav-link--phone"
            >
              341 000-0000
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}