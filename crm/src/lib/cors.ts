const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? []
const devOrigins = process.env.NODE_ENV === 'development'
  ? ['http://localhost:5173', 'http://localhost:4321', 'http://localhost:3001']
  : []
export const ALLOWED_ORIGINS = [...envOrigins, ...devOrigins]

export function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
