import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, commentUpdateSchema, buildCommentTree } from "@/lib/validations/comment";
import { parseApiError } from "@/lib/utils/errors";

// GET - Fetch comments for a session
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

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", id)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Fetch comments with user information
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        session_id,
        user_id,
        parent_comment_id,
        created_at,
        updated_at,
        user:profiles!comments_user_id_fkey (
          id,
          name
        )
      `)
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Build comment tree structure
    const commentTree = buildCommentTree(comments || []);

    return NextResponse.json({ comments: commentTree });
  } catch (error: any) {
    console.error("GET /api/sessions/[id]/comments error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: 500 }
    );
  }
}

// POST - Create new comment
export async function POST(
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
    const validationResult = commentSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { content, parent_comment_id } = validationResult.data;

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", id)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // If replying to a comment, verify parent exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from("comments")
        .select("id, session_id")
        .eq("id", parent_comment_id)
        .single();

      if (parentError || parentComment.session_id !== id) {
        return NextResponse.json(
          { error: "Parent comment not found or belongs to different session" },
          { status: 400 }
        );
      }
    }

    // Create comment
    const { data: newComment, error: createError } = await supabase
      .from("comments")
      .insert({
        content,
        session_id: id,
        user_id: user.id,
        parent_comment_id: parent_comment_id || null,
      })
      .select(`
        id,
        content,
        session_id,
        user_id,
        parent_comment_id,
        created_at,
        updated_at,
        user:profiles!comments_user_id_fkey (
          id,
          name
        )
      `)
      .single();

    if (createError) {
      console.error("Database create error:", createError);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/sessions/[id]/comments error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: 500 }
    );
  }
}