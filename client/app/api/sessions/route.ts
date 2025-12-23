import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'start_time'

    // Fetch sessions with response counts and user's response
    let query = supabase
      .from('sessions')
      .select(`
        *,
        created_by_profile:profiles!sessions_created_by_fkey(name),
        responses(status, user_id),
        user_response:responses!responses_user_id_fkey(status)
      `)
      .gte('start_time', new Date().toISOString())
      .eq('responses.user_id', user.id)
      .limit(limit)

    // Apply filtering
    if (filter === 'responded') {
      query = query.not('responses', 'is', null)
    } else if (filter === 'created') {
      query = query.eq('created_by', user.id)
    }

    // Apply sorting
    query = query.order(sort, { ascending: sort === 'start_time' })

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Process response counts and user responses
    const processedSessions = sessions?.map(session => {
      const responses = session.responses || []
      const responseCounts = {
        COMING: responses.filter(r => r.status === 'COMING').length,
        TENTATIVE: responses.filter(r => r.status === 'TENTATIVE').length,
        NOT_COMING: responses.filter(r => r.status === 'NOT_COMING').length
      }

      const recommendedCourts = Math.ceil(responseCounts.COMING / 4)
      const userResponse = session.user_response?.[0]?.status || null

      return {
        id: session.id,
        title: session.title,
        description: session.description,
        location: session.location,
        start_time: session.start_time,
        end_time: session.end_time,
        created_by: {
          id: session.created_by,
          name: session.created_by_profile?.name
        },
        response_counts: responseCounts,
        recommended_courts: recommendedCourts,
        user_response: userResponse,
        created_at: session.created_at
      }
    }) || []

    return NextResponse.json({ sessions: processedSessions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { title, description, location, start_time, end_time } = body

    // Validate required fields
    if (!location || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Location, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Create session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        title,
        description,
        location,
        start_time,
        end_time,
        created_by: user.id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}