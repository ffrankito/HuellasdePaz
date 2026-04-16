import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const extension = file.name.split('.').pop()
    const nombre = `${Date.now()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('inventario')
      .upload(nombre, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Error subiendo archivo:', error)
      return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
    }

    const { data } = supabase.storage.from('inventario').getPublicUrl(nombre)

    return NextResponse.json({ url: data.publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Error en storage:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}