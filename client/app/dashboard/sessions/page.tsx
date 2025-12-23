"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSessionDialog } from "@/components/CreateSessionDialog";
import { useSessions, useUpdateSessionResponse } from "@/lib/hooks/useSessions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";

type User = {
  id: string;
  profile: {
    name: string;
    email: string;
    approved: boolean;
    role: string;
  } | null;
} | null;

export default function SessionsPage() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const { data: sessions, isLoading, error } = useSessions();
  const updateResponse = useUpdateSessionResponse();

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        redirect("/login");
        return;
      }

      if (!currentUser.profile?.approved) {
        redirect("/pending-approval");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleResponseUpdate = async (
    sessionId: string,
    status: "COMING" | "NOT_COMING" | "TENTATIVE"
  ) => {
    try {
      await updateResponse.mutateAsync({ session_id: sessionId, status });
    } catch (error) {
      console.error("Failed to update response:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="mt-2 text-gray-600">
              Manage your badminton sessions and availability
            </p>
          </div>
          <CreateSessionDialog>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </CreateSessionDialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-gray-600">Loading sessions...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-medium mb-2">
                  Error loading sessions
                </div>
                <p className="text-gray-600">
                  Failed to fetch sessions. Please try again.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !sessions || sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first badminton session to get started!
                </p>
                <CreateSessionDialog>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Session
                  </Button>
                </CreateSessionDialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => {
              const userResponse = session.responses.find(
                (r) => r.user_id === user.id
              );
              const comingCount = session.responses.filter(
                (r) => r.status === "COMING"
              ).length;
              const totalResponses = session.responses.length;

              return (
                <Card
                  key={session.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {session.title || "Badminton Session"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Created by {session.creator.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {userResponse ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              userResponse.status === "COMING"
                                ? "bg-green-100 text-green-800"
                                : userResponse.status === "NOT_COMING"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {userResponse.status === "COMING"
                              ? "Coming"
                              : userResponse.status === "NOT_COMING"
                              ? "Not Coming"
                              : "Tentative"}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800">
                            No Response
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {session.description && (
                        <p className="text-gray-600">{session.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(session.start_time), "PPp")} -{" "}
                            {format(new Date(session.end_time), "p")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>
                            {comingCount} coming
                            {totalResponses > comingCount &&
                              ` • ${
                                totalResponses - comingCount
                              } other responses`}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant={
                            userResponse?.status === "COMING"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleResponseUpdate(session.id, "COMING")
                          }
                          disabled={updateResponse.isPending}
                        >
                          {updateResponse.isPending &&
                          updateResponse.variables?.session_id === session.id &&
                          updateResponse.variables?.status === "COMING" ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          Coming
                        </Button>
                        <Button
                          variant={
                            userResponse?.status === "TENTATIVE"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleResponseUpdate(session.id, "TENTATIVE")
                          }
                          disabled={updateResponse.isPending}
                        >
                          {updateResponse.isPending &&
                          updateResponse.variables?.session_id === session.id &&
                          updateResponse.variables?.status === "TENTATIVE" ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          Tentative
                        </Button>
                        <Button
                          variant={
                            userResponse?.status === "NOT_COMING"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleResponseUpdate(session.id, "NOT_COMING")
                          }
                          disabled={updateResponse.isPending}
                        >
                          {updateResponse.isPending &&
                          updateResponse.variables?.session_id === session.id &&
                          updateResponse.variables?.status === "NOT_COMING" ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          Not Coming
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
