"use client";

import { useState } from "react";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileInfoProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  } | null;
  profile: {
    name: string;
    role: "normal_user" | "super_admin" | "cred_manager" | null;
    approved: boolean | null;
  } | null;
}

export function ProfileInfo({ user, profile }: ProfileInfoProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Safe data extraction with fallbacks
  const displayName = profile?.name || 
                     user?.user_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     'Not provided';
  
  const displayEmail = user?.email || 'Not provided';
  
  const displayRole = profile?.role || 'normal_user';
  
  const approvalStatus = profile?.approved ? 'Approved' : 'Pending';

  const getRoleDisplay = (role: "normal_user" | "super_admin" | "cred_manager" | null) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'cred_manager':
        return 'Credential Manager';
      case 'normal_user':
      default:
        return 'User';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{displayEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Name</p>
              <p className="text-sm text-gray-600">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Role</p>
              <p className="text-sm text-gray-600">{getRoleDisplay(displayRole)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                profile?.approved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {approvalStatus}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </CardContent>
      </Card>

      {!profile?.approved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="h-5 w-5" />
              <p className="text-sm">
                Your account is pending approval. Please contact an administrator to gain full access.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}