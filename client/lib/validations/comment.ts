import { z } from "zod";

// Comment validation schema
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment must be less than 1000 characters")
    .transform((val) => val.trim()),
  parent_comment_id: z.string().uuid().optional(),
});

// Comment creation input type
export type CreateCommentInput = z.infer<typeof commentSchema>;

// Comment update schema (only content can be updated)
export const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment must be less than 1000 characters")
    .transform((val) => val.trim()),
});

export type UpdateCommentInput = z.infer<typeof commentUpdateSchema>;

// Comment response type (from database)
export interface Comment {
  id: string;
  content: string;
  session_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
  user: {
    id: string;
    name: string;
  };
  replies?: Comment[];
}

// Sanitization helper
export function sanitizeComment(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .slice(0, 1000); // Ensure max length
}

// Validation helpers
export function validateCommentDepth(comments: Comment[], maxDepth: number = 3): boolean {
  function getDepth(comment: Comment, currentDepth: number = 0): number {
    if (!comment.replies || comment.replies.length === 0) {
      return currentDepth;
    }
    
    return Math.max(
      ...comment.replies.map(reply => getDepth(reply, currentDepth + 1))
    );
  }
  
  return comments.every(comment => getDepth(comment) <= maxDepth);
}

export function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];
  
  // First pass: create map and initialize replies arrays
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });
  
  // Second pass: build the tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies!.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });
  
  // Sort comments by creation date (oldest first for threading)
  const sortComments = (comments: Comment[]): Comment[] => {
    return comments
      .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime())
      .map(comment => ({
        ...comment,
        replies: comment.replies ? sortComments(comment.replies) : []
      }));
  };
  
  return sortComments(rootComments);
}