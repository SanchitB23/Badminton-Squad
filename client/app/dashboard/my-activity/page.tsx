"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
  User, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Activity,
  Filter,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock3,
  Plus,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

interface ActivityItem {
  id: string;
  title?: string;
  description?: string;
  location: string;
  start_time: string;
  end_time: string;
  created_at: string;
  created_by: {
    id: string;
    name?: string;
  };
  response_counts?: {
    COMING: number;
    TENTATIVE: number;
    NOT_COMING: number;
  };
  user_response?: "COMING" | "NOT_COMING" | "TENTATIVE";
  activity_type: 'created' | 'responded';
  activity_date: string;
  response_id?: string;
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

interface ActivityMetadata {
  total_activities: number;
  created_sessions_count: number;
  responded_sessions_count: number;
  filter: string;
  limit: number;
  offset: number;
  has_more: boolean;
}

export default function MyActivityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [metadata, setMetadata] = useState<ActivityMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'created' | 'responded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      setUser(currentUser);
    };

    checkAuth();
  }, []);

  const fetchActivities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter: filter,
        limit: '50',
        offset: '0',
      });

      const response = await fetch(`/api/users/activity?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const { activities, metadata } = await response.json();
      setActivities(activities || []);
      setMetadata(metadata);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load your activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, filter]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  // Filter activities by search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities;
    
    const term = searchTerm.toLowerCase();
    return activities.filter(activity => 
      (activity.title || '').toLowerCase().includes(term) ||
      activity.location.toLowerCase().includes(term) ||
      (activity.description || '').toLowerCase().includes(term) ||
      activity.created_by.name?.toLowerCase().includes(term)
    );
  }, [activities, searchTerm]);

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'COMING':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'TENTATIVE':
        return <Clock3 className="h-4 w-4 text-yellow-600" />;
      case 'NOT_COMING':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getResponseText = (response: string) => {
    switch (response) {
      case 'COMING': return 'Coming';
      case 'TENTATIVE': return 'Maybe';
      case 'NOT_COMING': return 'Not coming';
      default: return 'No response';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation 
        userName={user.profile?.name}
        onSignOut={handleSignOut}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-8 w-8" />
              My Activity
            </h1>
            <p className="mt-2 text-gray-600">
              Track your session creations and responses
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/dashboard/create-session">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {metadata && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Sessions Created</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metadata.created_sessions_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Sessions Responded</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metadata.responded_sessions_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Activities</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metadata.created_sessions_count + metadata.responded_sessions_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Activity Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filter} onValueChange={(value: 'all' | 'created' | 'responded') => setFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="created">Created Sessions</SelectItem>
                    <SelectItem value="responded">Responded Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {filteredActivities.length > 0 
                ? `Showing ${filteredActivities.length} ${filter === 'all' ? 'activities' : filter === 'created' ? 'created sessions' : 'responded sessions'}`
                : 'No activities found'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-gray-600">Loading activities...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg font-medium mb-2">
                  Error loading activities
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchActivities}>Try Again</Button>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching activities' : 'No activities yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : filter === 'created' 
                      ? 'Create your first session to see it here'
                      : filter === 'responded'
                        ? 'Respond to sessions to see your activity'
                        : 'Create sessions or respond to existing ones to see your activity'
                  }
                </p>
                {!searchTerm && (
                  <Link href={filter === 'created' ? '/dashboard/create-session' : '/dashboard/sessions'}>
                    <Button>
                      {filter === 'created' ? 'Create Session' : 'View Sessions'}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={`${activity.activity_type}-${activity.id}-${activity.response_id || 'created'}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {activity.title || 'Badminton Session'}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.activity_type === 'created' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.activity_type === 'created' ? 'Created' : 'Responded'}
                          </div>
                          {activity.user_response && (
                            <div className="flex items-center gap-1">
                              {getResponseIcon(activity.user_response)}
                              <span className="text-xs text-gray-600">
                                {getResponseText(activity.user_response)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(activity.start_time), "MMM d, yyyy 'at' h:mm a")} - {format(new Date(activity.end_time), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{activity.location}</span>
                          </div>
                          {activity.description && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 mt-0.5" />
                              <span className="line-clamp-2">{activity.description}</span>
                            </div>
                          )}
                          {activity.response_counts && (
                            <div className="flex items-center gap-4 pt-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{activity.response_counts.COMING} coming</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>{activity.response_counts.TENTATIVE} maybe</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>{activity.response_counts.NOT_COMING} not coming</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-500 ml-4">
                        <div>
                          {activity.activity_type === 'created' ? 'Created' : 'Responded'} {format(new Date(activity.activity_date), "MMM d")}
                        </div>
                        <Link href={`/dashboard/session/${activity.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}