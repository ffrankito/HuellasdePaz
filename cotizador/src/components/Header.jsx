export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">

          <a
            href="https://www.huellasdepaz.com.ar"
            className="site-header__logo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir al sitio de Huellas de Paz"
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              Huellas de Paz
            </span>
          </a>

          <nav className="site-header__nav">
            <a
              href="https://www.huellasdepaz.com.ar"
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
              📞 341 000-0000
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}