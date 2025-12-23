"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateSessionDialog } from "@/components/CreateSessionDialog";
import { SessionCard } from "@/components/session/SessionCard";
import { useSessions } from "@/lib/hooks/useSessions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";

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
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}