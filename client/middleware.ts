import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/pending-approval') {
    // If user is authenticated and trying to access login/signup, redirect to dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      // Check if user is approved
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user.id)
        .single()

      if (profile?.approved) {
        return NextResponse.redirect(new URL('/dashboard/sessions', request.url))
      } else {
        return NextResponse.redirect(new URL('/pending-approval', request.url))
      }
    }
    return response
  }

  // Protected routes - require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user profile is approved for dashboard access
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved')
      .eq('id', user.id)
      .single()

    if (!profile?.approved) {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}