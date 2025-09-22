import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
/**
 * Creates and returns a secure Supabase server client instance.
 *
 * This function initializes the Supabase client using environment variables for the URL and anon key.
 * It configures cookie handling to enforce security best practices by ensuring all cookies set are
 * `httpOnly`, `secure`, and use `SameSite: 'strict'`. This helps mitigate common web vulnerabilities
 * such as XSS and CSRF attacks.
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} A promise that resolves to the configured Supabase server client.
 *
 * @remarks
 * - Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` to be set in environment variables.
 * - Uses the current request's cookie store for session management.
 * - Only secure cookies are allowed to be set.
 */
export async function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Only allow secure, httpOnly cookies to be set
          cookiesToSet.forEach(({ name, value, options }) => {
            const safeOptions = {
              ...options,
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
            }
            cookieStore.set(name, value, safeOptions)
          })
        },
      },
    }
  )
  )
}