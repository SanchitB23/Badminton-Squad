import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileInfo } from "@/components/profile/ProfileInfo";

export default async function ProfilePage() {
  const supabase = await createClient();

  try {
    // Get current user with error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      redirect('/login');
    }

    if (!user) {
      redirect('/login');
    }

    // Safely fetch user profile with null handling
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, role, approved')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Continue with null profile instead of crashing
      } else {
        profile = profileData;
      }
    } catch (error) {
      console.error('Unexpected profile fetch error:', error);
      // Continue with null profile
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and information.
          </p>
        </div>

        <ProfileInfo user={user} profile={profile} />
      </div>
    );
  } catch (error) {
    console.error('Unexpected error in ProfilePage:', error);
    
    // Fallback UI for any unexpected errors
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Unable to load profile information at this time.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            There was an error loading your profile. Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }
}