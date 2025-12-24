"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Plus, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Sessions",
    href: "/dashboard/sessions",
    icon: Calendar,
  },
  {
    name: "Create",
    href: "/dashboard/create-session", 
    icon: Plus,
  },
  {
    name: "Activity",
    href: "/dashboard/my-activity",
    icon: Activity,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/dashboard/sessions" && pathname === "/dashboard");
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium min-h-[60px] touch-manipulation",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <item.icon className={cn(
                  "h-6 w-6 mb-1",
                  isActive ? "text-blue-600" : "text-gray-400"
                )} />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Navigation for Desktop */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:pt-5 lg:pb-4 lg:bg-white">
        <div className="flex items-center flex-shrink-0 px-6">
          <h1 className="text-xl font-semibold text-gray-900">Badminton Squad</h1>
        </div>
        
        <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === "/dashboard/sessions" && pathname === "/dashboard");
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-blue-500" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </nav>
    </>
  );
}