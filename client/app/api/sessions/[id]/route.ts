import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sessionSchema } from "@/lib/validations/session";
import { parseApiError } from "@/lib/utils/errors";

// GET - Fetch single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .select(`
        *,
        created_by:profiles!sessions_created_by_fkey (
          id,
          name
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("GET /api/sessions/[id] error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status }
    );
  }
}

// PUT - Update session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = sessionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { title, description, location, start_time, end_time } = validationResult.data;

    // Check if session exists and user owns it
    const { data: existingSession, error: fetchError } = await supabase
      .from("sessions")
      .select("id, created_by, start_time")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingSession.created_by !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own sessions" },
        { status: 403 }
      );
    }

    // Check if session is on the same day (prevent same-day editing)
    const sessionDate = new Date(existingSession.start_time);
    const today = new Date();
    const isSameDay = sessionDate.toDateString() === today.toDateString();

    if (isSameDay) {
      return NextResponse.json(
        { error: "Sessions cannot be edited on the same day" },
        { status: 400 }
      );
    }

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from("sessions")
      .update({
        title: title || null,
        description: description || null,
        location,
        start_time,
        end_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        created_by:profiles!sessions_created_by_fkey (
          id,
          name
        )
      `)
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error: any) {
    console.error("PUT /api/sessions/[id] error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status }
    );
  }
}

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if session exists and user owns it
    const { data: existingSession, error: fetchError } = await supabase
      .from("sessions")
      .select("id, created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingSession.created_by !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own sessions" },
        { status: 403 }
      );
    }

    // Delete session (cascade deletion of responses and comments handled by DB constraints)
    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/sessions/[id] error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status }
    );
  }
}