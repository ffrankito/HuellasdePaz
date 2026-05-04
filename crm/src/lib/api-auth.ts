import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Usuario } from '@/db/schema'

type AuthOk   = { ok: true;  usuario: Usuario }
type AuthFail = { ok: false; response: NextResponse }

export async function requireAuth(
  rolesPermitidos?: string[],
  opts: { skipMfa?: boolean } = {}
): Promise<AuthOk | AuthFail> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }

  const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })

  if (!usuario) {
    return { ok: false, response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return { ok: false, response: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
  }

  if (usuario.mfaEmailActivo && !opts.skipMfa) {
    const cookieStore = await cookies()
    const mfaS = cookieStore.get('mfa_s')?.value
    const valid = !!mfaS && (() => {
      const sep = mfaS.lastIndexOf(':')
      const uid = mfaS.slice(0, sep)
      const token = mfaS.slice(sep + 1)
      return (
        uid === usuario.id &&
        usuario.mfaSesionToken === token &&
        usuario.mfaSesionExpiraEn != null &&
        new Date() < usuario.mfaSesionExpiraEn
      )
    })()
    if (!valid) {
      return { ok: false, response: NextResponse.json({ error: 'MFA requerido' }, { status: 401 }) }
    }
  }

  return { ok: true, usuario }
}