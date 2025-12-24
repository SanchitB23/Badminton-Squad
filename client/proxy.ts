import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check if user is approved
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist or approved is not true, redirect to pending
      if (!profile || profile.approved !== true) {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (['/login', '/signup'].includes(request.nextUrl.pathname)) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user.id)
        .single()

      const url = request.nextUrl.clone()
      url.pathname = (profile && profile.approved === true) ? '/dashboard/sessions' : '/pending-approval'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}