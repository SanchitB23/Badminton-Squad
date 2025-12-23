"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { commentSchema, type CreateCommentInput } from "@/lib/validations/comment";
import { handleApiError } from "@/lib/utils/error-handling";
import { Loader2, Send, X } from "lucide-react";

interface CommentFormProps {
  sessionId: string;
  parentCommentId?: string;
  initialContent?: string;
  mode?: 'create' | 'edit' | 'reply';
  commentId?: string;
  onSuccess?: (comment?: any) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  sessionId,
  parentCommentId,
  initialContent = "",
  mode = 'create',
  commentId,
  onSuccess,
  onCancel,
  placeholder
}: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialContent,
      parent_comment_id: parentCommentId,
    },
  });

  const onSubmit = async (data: CreateCommentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (mode === 'edit' && commentId) {
        // Update existing comment
        response = await fetch(`/api/sessions/${sessionId}/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: data.content }),
        });
      } else {
        // Create new comment or reply
        response = await fetch(`/api/sessions/${sessionId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: data.content,
            parent_comment_id: parentCommentId || undefined,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${mode} comment`);
      }

      const result = await response.json();
      
      // Reset form if creating new comment
      if (mode !== 'edit') {
        form.reset();
      }
      
      onSuccess?.(result.comment);
    } catch (error: any) {
      console.error(`Error ${mode}ing comment:`, error);
      setError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case 'edit': return 'Updating...';
        case 'reply': return 'Replying...';
        default: return 'Posting...';
      }
    }
    
    switch (mode) {
      case 'edit': return 'Update Comment';
      case 'reply': return 'Reply';
      default: return 'Post Comment';
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (mode) {
      case 'edit': return 'Edit your comment...';
      case 'reply': return 'Write your reply...';
      default: return 'Share your thoughts about this session...';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Comment Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={getPlaceholder()}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Character Count */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {form.watch('content')?.length || 0}/1000 characters
          </div>
          {mode !== 'create' && (
            <div className="text-gray-500">
              {mode === 'edit' ? 'Edit within 24 hours of posting' : 'Reply to this comment'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !form.watch('content')?.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {getSubmitButtonText()}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                {getSubmitButtonText()}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}