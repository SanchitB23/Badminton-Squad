import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is approved
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved')
      .eq('id', user.id)
      .single()

    if (!profile?.approved) {
      return NextResponse.json({ error: 'User not approved' }, { status: 403 })
    }

    const body = await request.json()
    const { session_id, status } = body

    // Validate required fields
    if (!session_id || !status) {
      return NextResponse.json(
        { error: 'Session ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status value
    if (!['COMING', 'NOT_COMING', 'TENTATIVE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be COMING, NOT_COMING, or TENTATIVE' },
        { status: 400 }
      )
    }

    // Check if session exists and is in the future
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, start_time')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if response cutoff has passed (T-1 day midnight IST)
    const sessionDate = new Date(session.start_time)
    const cutoffTime = new Date(sessionDate)
    cutoffTime.setDate(cutoffTime.getDate() - 1)
    cutoffTime.setHours(0, 0, 0, 0) // Midnight IST (handled by timezone conversion)

    const now = new Date()
    if (now >= cutoffTime) {
      return NextResponse.json(
        { error: 'Response cutoff has passed. Cannot update response.' },
        { status: 400 }
      )
    }

    // Upsert user response (insert or update)
    const { data: response, error } = await supabase
      .from('responses')
      .upsert({
        user_id: user.id,
        session_id,
        status
      }, {
        onConflict: 'user_id,session_id'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error updating response:', error)
      return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get all responses for the session
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        *,
        user:profiles!responses_user_id_fkey(name)
      `)
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error fetching responses:', error)
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
    }

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}