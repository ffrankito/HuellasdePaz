export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">

          <a
            href="https://airesdepaz.com.ar/"
            className="site-header__logo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir al sitio de Aires de Paz"
          >
            <img
              src="/logo.png"
              alt="Aires de Paz"
              style={{ height: 48, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
            />
          </a>

          <nav className="site-header__nav">
            <a
              href="https://airesdepaz.com.ar/"
              className="site-header__nav-link site-header__nav-link--hidden-mobile"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sitio principal
            </a>
            <a
              href="tel:+5493413590030"
              className="site-header__nav-link site-header__nav-link--phone"
            >
              341 359-0030
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}
