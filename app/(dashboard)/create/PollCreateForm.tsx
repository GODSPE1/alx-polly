"use client";

/**
 * @fileoverview Poll Creation Form Component
 * 
 * This component provides an interactive form for creating new polls with
 * dynamic option management, real-time validation, and success feedback.
 * 
 * Features:
 * - Dynamic option addition and removal
 * - Client-side form validation
 * - Success/error state management
 * - Automatic redirect after successful creation
 * - Minimum 2 options requirement
 * 
 * UX Considerations:
 * - Prevents removal of options when only 2 remain
 * - Shows feedback messages for user actions
 * - Auto-redirect to polls page after creation
 */

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * PollCreateForm Component
 * 
 * Renders a form for creating new polls with dynamic option management.
 * Handles form submission, validation, and user feedback.
 * 
 * @features
 * - Dynamic option list with add/remove functionality
 * - Real-time form state management
 * - Server action integration
 * - Success/error feedback display
 * - Automatic navigation after creation
 * 
 * @validation
 * - Minimum 2 options required
 * - Question field required
 * - Empty options filtered out
 * 
 * @example
 * Usage in a page component:
 * ```tsx
 * export default function CreatePollPage() {
 *   return (
 *     <div>
 *       <h1>Create New Poll</h1>
 *       <PollCreateForm />
 *     </div>
 *   );
 * }
 * ```
 */
export default function PollCreateForm() {
  // State for managing poll options (minimum 2 required)
  const [options, setOptions] = useState(["", ""]);
  
  // Error state for displaying validation or server errors
  const [error, setError] = useState<string | null>(null);
  
  // Success state for showing creation confirmation
  const [success, setSuccess] = useState(false);

  /**
   * Updates a specific option's text value
   * 
   * @param idx - Index of the option to update
   * @param value - New text value for the option
   * 
   * @example
   * handleOptionChange(0, "New option text");
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new empty option to the poll
   * 
   * @limits No maximum limit enforced (could be added for UX)
   * @sideEffects Updates options state with new empty string
   */
  const addOption = () => setOptions((opts) => [...opts, ""]);

  /**
   * Removes an option from the poll
   * 
   * @param idx - Index of the option to remove
   * @validation Prevents removal if only 2 options remain (minimum required)
   * 
   * @example
   * removeOption(2); // Removes the third option if more than 2 exist
   */
  const removeOption = (idx: number) => {
    // Enforce minimum of 2 options
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      /**
       * Form submission handler using server actions
       * 
       * @async Processes form data and handles server response
       * @sideEffects 
       * - Clears previous error/success states
       * - Shows error message if creation fails
       * - Shows success message and redirects if successful
       * - Redirects to polls page after 1.2 second delay
       * 
       * @validation Server-side validation handles empty fields and option count
       * @todo Consider using Next.js navigation instead of window.location
       */
      action={async (formData) => {
        // Reset form state before submission
        setError(null);
        setSuccess(false);
        
        // Call server action to create poll
        const res = await createPoll(formData);
        
        if (res?.error) {
          // Display server-side validation or creation errors
          setError(res.error);
        } else {
          // Show success feedback to user
          setSuccess(true);
          
          // Redirect to polls page after brief delay
          // TODO: Use Next.js router.push() for better UX
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      {/* Poll Question Input */}
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input 
          name="question" 
          id="question" 
          placeholder="What would you like to ask?"
          required 
        />
      </div>

      {/* Dynamic Options Section */}
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              required
            />
            {/* Remove Option Button - Only shown when more than 2 options exist */}
            {options.length > 2 && (
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={() => removeOption(idx)}
                aria-label={`Remove option ${idx + 1}`}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        
        {/* Add Option Button */}
        <Button 
          type="button" 
          onClick={addOption} 
          variant="secondary"
          className="mt-2"
        >
          Add Option
        </Button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Message Display */}
      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
          <strong>Success!</strong> Poll created successfully. Redirecting...
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={success} // Prevent double submission
      >
        {success ? 'Creating...' : 'Create Poll'}
      </Button>
    </form>
  );
} 