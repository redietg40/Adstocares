"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, PlusCircle, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Search */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white shadow-sm">
              A2C
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-gray-900 md:block">
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
              className="block w-64 rounded-full border-0 bg-gray-100 py-2 pl-10 pr-3 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="hidden space-x-8 md:flex">
          <Link href="/promotions" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
            Launches
          </Link>
          <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
            News
          </Link>
          <Link href="/forums" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
            Forums
          </Link>
          <Link href="/advertise" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
            Advertise
          </Link>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/company/register" 
            className="hidden items-center space-x-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:flex transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-gray-500" />
            <span>Submit</span>
          </Link>
          
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User Auth Section */}
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-sm ring-2 ring-white hover:ring-gray-200 transition-all"
              >
                {session.user?.email?.[0].toUpperCase()}
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {session.user?.role === "COMPANY" && (
                     <Link href="/company/dashboard" className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                     </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 items-center"
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
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
