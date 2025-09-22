/**
 * @fileoverview User Login Page
 * 
 * Secure login interface that authenticates users via server actions and provides
 * proper error handling with user enumeration protection. Implements modern Next.js
 * patterns for form handling and navigation.
 * 
 * Security Features:
 * - Server-side authentication processing
 * - Generic error messages to prevent user enumeration
 * - Proper form validation and loading states
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/app/lib/actions/auth-actions';

/**
 * Login Page Component
 * 
 * Renders a secure login form that processes authentication through server actions.
 * Includes proper error handling, loading states, and navigation to registration.
 * 
 * @returns Login form with card-based layout and error handling
 * 
 * @security_features
 * - Uses server actions to keep authentication logic secure
 * - Generic error messages prevent user enumeration attacks
 * - Form validation prevents empty submissions
 * 
 * @ux_considerations
 * - Loading states provide feedback during authentication
 * - Clear navigation to registration page
 * - Accessible form labels and autocomplete hints
 * 
 * @limitations
 * - Requires JavaScript for form submission (client component)
 * - Error state persists until user submits again
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    
    // Call server action for secure authentication
    const result = await login(formData);

    if (result?.error) {
      // Display generic error to prevent user enumeration
      setError(result.error);
      setLoading(false);
    } else {
      // Successful login - server action handles redirect
      // Refresh to pick up new session state
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to ALX Polly</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                autoComplete="current-password"
              />
            </div>
            {/* Error display with consistent styling */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}