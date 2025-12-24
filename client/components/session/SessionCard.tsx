"use client";

import { format } from "date-fns";
import { MapPin, Clock, Users, Calendar, MoreHorizontal, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  responses: Array<{
    user_id: string;
    status: "COMING" | "NOT_COMING" | "TENTATIVE";
    user: {
      name: string;
    };
  }>;
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
  const [showParticipants, setShowParticipants] = useState(false);
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

  // Group responses by status
  const comingUsers = session.responses?.filter(r => r.status === "COMING").map(r => r.user.name) || [];
  const tentativeUsers = session.responses?.filter(r => r.status === "TENTATIVE").map(r => r.user.name) || [];
  const notComingUsers = session.responses?.filter(r => r.status === "NOT_COMING").map(r => r.user.name) || [];

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
    <Card className={`w-full ${!session.user_response ? "ring-2 ring-orange-200 bg-orange-50/50" : ""}`}>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg leading-tight">
              {session.title || "Badminton Session"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">
                Created by {session.created_by.name || "Unknown"}
              </span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Date/Day Display - Stacked on mobile */}
            <div className="text-right text-xs sm:text-sm text-muted-foreground">
              <div className="font-medium">{format(startTime, "MMM d")}</div>
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

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Session Details - Compact layout for mobile */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{session.location}</span>
          </div>

          {session.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>

        {/* Response Counts - More compact on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-muted/50 rounded-lg gap-2">
          {/* Response counts - Stack on very small screens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{session.response_counts.COMING} Coming</span>
              {showParticipants ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-1 hover:text-yellow-600 transition-colors"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{session.response_counts.TENTATIVE} Maybe</span>
            </button>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{session.response_counts.NOT_COMING} Not coming</span>
            </button>
          </div>

          {/* Courts info */}
          <div className="flex items-center justify-between sm:block sm:text-right text-xs sm:text-sm">
            <div className="font-medium">
              {courts} court{courts !== 1 ? "s" : ""}
            </div>
            <div className={`text-xs ${getStatusColor(playability.status)}`}>
              {playability.message}
            </div>
          </div>
        </div>

        {/* Participants List - Collapsible */}
        {showParticipants && (
          <div className="space-y-2 p-3 bg-white border rounded-lg text-xs sm:text-sm">
            {comingUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-700">Coming ({comingUsers.length})</span>
                </div>
                <div className="ml-4 text-muted-foreground">
                  {comingUsers.join(", ")}
                </div>
              </div>
            )}
            {tentativeUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-700">Maybe ({tentativeUsers.length})</span>
                </div>
                <div className="ml-4 text-muted-foreground">
                  {tentativeUsers.join(", ")}
                </div>
              </div>
            )}
            {notComingUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-700">Not coming ({notComingUsers.length})</span>
                </div>
                <div className="ml-4 text-muted-foreground">
                  {notComingUsers.join(", ")}
                </div>
              </div>
            )}
            {comingUsers.length === 0 && tentativeUsers.length === 0 && notComingUsers.length === 0 && (
              <div className="text-muted-foreground text-center py-2">
                No responses yet
              </div>
            )}
          </div>
        )}

        {/* Current Response Indicator - Show prominently if no response */}
        {!session.user_response && (
          <div className="text-center p-2 bg-orange-100 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-800 font-medium">
              ⚠️ Please respond to this session
            </p>
          </div>
        )}

        {/* Response Controls */}
        <div className="space-y-2">
          {isResponseDisabled && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Response deadline has passed
            </p>
          )}
          <ResponseControls
            sessionId={session.id}
            currentResponse={session.user_response}
            disabled={isResponseDisabled}
          />
        </div>

        {/* Current Response Indicator - Smaller when response exists */}
        {session.user_response && (
          <div className="text-center text-xs sm:text-sm">
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
