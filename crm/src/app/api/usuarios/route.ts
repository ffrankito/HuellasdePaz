import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const todos = await db.select().from(usuarios)
    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error listando usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const solicitante = await db.query.usuarios.findFirst({
      where: (u, { eq }) => eq(u.id, user.id),
    })
    if (!solicitante || solicitante.rol !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, email, rol, password } = body

    if (!nombre || !email || !rol || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    })

    if (error) {
      console.error('Error creando usuario en Supabase Auth:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const [nuevo] = await db.insert(usuarios).values({
      id: data.user.id,
      nombre,
      email,
      rol,
      permisos: [],
    }).returning()

    revalidatePath('/dashboard/manager/agentes')
    return NextResponse.json(nuevo, { status: 201 })
  } catch (error) {
    console.error('Error creando usuario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
