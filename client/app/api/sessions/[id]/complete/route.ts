import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { responseStatusToAttendance } from "@/lib/utils/analytics";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { actualAttendees } = await request.json();

    if (typeof actualAttendees !== "number" || actualAttendees < 0) {
      return NextResponse.json(
        { error: "Invalid actual attendees count" },
        { status: 400 }
      );
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user is the session creator
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("created_by")
      .eq("id", id)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.created_by !== user.id) {
      return NextResponse.json(
        { error: "Only session creator can mark session as complete" },
        { status: 403 }
      );
    }

    // Get all responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select("user_id, status")
      .eq("session_id", id);

    if (responsesError) {
      return NextResponse.json(
        { error: "Failed to fetch responses" },
        { status: 500 }
      );
    }

    // Create analytics records for each response
    const analyticsData = responses.map((response: any) => ({
      user_id: response.user_id,
      session_id: id,
      predicted_status: response.status,
      actual_attendance: responseStatusToAttendance(response.status),
      recorded_at: new Date().toISOString(),
    }));

    // Insert analytics data
    const { error: analyticsError } = await supabase
      .from("user_analytics")
      .insert(analyticsData);

    if (analyticsError) {
      return NextResponse.json(
        { error: "Failed to record analytics data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      recordsCreated: analyticsData.length 
    });

  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}