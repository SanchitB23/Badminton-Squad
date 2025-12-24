"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionForm } from "@/components/session/SessionForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateSessionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/sessions");
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
          <p className="mt-2 text-gray-600">
            Schedule a new badminton session for your group
          </p>
        </div>

        {/* Session Form */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Fill in the details for your badminton session. All times are in IST.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionForm
              onSuccess={handleSuccess}
              onLoadingChange={setIsLoading}
            />
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Tips for creating sessions:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Sessions must be scheduled for future dates</li>
            <li>Start and end times must be on the same day</li>
            <li>Location is required - be specific about the venue</li>
            <li>Title and description are optional but help with organization</li>
            <li>Other users can respond until midnight the day before</li>
          </ul>
        </div>
      </div>
    </div>
  );
}