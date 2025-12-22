import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SessionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.profile?.approved) {
    redirect("/pending-approval");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="mt-2 text-gray-600">
            Manage your badminton sessions and availability
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Authentication Test Successful!
                </h3>
                <p className="mt-2 text-gray-600">
                  Welcome,{" "}
                  <span className="font-medium">{user.profile?.name}</span>!
                </p>
                <div className="mt-4 space-y-1 text-sm text-gray-500">
                  <p>Email: {user.profile?.email}</p>
                  <p>Role: {user.profile?.role}</p>
                  <p>
                    Status:{" "}
                    {user.profile?.approved ? "Approved" : "Pending Approval"}
                  </p>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    Phase 2 (Authentication) is working correctly! 🎉
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Sessions list will be implemented in Phase 3
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
