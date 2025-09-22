/**
 * @fileoverview Home Page Redirect
 * 
 * Acts as a router entry point that immediately redirects users to the main polls page.
 * This pattern ensures the root URL always leads to the primary application interface
 * rather than showing an empty or placeholder homepage.
 */

import { redirect } from 'next/navigation';

/**
 * Home Page Component
 * 
 * Immediately redirects to the polls listing page. This design choice makes the
 * polls page the de facto landing page for the application, reducing navigation
 * friction for users.
 * 
 * @returns Server-side redirect (no JSX rendered)
 * 
 * @design_rationale
 * - Eliminates need for a separate landing page
 * - Reduces user clicks to reach main functionality
 * - Maintains clean URL structure with meaningful root redirect
 */
export default function Home() {
  redirect('/polls');
}
