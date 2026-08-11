'use client';

/**
 * TerminalInput Component
 * 
 * Responsibility: Renders a terminal-like input field that serves as the hero element 
 * of the landing page. It captures a GitHub username or URL and triggers the reveal sequence.
 * 
 * Props:
 * - onSubmit: (input: string) => void - Callback when the user presses Enter.
 * 
 * State:
 * - input: The current value of the input field.
 * - isFocused: Tracks focus state to render the fake blinking cursor.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TerminalInput() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Navigate to the wrapped page with the provided input
      router.push(`/wrapped/${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto flex flex-col items-start font-mono text-lg sm:text-xl md:text-2xl text-text-primary"
      onClick={() => inputRef.current?.focus()}
    >
      <form onSubmit={handleSubmit} className="relative w-full flex items-center">
        {/* Terminal Prompt Prefix */}
        <span className="text-accent-add mr-3 shrink-0 select-none">
          $ wrapped
        </span>
        
        {/* Hidden actual input field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 opacity-0 w-full cursor-text"
          aria-label="GitHub username or URL"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />

        {/* Visible Fake Input */}
        <div className="flex relative w-full items-center">
          {input.length === 0 && !isFocused ? (
            <span className="text-text-muted select-none">
              &lt;paste your github username or url&gt;
            </span>
          ) : (
            <span className="text-text-primary break-all">
              {input}
            </span>
          )}

          {/* Fake Blinking Cursor */}
          <span 
            className={`
              inline-block w-[1ch] h-[1.2em] ml-1 bg-text-primary
              ${isFocused ? 'animate-pulse' : 'hidden'}
            `}
          />
        </div>
      </form>
      <div className="mt-4 text-sm text-text-muted font-sans self-start">
        Press Enter to execute
      </div>
    </div>
  );
}
