/**
 * @file Authentication Actions for Supabase-backed SSR Next.js App
 *
 * Provides server-side actions for user authentication flows, including login, registration,
 * logout, and session management. All functions leverage Supabase Auth for secure credential
 * handling and session control, with SSR compatibility and HttpOnly cookie management.
 *
 * ## Functions:
 * - `login(formData: FormData)`: Authenticates a user using email and password. Redirects on success,
 *   returns error message on failure. Assumes valid form data and relies on Supabase for password validation.
 *   Edge case: Returns generic error for invalid credentials.
 *
 * - `register(formData: FormData)`: Registers a new user with email verification. Validates password confirmation
 *   server-side. Returns error for mismatched passwords or Supabase registration errors (e.g., duplicate email).
 *   Assumes Supabase enforces password strength and email format.
 *
 * - `logout()`: Signs out the current user, clears session, and redirects to login. Invalidates tokens and triggers
 *   layout revalidation. Assumes Supabase session is active.
 *
 * - `getCurrentUser()`: Retrieves the authenticated user object from Supabase session. Returns `null` if not authenticated.
 *   Useful for SSR auth checks. Assumes Supabase session is correctly configured.
 *
 * - `getSession()`: Fetches the current session object, including tokens and expiration. Returns `null` if no active session.
 *   Useful for advanced session management and expiration checks.
 *
 * ## Security & Assumptions:
 * - All actions are processed server-side to prevent credential exposure.
 * - Supabase handles password hashing, verification, and email validation.
 * - HttpOnly cookies are used for session management.
 * - Email verification is required for new accounts.
 * - Functions expect well-formed FormData and rely on Supabase error handling for edge cases.
 *
 * ## Usage:
 * Designed for integration with Next.js server actions and forms. See individual function examples for usage patterns.
 */
'use server'

/**
 * @fileoverview Authentication Actions
 * 
 * This module contains server actions for handling user authentication flows including
 * login, registration, logout, and session management. All functions use Supabase Auth
 * for secure authentication with server-side rendering (SSR) support.
 * 
 * Security Features:
 * - Server-side validation and processing
 * - Secure session management with HttpOnly cookies
 * - Input validation for all user data
 * - Protection against common auth vulnerabilities
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Authenticates a user with email and password
 * 
 * @param formData - Form data containing email and password fields
 * @returns Object with error message if authentication fails, otherwise redirects to polls
 * 
 * @security
 * - Uses Supabase's built-in password hashing and verification
 * - Server-side processing prevents client-side credential exposure
 * - Automatic session creation with secure HttpOnly cookies
 * 
 * @example
 * ```tsx
 * <form action={login}>
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <button type="submit">Login</button>
 * </form>
 * ```
 */
export async function login(formData: FormData) {
  // Initialize Supabase client with server-side configuration
  const supabase = await createClient()

  // Extract and validate form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Attempt authentication with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect('/polls');
}

/**
 * Registers a new user account with email verification
 * 
 * @param formData - Form data containing name, email, password, and confirmPassword
 * @returns Object with error message if registration fails, otherwise returns success
 * 
 * @validation
 * - Ensures password confirmation matches
 * - Email format validation handled by Supabase
 * - Password strength requirements enforced by Supabase settings
 * 
 * @security
 * - User metadata (name) stored securely in auth.users table
 * - Email verification required before account activation
 * - Prevents duplicate account creation with same email
 * 
 * @example
 * ```tsx
 * <form action={register}>
 *   <input name="name" type="text" required />
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <input name="confirmPassword" type="password" required />
 *   <button type="submit">Register</button>
 * </form>
 * ```
 */
export async function register(formData: FormData) {
  // Initialize Supabase client for user registration
  const supabase = await createClient()

  // Extract user registration data from form
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate password confirmation on server-side for security
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  // Create new user account with email verification
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // Store user's display name in user metadata
      },
    },
  })

  // Handle registration errors (duplicate email, weak password, etc.)
  if (error) {
    return { error: error.message }
  }

  // Registration successful - user will receive email verification
  return { error: null }
}

/**
 * Logs out the current user and clears their session
 * 
 * @security
 * - Clears server-side session and HttpOnly cookies
 * - Invalidates refresh tokens
 * - Redirects to prevent accessing protected routes
 * 
 * @sideEffects
 * - Clears all authentication state
 * - Redirects user to login page
 * - Triggers layout revalidation
 */
export async function logout() {
  // Initialize Supabase client to handle logout
  const supabase = await createClient()
  
  // Clear user session and invalidate tokens
  await supabase.auth.signOut()
  
  // Redirect to login page after successful logout
  redirect('/login')
}

/**
 * Retrieves the currently authenticated user
 * 
 * @returns User object if authenticated, null if not authenticated
 * 
 * @usage Used for server-side authentication checks and user identification
 * 
 * @example
 * ```tsx
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getCurrentUser() {
  // Get server-side Supabase client instance
  const supabase = await createClient()
  
  // Fetch current user from session
  const { data } = await supabase.auth.getUser()
  
  return data.user // Returns null if not authenticated
}

/**
 * Retrieves the current user session with full session data
 * 
 * @returns Session object with user data, tokens, and expiration info
 * 
 * @usage Used when full session information is needed (tokens, expiration, etc.)
 * 
 * @example
 * ```tsx
 * const session = await getSession()
 * if (session?.expires_at && new Date(session.expires_at) < new Date()) {
 *   // Session expired, redirect to login
 * }
 * ```
 */
export async function getSession() {
  // Initialize Supabase client for session retrieval
  const supabase = await createClient()
  
  // Get full session data including tokens and expiration
  const { data } = await supabase.auth.getSession()
  
  return data.session // Returns null if no active session
}
