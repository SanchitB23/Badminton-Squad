import { MobileNavigation } from "@/components/navigation/MobileNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />
      
      {/* Main content area */}
      <main className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white">
            <h1 className="text-lg font-semibold text-gray-900">Badminton Squad</h1>
          </div>
        </div>
        
        {/* Page content */}
        <div className="pb-20 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}