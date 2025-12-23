import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseApiError } from "@/lib/utils/error-handling";

// GET - Fetch user activity data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // 'all', 'created', 'responded'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Base queries for different activity types
    let createdSessionsQuery = supabase
      .from("sessions")
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        created_at,
        created_by:profiles!sessions_created_by_fkey (
          id,
          name
        ),
        response_counts:responses (
          user_id,
          status
        )
      `)
      .eq("created_by", user.id)
      .order("start_time", { ascending: false });

    let respondedSessionsQuery = supabase
      .from("responses")
      .select(`
        id,
        status,
        created_at as response_created_at,
        session:sessions!responses_session_id_fkey (
          id,
          title,
          description,
          location,
          start_time,
          end_time,
          created_at,
          created_by:profiles!sessions_created_by_fkey (
            id,
            name
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply pagination
    if (limit > 0) {
      createdSessionsQuery = createdSessionsQuery.range(offset, offset + limit - 1);
      respondedSessionsQuery = respondedSessionsQuery.range(offset, offset + limit - 1);
    }

    let createdSessions = [];
    let respondedSessions = [];
    
    // Fetch data based on filter
    if (filter === 'all' || filter === 'created') {
      const { data, error } = await createdSessionsQuery;
      if (error) {
        console.error("Error fetching created sessions:", error);
      } else {
        // Transform and calculate response counts
        createdSessions = (data || []).map(session => {
          const responses = session.response_counts || [];
          const counts = {
            COMING: responses.filter(r => r.status === 'COMING').length,
            TENTATIVE: responses.filter(r => r.status === 'TENTATIVE').length,
            NOT_COMING: responses.filter(r => r.status === 'NOT_COMING').length,
          };
          
          return {
            id: session.id,
            title: session.title,
            description: session.description,
            location: session.location,
            start_time: session.start_time,
            end_time: session.end_time,
            created_at: session.created_at,
            created_by: session.created_by,
            response_counts: counts,
            activity_type: 'created',
            activity_date: session.created_at,
          };
        });
      }
    }

    if (filter === 'all' || filter === 'responded') {
      const { data, error } = await respondedSessionsQuery;
      if (error) {
        console.error("Error fetching responded sessions:", error);
      } else {
        // Transform responded sessions data
        respondedSessions = (data || [])
          .filter(response => response.session) // Filter out responses where session might be deleted
          .map(response => ({
            id: response.session.id,
            title: response.session.title,
            description: response.session.description,
            location: response.session.location,
            start_time: response.session.start_time,
            end_time: response.session.end_time,
            created_at: response.session.created_at,
            created_by: response.session.created_by,
            user_response: response.status,
            activity_type: 'responded',
            activity_date: response.response_created_at,
            response_id: response.id,
          }));
      }
    }

    // Combine and sort all activities by activity date
    let allActivities = [];
    
    if (filter === 'all') {
      allActivities = [...createdSessions, ...respondedSessions]
        .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
        .slice(0, limit > 0 ? limit : undefined);
    } else if (filter === 'created') {
      allActivities = createdSessions;
    } else if (filter === 'responded') {
      allActivities = respondedSessions;
    }

    // Get total counts for pagination
    const { count: createdCount } = await supabase
      .from("sessions")
      .select("*", { count: 'exact', head: true })
      .eq("created_by", user.id);

    const { count: respondedCount } = await supabase
      .from("responses")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      activities: allActivities,
      metadata: {
        total_activities: allActivities.length,
        created_sessions_count: createdCount || 0,
        responded_sessions_count: respondedCount || 0,
        filter,
        limit,
        offset,
        has_more: filter === 'all' 
          ? (createdCount || 0) + (respondedCount || 0) > offset + limit
          : filter === 'created' 
            ? (createdCount || 0) > offset + limit
            : (respondedCount || 0) > offset + limit
      }
    });
  } catch (error: any) {
    console.error("GET /api/users/activity error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status }
    );
  }
}