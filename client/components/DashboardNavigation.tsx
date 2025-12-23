"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Calendar,
  Activity,
  User,
  LogOut,
  Plus,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  userName?: string;
  onSignOut?: () => void;
}

export function DashboardNavigation({ userName, onSignOut }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
      current: pathname === "/dashboard/sessions" || pathname === "/dashboard",
    },
    {
      name: "My Activity", 
      href: "/dashboard/my-activity",
      icon: Activity,
      current: pathname === "/dashboard/my-activity",
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard/sessions" className="text-xl font-bold text-blue-600">
                Badminton Squad
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      item.current
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/create-session">
              <Button size="sm" className="hidden sm:flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </Link>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">
                  {userName || "User"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              {onSignOut && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">Sign out</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    item.current
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <div className="border-t pt-3">
              <Link
                href="/dashboard/create-session"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 mr-3" />
                  New Session
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}