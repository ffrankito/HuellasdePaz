import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios, clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const [empleado, cliente] = await Promise.all([
    db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) }),
    db.query.clientes.findFirst({ where: eq(clientes.authUserId, user.id) }),
  ])

  return NextResponse.json({
    esEmpleado: !!empleado,
    esCliente: !!cliente,
    tokenPortal: cliente?.tokenPortal ?? null,
    nombreCliente: cliente?.nombre ?? null,
  })
}
