import { createClient } from "@/lib/supabase/client";
import { parseApiError } from "@/lib/utils/errors";
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
    try {
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
        console.error('Error fetching sessions:', error);
        const parsedError = parseApiError(error);
        throw new Error(parsedError.message);
      }

      return data as SessionWithDetails[];
    } catch (error: any) {
      console.error('SessionService.getSessions error:', error);
      const parsedError = parseApiError(error);
      throw new Error(parsedError.message);
    }
  }

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
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();

      if (userError || !user) {
        const error = parseApiError({ status: 401, message: "Authentication required" });
        throw new Error(error.message);
      }

      // Use the API endpoint instead of direct Supabase call for consistency
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = parseApiError({ 
          status: response.status, 
          message: errorData.error || 'Failed to update response' 
        });
        throw new Error(error.message);
      }

      const { response: data } = await response.json();
      return data;
    } catch (error: any) {
      console.error('SessionService.updateSessionResponse error:', error);
      const parsedError = parseApiError(error);
      throw new Error(parsedError.message);
    }
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