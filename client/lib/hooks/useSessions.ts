import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SessionService } from "@/lib/services/session";
import type { CreateSessionInput, CreateCommentInput } from "@/lib/validations/session";

const sessionService = new SessionService();

export const QUERY_KEYS = {
  sessions: ["sessions"] as const,
  session: (id: string) => ["sessions", id] as const,
  comments: (sessionId: string) => ["sessions", sessionId, "comments"] as const,
};

// Sessions queries with real-time updates
export function useSessions() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: () => sessionService.getSessions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    // Set up real-time subscriptions for sessions and responses
    const sessionsSubscription = supabase
      .channel('sessions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sessions' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsSubscription);
    };
  }, [queryClient, supabase]);

  return query;
}

export function useSession(id: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => sessionService.getSession(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  useEffect(() => {
    if (!id) return;

    const sessionSubscription = supabase
      .channel(`session-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(id) });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'responses', filter: `session_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(id) });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSubscription);
    };
  }, [id, queryClient, supabase]);

  return query;
}

export function useSessionComments(sessionId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.comments(sessionId),
    queryFn: () => sessionService.getSessionComments(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  });

  useEffect(() => {
    if (!sessionId) return;

    const commentsSubscription = supabase
      .channel(`comments-${sessionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `session_id=eq.${sessionId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments(sessionId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [sessionId, queryClient, supabase]);

  return query;
}

// Session mutations
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionInput) => sessionService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
  });
}

export function useUpdateSessionResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: 'COMING' | 'NOT_COMING' | 'TENTATIVE' }) =>
      sessionService.updateSessionResponse(sessionId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(variables.sessionId) });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ session_id, content, parent_comment_id }: CreateCommentInput) =>
      sessionService.addComment(session_id, content, parent_comment_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments(variables.session_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(variables.session_id) });
    },
  });
}