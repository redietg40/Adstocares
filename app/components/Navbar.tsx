"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, PlusCircle, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Search */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logoswomen.jpg" 
              alt="Ad2Care Logo" 
              className="h-10 w-auto rounded-full"
              onError={(e) => {
                // Fallback if they haven't saved the image yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-sm">
              A2C
            </div>
            <span className="hidden text-2xl font-bold tracking-tight text-orange-600 md:block">
              Ad2Care
            </span>
          </Link>

          <div className="relative hidden lg:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products, launches, etc..."
              className="block w-64 rounded-full border-0 bg-gray-100 dark:bg-gray-700 dark:text-white py-2 pl-10 pr-3 text-base text-gray-900 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-orange-500 sm:text-base sm:leading-6 transition-colors"
            />
          </div>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="hidden space-x-8 md:flex">
          <Link href="/promotions" className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Launches
          </Link>
          <Link href="/news" className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            News
          </Link>
          <Link href="/forums" className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Forums
          </Link>
          <Link href="/advertise" className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Advertise
          </Link>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/company/register" 
            className="hidden items-center space-x-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 md:flex transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-gray-500" />
            <span>Submit</span>
          </Link>
          
          <ThemeToggle />

          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User Auth Section */}
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-base font-bold text-white shadow-sm ring-2 ring-white hover:ring-gray-200 transition-all"
              >
                {(session.user?.companyName || session.user?.name || session.user?.email || "U")[0].toUpperCase()}
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {session.user?.role === "COMPANY" && (
                     <Link href="/company/dashboard" className="flex px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                     </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full px-4 py-2 text-base text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/company/login"
              className="rounded-full bg-orange-500 px-4 py-2 text-base font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
