# ADR-001 — Framework de la landing: Astro

**Estado:** Aceptado
**Fecha:** Abril 2026
**Autores:** Ravenna

## Contexto

La landing es un sitio estático de una sola página. No tiene lógica de servidor propia.

## Decisión

Usamos Astro 6 con static output mode.

## Razones

- Zero JS by default: mejor performance y SEO
- Consistencia con NeoVet: Ravenna ya conoce el tooling
- Vercel deploy: un git push y está live

## Alternativas descartadas

- **Next.js:** Overkill para una landing estática
- **React + Vite:** Sin SSG nativo, peor SEO
- **WordPress/Wix:** Sin control sobre el código

## Consecuencias

- La landing no puede tener lógica de servidor propia
- El formulario llama a la API del CRM
