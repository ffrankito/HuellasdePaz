# Huellas de Paz — Cotizador

Cotizador online embebible en Wix. Calcula el costo de servicios y planes de previsión.

## Stack

| Capa | Tool |
| --- | --- |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 4 |
| Hosting | Vercel |

## Setup local

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

## Embed en Wix

```html
<iframe
  src="https://cotizador.huellasdepaz.com.ar"
  width="100%"
  height="600px"
  frameborder="0"
/>
```

## Funcionalidad v1

- Selección de tipo de servicio
- Selección de tamaño/peso de la mascota
- Productos adicionales (urna, placa, flores)
- Precio en tiempo real
- CTA → WhatsApp con presupuesto pre-cargado

## Funcionalidad v2

- Precios configurables desde el CRM
- Botón contratar plan → formulario al CRM
