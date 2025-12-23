"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  Reply, 
  Edit, 
  Trash2, 
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentForm } from "./CommentForm";
import type { Comment } from "@/lib/validations/comment";

interface CommentThreadProps {
  comments: Comment[];
  sessionId: string;
  currentUserId: string;
  sessionCreatorId: string;
  onCommentUpdate?: () => void;
  depth?: number;
  maxDepth?: number;
}

interface CommentItemProps {
  comment: Comment;
  sessionId: string;
  currentUserId: string;
  sessionCreatorId: string;
  onCommentUpdate?: () => void;
  depth?: number;
  maxDepth?: number;
}

function CommentItem({
  comment,
  sessionId,
  currentUserId,
  sessionCreatorId,
  onCommentUpdate,
  depth = 0,
  maxDepth = 3
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnComment = comment.user_id === currentUserId;
  const isSessionCreator = currentUserId === sessionCreatorId;
  const canModerate = isOwnComment || isSessionCreator;
  const canReply = depth < maxDepth;
  
  // Check if comment can be edited (24 hour window)
  const commentAge = Date.now() - new Date(comment.created_at).getTime();
  const maxEditAge = 24 * 60 * 60 * 1000; // 24 hours
  const canEdit = isOwnComment && commentAge <= maxEditAge;

  const handleReplySuccess = () => {
    setIsReplying(false);
    onCommentUpdate?.();
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onCommentUpdate?.();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onCommentUpdate?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      // TODO: Show error toast
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : '';
  
  return (
    <div className={`${indentClass}`}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.user.name}
            </span>
            {currentUserId === sessionCreatorId && comment.user_id === sessionCreatorId && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <CommentForm
                sessionId={sessionId}
                mode="edit"
                commentId={comment.id}
                initialContent={comment.content}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
                placeholder="Edit your comment..."
              />
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-1 mt-2">
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {canModerate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit comment
                        </DropdownMenuItem>
                      )}
                      {canEdit && (
                        <DropdownMenuSeparator />
                      )}
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete comment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Reply Form */}
              {isReplying && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <CommentForm
                    sessionId={sessionId}
                    parentCommentId={comment.id}
                    mode="reply"
                    onSuccess={handleReplySuccess}
                    onCancel={() => setIsReplying(false)}
                    placeholder={`Reply to ${comment.user.name}...`}
                  />
                </div>
              )}
            </>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <CommentThread
                comments={comment.replies}
                sessionId={sessionId}
                currentUserId={currentUserId}
                sessionCreatorId={sessionCreatorId}
                onCommentUpdate={onCommentUpdate}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Comment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? 
              {comment.replies && comment.replies.length > 0 && (
                <span className="font-medium text-red-600">
                  {" "}This will also delete all {comment.replies.length} replies.
                </span>
              )}
              {" "}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Comment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CommentThread({
  comments,
  sessionId,
  currentUserId,
  sessionCreatorId,
  onCommentUpdate,
  depth = 0,
  maxDepth = 3
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          sessionId={sessionId}
          currentUserId={currentUserId}
          sessionCreatorId={sessionCreatorId}
          onCommentUpdate={onCommentUpdate}
          depth={depth}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  );
}