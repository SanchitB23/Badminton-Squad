"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CreateSessionDialog } from "@/components/CreateSessionDialog";
import { SessionCard } from "@/components/session/SessionCard";
import { SessionFilters, type SessionFilter } from "@/components/session/SessionFilters";
import { useSessions } from "@/lib/hooks/useSessions";
import { getCurrentUser } from "@/lib/auth";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
  const [filters, setFilters] = useState<SessionFilter>({
    status: 'all',
    sort: 'start_time',
    sortOrder: 'asc',
  });
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const { data: sessions, isLoading, error } = useSessions();

  // Handle edit session
  const handleEditSession = (sessionId: string) => {
    router.push(`/dashboard/session/${sessionId}/edit`);
  };

  // Handle delete session
  const handleDeleteSession = (sessionId: string) => {
    setDeleteSessionId(sessionId);
  };

  // Confirm delete session
  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${deleteSessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Refresh sessions list
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error deleting session:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsDeleting(false);
      setDeleteSessionId(null);
    }
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!sessions || !user) return [];

    let filtered = [...sessions];

    // Apply status filter
    switch (filters.status) {
      case 'responded':
        filtered = filtered.filter(session => 
          session.user_response !== null && session.user_response !== undefined
        );
        break;
      case 'not_responded':
        filtered = filtered.filter(session => 
          !session.user_response
        );
        break;
      case 'created_by_me':
        filtered = filtered.filter(session => 
          session.created_by.id === user.id
        );
        break;
      // 'all' case - no filtering needed
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (filters.sort) {
        case 'start_time':
          valueA = new Date(a.start_time);
          valueB = new Date(b.start_time);
          break;
        case 'created_at':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        case 'response_count':
          valueA = a.response_counts.COMING + a.response_counts.TENTATIVE + a.response_counts.NOT_COMING;
          valueB = b.response_counts.COMING + b.response_counts.TENTATIVE + b.response_counts.NOT_COMING;
          break;
        default:
          return 0;
      }

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sessions, filters, user]);

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

        <SessionFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalSessions={sessions?.length || 0}
          filteredCount={filteredSessions.length}
        />

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
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions match your filters
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more sessions.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ status: 'all', sort: 'start_time', sortOrder: 'asc' })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={user.id}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this session? This action cannot be undone.
                All responses and comments will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteSession}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Session'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}