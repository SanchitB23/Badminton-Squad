"use client";

import { format } from "date-fns";
import { MapPin, Clock, Users, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { calculateCourts, getPlayabilityStatus } from "@/lib/utils/courts";

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
  recommended_courts: number;
  user_response?: "COMING" | "NOT_COMING" | "TENTATIVE" | null;
  created_at: string;
}

interface SessionCardProps {
  session: Session;
  currentUserId?: string;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

export function SessionCard({ session, currentUserId, onEdit, onDelete }: SessionCardProps) {
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const courts = calculateCourts(session.response_counts.COMING);
  const playability = getPlayabilityStatus(session.response_counts.COMING);

  // Check if response cutoff has passed (T-1 day midnight IST)
  const cutoffTime = new Date(startTime);
  cutoffTime.setDate(cutoffTime.getDate() - 1);
  cutoffTime.setHours(0, 0, 0, 0);
  const isResponseDisabled = new Date() >= cutoffTime;

  // Check if current user is the session creator
  const isCreator = currentUserId === session.created_by.id;
  
  // Check if session can be edited (not on same day)
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {session.title || "Badminton Session"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Users className="h-4 w-4" />
              Created by {session.created_by.name || "Unknown"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-muted-foreground">
              <div>{format(startTime, "MMM d")}</div>
              <div>{format(startTime, "EEE")}</div>
            </div>
            
            {/* Session Actions Dropdown - Only show for session creator */}
            {isCreator && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(session.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="space-y-2">
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
            <p className="text-sm text-muted-foreground mt-2">
              {session.description}
            </p>
          )}
        </div>

        {/* Response Counts */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{session.response_counts.COMING} Coming</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{session.response_counts.TENTATIVE} Maybe</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{session.response_counts.NOT_COMING} Not coming</span>
            </div>
          </div>

          <div className="text-right text-sm">
            <div className="font-medium">
              {courts} court{courts !== 1 ? "s" : ""}
            </div>
            <div className={`text-xs ${getStatusColor(playability.status)}`}>
              {playability.message}
            </div>
          </div>
        </div>

        {/* Response Controls */}
        <div className="space-y-2">
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
  );
}
