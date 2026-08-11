'use client';

/**
 * LoadingSequence Component
 * 
 * Responsibility: Displays a fake terminal logging sequence while the backend 
 * fetches and computes the Wrapped stats. Resolves into the first reveal card 
 * once the data is ready (managed by parent).
 * 
 * State/Effects:
 * - Uses an interval to progressively reveal generic "git clone" and "npm install" 
 *   style log lines to simulate processing time.
 */

import React, { useState, useEffect } from 'react';

const LOG_LINES = [
  'Resolving GitHub user profile...',
  'Fetching public repositories...',
  'Cloning contribution calendar...',
  'Analyzing commit hashes...',
  'Calculating longest contribution streak...',
  'Aggregating language distribution...',
  'Parsing stargazers...',
  'Compiling Wrapped payload...',
  'Done.'
];

export default function LoadingSequence() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    
    // Reveal a new line every 200-400ms randomly to feel like a real terminal
    const showNextLine = () => {
      if (currentIndex < LOG_LINES.length) {
        setVisibleLines((prev) => [...prev, LOG_LINES[currentIndex]]);
        currentIndex++;
        
        if (currentIndex < LOG_LINES.length) {
          const nextDelay = Math.random() * 200 + 100; // 100-300ms
          setTimeout(showNextLine, nextDelay);
        }
      }
    };

    const timeout = setTimeout(showNextLine, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-end p-6 bg-background font-mono text-sm sm:text-base">
      <div className="flex flex-col space-y-1 mb-10 overflow-hidden">
        {visibleLines.map((line, index) => (
          <div key={index} className="flex">
            <span className="text-accent-modify mr-3 shrink-0">~</span>
            <span className={index === LOG_LINES.length - 1 ? 'text-accent-add' : 'text-text-muted'}>
              {line}
            </span>
          </div>
        ))}
        {/* Blinking cursor at the end */}
        {visibleLines.length < LOG_LINES.length && (
          <div className="flex mt-1">
             <span className="text-accent-modify mr-3 shrink-0">~</span>
             <span className="inline-block w-[1ch] h-[1.2em] bg-text-muted animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
