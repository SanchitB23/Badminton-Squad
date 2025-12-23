import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error.message)
      return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
    }

    // Create response and redirect to login page
    const response = NextResponse.redirect(new URL('/login', request.url))

    // Clear any additional cookies if needed
    response.cookies.delete('supabase-auth-token')

    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Also support GET requests for direct navigation
  return POST(request)
}