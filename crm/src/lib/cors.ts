export const ALLOWED_ORIGINS = [
  'https://huellasde-paz-cotizador.vercel.app',
  'https://huellasde-paz-pl2f.vercel.app',
  'http://localhost:5173',  // cotizador dev
  'http://localhost:4321',  // landing dev (Astro)
  'http://localhost:3001',
]

export function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
