"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionForm } from "@/components/session/SessionForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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
}

export default function EditSessionPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Session not found");
          } else if (response.status === 403) {
            setError("You don't have permission to edit this session");
          } else {
            setError("Failed to load session");
          }
          return;
        }

        const { session } = await response.json();
        
        // Check if session can be edited (not on same day)
        const sessionDate = new Date(session.start_time);
        const today = new Date();
        const isSameDay = sessionDate.toDateString() === today.toDateString();
        
        if (isSameDay) {
          setError("Sessions cannot be edited on the same day");
          return;
        }

        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const handleSuccess = () => {
    router.push("/dashboard/sessions");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
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
                  {error === "Sessions cannot be edited on the same day" 
                    ? "For safety reasons, sessions cannot be edited on the day they're scheduled."
                    : "The session you're looking for doesn't exist or you don't have permission to edit it."
                  }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/sessions">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sessions
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
          <p className="mt-2 text-gray-600">
            Update your badminton session details
          </p>
        </div>

        {/* Session Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Make changes to your session. Note that sessions cannot be edited on the same day they're scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionForm
              initialData={session}
              mode="edit"
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Editing restrictions:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Sessions cannot be edited on the day they're scheduled</li>
            <li>Only the session creator can edit session details</li>
            <li>Existing responses will be preserved after editing</li>
            <li>Location changes may confuse participants - notify them separately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}