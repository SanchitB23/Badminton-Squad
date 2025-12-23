"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  MessageSquare,
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ResponseControls } from "@/components/response/ResponseControls";
import { CommentThread } from "@/components/comments/CommentThread";
import { CommentForm } from "@/components/comments/CommentForm";
import { calculateCourts, getPlayabilityStatus } from "@/lib/utils/courts";
import { getCurrentUser } from "@/lib/auth";
import type { Comment } from "@/lib/validations/comment";

interface Session {
  id: string;
  title?: string;
  description?: string;
  location: string;
  start_time: string;
  end_time: string;
  created_by: {
    id: string;
    name?: string;
  };
  response_counts: {
    COMING: number;
    TENTATIVE: number;
    NOT_COMING: number;
  };
  user_response?: "COMING" | "NOT_COMING" | "TENTATIVE" | null;
  created_at: string;
}

interface User {
  id: string;
  profile: {
    name: string;
    email: string;
    approved: boolean;
    role: string;
  } | null;
}

export default function SessionDetailPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/comments`);
      if (response.ok) {
        const { comments } = await response.json();
        setComments(comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // Fetch session details
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Session not found");
          } else {
            setError("Failed to load session");
          }
          return;
        }

        const { session } = await response.json();
        setSession(session);

        // Fetch comments after session loads successfully
        await fetchComments();
      } catch (error) {
        console.error('Error fetching session:', error);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !session || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard/sessions">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sessions
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-medium mb-2">
                  {error || "Session not found"}
                </div>
                <p className="text-gray-600 mb-6">
                  The session you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Link href="/dashboard/sessions">
                  <Button>Return to Sessions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const courts = calculateCourts(session.response_counts.COMING);
  const playability = getPlayabilityStatus(session.response_counts.COMING);

  // Check if response cutoff has passed
  const cutoffTime = new Date(startTime);
  cutoffTime.setDate(cutoffTime.getDate() - 1);
  cutoffTime.setHours(0, 0, 0, 0);
  const isResponseDisabled = new Date() >= cutoffTime;

  // Check permissions
  const isCreator = user.id === session.created_by.id;
  const sessionDate = new Date(session.start_time);
  const today = new Date();
  const isSameDay = sessionDate.toDateString() === today.toDateString();
  const canEdit = isCreator && !isSameDay;

  const getStatusColor = (status: typeof playability.status) => {
    switch (status) {
      case "insufficient":
        return "text-red-600";
      case "minimum":
        return "text-yellow-600";
      case "good":
        return "text-blue-600";
      case "excellent":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/sessions">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sessions
            </Button>
          </Link>
        </div>

        {/* Session Details Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {session.title || "Badminton Session"}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <Users className="h-4 w-4" />
                  Created by {session.created_by.name || "Unknown"}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right text-sm text-muted-foreground">
                  <div>{format(startTime, "MMM d, yyyy")}</div>
                  <div>{format(startTime, "EEEE")}</div>
                </div>
                
                {/* Session Actions Dropdown */}
                {isCreator && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={!canEdit}
                        asChild={canEdit}
                      >
                        {canEdit ? (
                          <Link href={`/dashboard/session/${session.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit session
                          </Link>
                        ) : (
                          <div className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit session</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Same day)
                            </span>
                          </div>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{session.location}</span>
              </div>

              {session.description && (
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-gray-700">{session.description}</p>
                </div>
              )}
            </div>

            {/* Response Counts */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{session.response_counts.COMING} Coming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">{session.response_counts.TENTATIVE} Maybe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">{session.response_counts.NOT_COMING} Not coming</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">
                  {courts} court{courts !== 1 ? "s" : ""}
                </div>
                <div className={`text-sm ${getStatusColor(playability.status)}`}>
                  {playability.message}
                </div>
              </div>
            </div>

            {/* Response Controls */}
            <div className="space-y-3">
              {isResponseDisabled && (
                <p className="text-sm text-muted-foreground text-center">
                  Response deadline has passed
                </p>
              )}
              <ResponseControls
                sessionId={session.id}
                currentResponse={session.user_response}
                disabled={isResponseDisabled}
              />
            </div>

            {/* Current Response Indicator */}
            {session.user_response && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Your response: </span>
                <span
                  className={`font-medium ${
                    session.user_response === "COMING"
                      ? "text-green-600"
                      : session.user_response === "TENTATIVE"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {session.user_response === "COMING"
                    ? "Coming"
                    : session.user_response === "TENTATIVE"
                    ? "Maybe"
                    : "Not coming"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion
              {comments.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({comments.reduce((total, comment) => {
                    const countReplies = (c: Comment): number => 
                      1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
                    return total + countReplies(comment);
                  }, 0)} {comments.reduce((total, comment) => {
                    const countReplies = (c: Comment): number => 
                      1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
                    return total + countReplies(comment);
                  }, 0) === 1 ? 'comment' : 'comments'})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Chat about this session with other participants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Comment Form */}
            <div>
              <CommentForm
                sessionId={sessionId}
                onSuccess={fetchComments}
                placeholder="Share your thoughts about this session..."
              />
            </div>

            {/* Comments Thread */}
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-gray-600">Loading comments...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <CommentThread
                    comments={comments}
                    sessionId={sessionId}
                    currentUserId={user.id}
                    sessionCreatorId={session.created_by.id}
                    onCommentUpdate={fetchComments}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No comments yet</p>
                <p className="text-sm">Be the first to start a discussion about this session!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}