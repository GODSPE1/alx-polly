'use client';

import Picker from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
}

/**
 * A reusable emoji picker component.
 * Provides a simple interface for selecting an emoji and triggering a callback.
 * @param onEmojiClick - Function to call when an emoji is selected.
 */
export function EmojiPicker({ onEmojiClick }: EmojiPickerProps) {
  return (
    <div className="w-full">
      <Picker
        onEmojiClick={(emojiObject) => onEmojiClick(emojiObject.emoji)}
        width="100%"
      />
    </div>
  );
}
