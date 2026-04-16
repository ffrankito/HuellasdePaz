import { randomBytes } from 'crypto'

export function generarToken(): string {
  return randomBytes(32).toString('hex')
}