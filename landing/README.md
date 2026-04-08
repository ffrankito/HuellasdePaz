# Huellas de Paz — Landing

Landing page de captación. Sitio estático de una sola página con secciones navegables via anchor links.

## Stack

| Capa | Tool |
| --- | --- |
| Framework | Astro 6 + TypeScript |
| Styling | Tailwind CSS 4 |
| Font | Playfair Display + DM Sans |
| Hosting | Vercel (static output) |

## Setup local

```bash
npm install
npm run dev     # http://localhost:4321
npm run build
npm run preview
```

## Estructura

```
src/
├── layouts/
│   └── Base.astro
├── components/
│   ├── Navbar.astro
│   ├── Hero.astro
│   ├── Servicios.astro
│   ├── Planes.astro        # contenido pendiente del cliente
│   ├── Cotizador.astro
│   ├── Contacto.astro      # leads → CRM
│   └── Footer.astro
├── pages/
│   └── index.astro
├── styles/
│   └── global.css
└── assets/
    ├── images/             # pendiente
    └── logo/               # pendiente
```

## Secciones

| Sección | Estado |
| --- | --- |
| Navbar | Listo |
| Hero | Listo con placeholders |
| Servicios | Listo |
| Planes | Estructura lista, contenido pendiente |
| Cotizador CTA | Listo (URL pendiente) |
| Formulario de contacto | Listo, conecta al CRM |
| Footer | Listo con placeholders |

## Docs

| Archivo | Contenido |
| --- | --- |
| docs/entrevista-checklist.md | Gaps de contenido a resolver con el cliente |
| docs/leads-flow.md | Flujo de leads hacia el CRM |
| docs/adr/ADR-001-framework.md | Por qué Astro |
