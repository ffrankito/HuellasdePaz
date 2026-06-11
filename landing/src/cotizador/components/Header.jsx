export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">

          <a href="/" className="site-header__logo" aria-label="Ir al sitio de Aires de Paz">
            <img
              src="/logo.png"
              alt="Aires de Paz"
              style={{ height: 108, width: 'auto', objectFit: 'contain', filter: 'contrast(1.05) saturate(1.1)' }}
            />
          </a>

          <nav className="site-header__nav">
            <a href="/" className="site-header__nav-link site-header__nav-link--hidden-mobile">
              Sitio principal
            </a>
            <a href="tel:+5493417523248" className="site-header__nav-link site-header__nav-link--phone">
              341 752-3248
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}
