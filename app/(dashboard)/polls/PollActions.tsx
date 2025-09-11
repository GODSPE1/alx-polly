"use client";

/**
 * @fileoverview Poll Actions Component
 * 
 * This component renders individual poll cards with voting interface and management actions.
 * It handles poll display, vote submission, and ownership-based action buttons (edit/delete).
 * 
 * Features:
 * - Responsive poll card layout
 * - Conditional rendering based on poll ownership
 * - Delete confirmation for destructive actions
 * - Navigation to poll details and editing
 * 
 * Security:
 * - Only poll owners see management buttons
 * - User ID passed as prop to prevent client-side tampering
 * - Server actions handle all database operations
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

/**
 * Interface defining the structure of a poll object
 */
interface Poll {
  id: string;           // Unique poll identifier (UUID)
  title: string;        // Poll question/title
  created_by: string;   // User ID of poll creator
}

/**
 * Props interface for the PollActions component
 */
interface PollActionsProps {
  poll: Poll;                    // Poll data to display
  currentUserId: string | null;  // ID of currently authenticated user (for ownership checks)
}

/**
 * PollActions Component
 * 
 * Renders a poll card with interactive elements including:
 * - Clickable poll title linking to poll details
 * - Edit button (only for poll owners)
 * - Delete button with confirmation (only for poll owners)
 * 
 * @param poll - The poll object to render
 * @param currentUserId - ID of the current user for ownership verification
 * 
 * @security
 * - Ownership verification prevents unauthorized actions
 * - Server-side validation ensures data integrity
 * - Delete confirmation prevents accidental deletions
 * 
 * @example
 * ```tsx
 * <PollActions 
 *   poll={{
 *     id: "123e4567-e89b-12d3-a456-426614174000",
 *     title: "What's your favorite color?",
 *     created_by: "user123"
 *   }}
 *   currentUserId="user123"
 * />
 * ```
 */
export default function PollActions({ poll, currentUserId }: PollActionsProps) {
  /**
   * Handles poll deletion with user confirmation
   * 
   * @security
   * - Requires user confirmation before deletion
   * - Uses server action for secure deletion
   * - Refreshes page to reflect changes
   * 
   * @sideEffects
   * - Permanently deletes poll and associated data
   * - Reloads page to update UI state
   */
  const handleDelete = async () => {
    // Show confirmation dialog to prevent accidental deletions
    if (confirm("Are you sure you want to delete this poll?")) {
      // Execute server action to delete poll
      await deletePoll(poll.id);
      
      // Refresh page to reflect deletion
      // TODO: Consider using Next.js revalidation instead of full reload
      window.location.reload();
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      {/* Poll Title - Clickable link to poll details */}
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.title}
              </h2>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Management Actions - Only shown to poll owners */}
      {currentUserId && currentUserId === poll.created_by && (
        <div className="flex gap-2 p-2">
          {/* Edit Poll Button */}
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          
          {/* Delete Poll Button */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
