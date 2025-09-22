/**
 * @fileoverview Authentication Layout Component
 * 
 * Provides a dedicated layout for authentication pages (login, register) that includes
 * automatic redirect logic for already-authenticated users. Creates a centered,
 * branded interface optimized for auth flows.
 * 
 * Security Note: Currently uses placeholder API endpoint. Should be replaced with
 * proper Supabase session checking for production use.
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Authentication Pages Layout
 * 
 * Creates a full-height centered layout for login/register forms with consistent
 * branding. Automatically redirects authenticated users away from auth pages to
 * prevent unnecessary re-authentication flows.
 * 
 * @param children - Authentication form components (login, register, etc.)
 * @returns Branded layout with header, centered content area, and footer
 * 
 * @security_considerations
 * - Client-side auth check may have race conditions
 * - API endpoint '/api/auth/me' needs proper implementation
 * - Consider moving auth check to middleware for better performance
 * 
 * @ux_rationale
 * - Prevents authenticated users from seeing login forms
 * - Maintains consistent branding across auth flows
 * - Centers content for optimal form presentation
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with server-side authentication logic using Supabase
    // This client-side check is a placeholder and should be moved to middleware
    const fetchUser = async () => {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        if (user) {
          // User is already authenticated, redirect to main app
          router.push('/polls');
        }
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal header for branding during auth flows */}
      <header className="py-4 px-6 border-b bg-white">
        <div className="container mx-auto flex justify-center">
          <h1 className="text-2xl font-bold text-slate-800">ALX Polly</h1>
        </div>
      </header>
      
      {/* Centered content area optimized for form presentation */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      
      {/* Simple footer with copyright */}
      <footer className="py-4 px-6 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}