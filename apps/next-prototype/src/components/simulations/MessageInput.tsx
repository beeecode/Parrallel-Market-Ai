import type { FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type MessageInputProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function MessageInput({ value, error, onChange, onSubmit }: MessageInputProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="border-t border-border bg-ink-900/70 px-4 py-4 sm:px-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <Input
          aria-describedby={error ? "message-error" : undefined}
          aria-label="Type a message"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type a message..."
          value={value}
        />
        <Button aria-label="Send message" size="icon" type="submit">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-xs font-medium text-red-300" id="message-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
