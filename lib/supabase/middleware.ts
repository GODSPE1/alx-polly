import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnon) {
    // Missing env vars: skip auth handling to avoid noisy fetch failures
    return supabaseResponse
  }

  let user = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnon,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Basic cookie name/value validation to prevent injection
              const safeName = String(name).replace(/[^a-zA-Z0-9_\-]/g, '')
              const safeValue = String(value).replace(/[\r\n]/g, '')
              request.cookies.set(safeName, safeValue)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              const safeName = String(name).replace(/[^a-zA-Z0-9_\-]/g, '')
              const safeValue = String(value).replace(/[\r\n]/g, '')
              supabaseResponse.cookies.set(safeName, safeValue, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // Silently ignore transient network/auth refresh errors in middleware
      return supabaseResponse
    }
    user = data.user
  } catch (e) {
    // Network or other failure; do not block the request
    return supabaseResponse
  }
    // Sanitize the pathname to prevent injection attacks
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Remove any query parameters or fragments that could be used for XSS
    url.search = ''
    url.hash = ''
    return NextResponse.redirect(url)
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}