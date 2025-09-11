/**
 * @fileoverview Dashboard Layout Component
 * 
 * This component provides the main layout structure for all dashboard pages.
 * It includes authentication verification, navigation header, and content area.
 * 
 * Features:
 * - Client-side authentication verification
 * - Responsive header with navigation and user actions
 * - Automatic redirection for unauthenticated users
 * - Consistent layout structure across all dashboard pages
 * 
 * Security:
 * - Authentication checks on component mount
 * - Secure logout functionality
 * - Redirects to login page if user is not authenticated
 * 
 * @todo Replace client-side auth checks with server-side verification
 * @todo Implement proper error handling for auth API failures
 */

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";

/**
 * Dashboard Layout Component
 * 
 * Provides consistent layout and authentication for all dashboard pages.
 * Wraps child components with authentication verification and navigation.
 * 
 * @param children - Child components to render within the dashboard layout
 * 
 * @features
 * - Authentication verification on mount
 * - Responsive navigation header
 * - User menu with logout functionality
 * - Content area with max-width constraints
 * - Consistent spacing and styling
 * 
 * @security
 * - Redirects unauthenticated users to login
 * - Secure logout with session invalidation
 * - Client-side auth state management
 * 
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <YourDashboardContent />
 * </DashboardLayout>
 * ```
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Next.js router for programmatic navigation
  const router = useRouter();

  /**
   * Authentication verification effect
   * 
   * Runs on component mount to verify user authentication status.
   * Redirects to login page if user is not authenticated.
   * 
   * @todo Replace with server-side authentication
   * @todo Add loading states and error handling
   * @todo Implement token refresh logic
   */
  useEffect(() => {
    // Client-side authentication verification
    const fetchUser = async () => {
      try {
        // Call authentication API endpoint
        const response = await fetch("/api/auth/me");
        
        if (response.ok) {
          const user = await response.json();
          
          // Redirect to login if no user found
          if (!user) {
            router.push("/login");
          }
        } else {
          // Redirect on API error (likely unauthenticated)
          router.push("/login");
        }
      } catch (error) {
        // Handle network errors or API failures
        console.error("Authentication check failed:", error);
        router.push("/login");
      }
    };

    // Execute authentication check
    fetchUser();
  }, [router]);

  /**
   * Handles user logout
   * 
   * Calls logout API endpoint and redirects to login page.
   * Ensures session is properly invalidated on server-side.
   * 
   * @security
   * - Calls server-side logout endpoint
   * - Invalidates user session and tokens
   * - Redirects to prevent accessing protected routes
   */
  const handleSignOut = async () => {
    try {
      // Call server logout endpoint
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      // Handle logout errors gracefully
      console.error("Logout failed:", error);
      
      // Still redirect to login even if logout API fails
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand Section */}
            <div className="flex-shrink-0">
              <Link href="/polls" className="text-2xl font-bold text-blue-600">
                ALX Polly
              </Link>
            </div>
            
            {/* Navigation and User Actions */}
            <div className="flex items-center gap-4">
              {/* Quick Create Poll Action */}
              <Link href="/create">
                <Button>Create Poll</Button>
              </Link>
              
              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    {/* User Avatar Placeholder 
                        TODO: Implement user avatar display */}
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">U</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {/* User Name Display
                        TODO: Fetch and display actual user name */}
                    My Account
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Navigation Menu Items */}
                  <DropdownMenuItem asChild>
                    <Link href="/polls">My Polls</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Logout Action */}
                  <DropdownMenuItem>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left"
                    >
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-slate-50">
        {/* Content Container with responsive padding and max-width constraints */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Render child components (dashboard pages) */}
          {children}
        </div>
      </main>
    </div>
  );
}
