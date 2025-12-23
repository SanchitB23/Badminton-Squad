import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { commentUpdateSchema } from "@/lib/validations/comment";
import { parseApiError } from "@/lib/utils/errors";

// PUT - Update comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
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
    const validationResult = commentUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // Fetch comment and verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("id, user_id, session_id, created_at")
      .eq("id", commentId)
      .eq("session_id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    // Check if comment is not too old (e.g., 24 hours edit window)
    const commentAge = Date.now() - new Date(comment.created_at || Date.now()).getTime();
    const maxEditAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (commentAge > maxEditAge) {
      return NextResponse.json(
        { error: "Comment is too old to edit (24 hour limit)" },
        { status: 400 }
      );
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
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

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    console.error("PUT /api/sessions/[id]/comments/[commentId] error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch comment and verify ownership or moderation rights
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select(`
        id,
        user_id,
        session_id,
        session:sessions!comments_session_id_fkey (
          id,
          created_by
        )
      `)
      .eq("id", commentId)
      .eq("session_id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user can delete: own comment OR session creator (moderation)
    const canDelete = comment.user_id === user.id || comment.session.created_by === user.id;

    if (!canDelete) {
      return NextResponse.json(
        { error: "You can only delete your own comments or moderate comments on your sessions" },
        { status: 403 }
      );
    }

    // Delete comment (cascade deletion of replies handled by DB constraints)
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/sessions/[id]/comments/[commentId] error:", error);
    const apiError = parseApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: 500 }
    );
  }
}