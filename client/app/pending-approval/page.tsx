import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Pending Approval
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your account is awaiting approval from a super admin.
                  You&apos;ll receive access once approved.
                </p>
                <p className="mt-4 text-xs text-gray-500">
                  Please contact your group admin or check back later.
                </p>
              </div>
              <div className="space-y-3">
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </form>
                <Link
                  href="/"
                  className="block text-sm text-primary hover:text-primary/90"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
