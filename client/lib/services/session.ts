import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Session = Database["public"]["Tables"]["sessions"]["Row"];
type SessionWithDetails = Session & {
  creator: {
    name: string;
    email: string;
  };
  responses: Array<{
    user_id: string;
    status: "COMING" | "NOT_COMING" | "TENTATIVE";
    user: {
      name: string;
    };
  }>;
  comments_count: number;
};

type SessionResponse = Database["public"]["Tables"]["responses"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  user: {
    name: string;
  };
};

export class SessionService {
  private supabase = createClient();

  async getSessions(): Promise<SessionWithDetails[]> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select(`
        *,
        creator:profiles!sessions_created_by_fkey (
          name,
          email
        ),
        responses:responses (
          user_id,
          status,
          user:profiles!session_responses_user_id_fkey (
            name
          )
        ),
        comments (count)
      `)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data.map(session => ({
      ...session,
      comments_count: session.comments?.[0]?.count || 0,
    }));
  }

  async getSession(id: string): Promise<SessionWithDetails | null> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select(`
        *,
        creator:profiles!sessions_created_by_fkey (
          name,
          email
        ),
        responses:responses (
          user_id,
          status,
          user:profiles!s_user_id_fkey (
            name
          )
        ),
        comments (count)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return {
      ...data,
      comments_count: data.comments?.[0]?.count || 0,
    };
  }

  async createSession(sessionData: {
    title?: string;
    description?: string;
    location: string;
    start_time: string;
    end_time: string;
  }): Promise<Session> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to create a session");
    }

    const { data, error } = await this.supabase
      .from("sessions")
      .insert({
        ...sessionData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  async updateSessionResponse(
    sessionId: string,
    status: "COMING" | "NOT_COMING" | "TENTATIVE"
  ): Promise<SessionResponse> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to respond to a session");
    }

    const { data, error } = await this.supabase
      .from("responses")
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update response: ${error.message}`);
    }

    return data;
  }

  async getSessionComments(sessionId: string): Promise<Comment[]> {
    const { data, error } = await this.supabase
      .from("comments")
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          name
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return data;
  }

  async addComment(
    sessionId: string,
    content: string,
    parentCommentId?: string
  ): Promise<Comment> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to add a comment");
    }

    const { data, error } = await this.supabase
      .from("comments")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        content,
        parent_comment_id: parentCommentId,
      })
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    return data;
  }
}