import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  approved: boolean;
  created_at: string;
}

async function approveUser(userId: string) {
  "use server";

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ approved: true })
    .eq("id", userId);

  if (error) {
    console.error("Error approving user:", error);
  }
}

async function rejectUser(userId: string) {
  "use server";

  const supabase = await createClient();

  // For now, we just mark as not approved
  // In the future, could add a rejected status
  const { error } = await supabase
    .from("profiles")
    .update({ approved: false })
    .eq("id", userId);

  if (error) {
    console.error("Error rejecting user:", error);
  }
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved || profile.role !== "super_admin") {
    redirect("/dashboard/sessions");
  }

  // Fetch all users
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return <div>Error loading users</div>;
  }

  const pendingUsers = users?.filter((u) => !u.approved) || [];
  const approvedUsers = users?.filter((u) => u.approved) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {/* Pending Approvals */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Pending Approvals ({pendingUsers.length})
        </h2>

        {pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user: User) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{user.name}</span>
                    <div className="flex gap-2">
                      <form action={approveUser.bind(null, user.id)}>
                        <Button type="submit" size="sm" variant="default">
                          Approve
                        </Button>
                      </form>
                      <form action={rejectUser.bind(null, user.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {user.email} {user.phone && `• ${user.phone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Approved Users ({approvedUsers.length})
        </h2>

        <div className="grid gap-4">
          {approvedUsers.map((user: User) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{user.name}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {user.role.replace("_", " ").toUpperCase()}
                  </span>
                </CardTitle>
                <CardDescription>
                  {user.email} {user.phone && `• ${user.phone}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Approved: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
