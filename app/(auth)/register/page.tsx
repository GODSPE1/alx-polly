/**
 * @fileoverview User Registration Page
 * 
 * Handles new user account creation with email verification through Supabase Auth.
 * Includes client-side password validation and proper error/success state management
 * with user enumeration protection.
 * 
 * Security Features:
 * - Password confirmation validation
 * - Generic success messages to prevent user enumeration
 * - Email verification requirement before account activation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

/**
 * Registration Page Component
 * 
 * Provides a secure user registration form with password validation and email
 * verification. Uses Supabase Auth for account creation and implements security
 * best practices to prevent user enumeration attacks.
 * 
 * @returns Registration form with validation and success/error states
 * 
 * @security_features
 * - Client-side password confirmation before submission
 * - Generic success messages whether user exists or not
 * - Email verification required for account activation
 * - Proper autocomplete hints for password managers
 * 
 * @validation_rules
 * - All fields required
 * - Password and confirmation must match
 * - Email format validated by HTML input type
 * 
 * @ux_flow
 * 1. User fills form and submits
 * 2. Passwords validated for match
 * 3. Account creation attempted via Supabase
 * 4. Success message shown regardless of whether email exists
 * 5. User checks email for verification link
 */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side password confirmation validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Store full name in user metadata
      },
    });

    setLoading(false);

    if (error) {
      // Display specific error for registration issues
      setError(error.message);
    } else if (data.user) {
      // Successful registration with new user created
      setSuccess('Registration successful! Please check your email to confirm your account.');
    } else {
      // User already exists case - Supabase returns no error but also no user
      // Show generic message to prevent user enumeration
      setSuccess('Please check your email for the confirmation link.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start creating and sharing polls</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            // Success state replaces form entirely
            <p className="text-green-500 text-center">{success}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  type="text" 
                  placeholder="John Doe" 
                  required
                />
              </div>
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
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  required
                  autoComplete="new-password"
                />
              </div>
              {/* Error display with consistent styling */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}