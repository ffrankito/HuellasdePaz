import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession lee del cookie sin round-trip a Supabase — refresca el access token
  // via refresh token si expiró, pero no hace un request de validación al servidor.
  const { data: { session }, error } = await supabase.auth.getSession()

  const tokenInvalido = error?.code === 'refresh_token_not_found' || error?.code === 'bad_jwt'

  if (tokenInvalido || (!session && !request.nextUrl.pathname.startsWith('/auth'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const response = NextResponse.redirect(url)
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-')) response.cookies.delete(cookie.name)
    })
    return response
  }

  return supabaseResponse
}