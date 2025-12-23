import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionService } from "@/lib/services/session";
import type { CreateSessionInput, UpdateSessionResponseInput, CreateCommentInput } from "@/lib/validations/session";

const sessionService = new SessionService();

export const QUERY_KEYS = {
  sessions: ["sessions"] as const,
  session: (id: string) => ["sessions", id] as const,
  comments: (sessionId: string) => ["sessions", sessionId, "comments"] as const,
};

// Sessions queries
export function useSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: () => sessionService.getSessions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => sessionService.getSession(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSessionComments(sessionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.comments(sessionId),
    queryFn: () => sessionService.getSessionComments(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  });
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
    mutationFn: ({ session_id, status }: UpdateSessionResponseInput) =>
      sessionService.updateSessionResponse(session_id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(variables.session_id) });
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