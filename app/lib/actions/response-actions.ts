'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const emojiResponseSchema = z.object({
  pollId: z.string().uuid(),
  emoji: z.string().refine((str) => Array.from(str).length === 1, {
    message: 'Emoji must be a single character.',
  }),
});

export async function submitEmojiResponse(
  pollId: string,
  emoji: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to respond.' };
  }

  const validation = emojiResponseSchema.safeParse({ pollId, emoji });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    // Check if the user has already responded to this poll with the same emoji
    const { data: existingResponse, error: selectError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .eq('content', emoji)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: no rows found
      throw selectError;
    }

    if (existingResponse) {
      return { success: false, error: 'You have already responded with this emoji.' };
    }

    // Insert the new response
    const { error: insertError } = await supabase.from('votes').insert({
      poll_id: pollId,
      user_id: user.id,
      content: emoji,
      type: 'emoji',
    });

    if (insertError) {
      throw insertError;
    }

    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to submit emoji response:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred on the server.',
    };
  }
}
