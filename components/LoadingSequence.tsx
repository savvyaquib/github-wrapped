'use client';

/**
 * LoadingSequence Component
 * 
 * Responsibility: Displays an animated, hacker-style terminal logging sequence 
 * while the backend fetches and computes the Wrapped stats.
 */

import React, { useState, useEffect } from 'react';

const LOG_LINES = [
  'Initializing secure connection to GitHub...',
  'Bypassing rate limits...',
  'Resolving user profile data...',
  'Fetching public repositories...',
  'Cloning contribution calendar...',
  'Analyzing commit hashes...',
  'Calculating longest contribution streak...',
  'Aggregating language distribution...',
  'Parsing stargazers...',
  'Compiling Wrapped payload...',
  'Decrypting final statistics...',
  'Done.'
];

// Characters used for the scramble effect
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let iteration = 0;
    let animationFrame: number;
    
    const animate = () => {
      setDisplayText(text.split('').map((letter, index) => {
        if (index < iteration) {
          return text[index];
        }
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(''));
      
      if (iteration >= text.length) {
        cancelAnimationFrame(animationFrame);
      } else {
        iteration += 1/2; // Speed of unscrambling (higher is faster)
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [text]);

  return <span>{displayText}</span>;
};

export default function LoadingSequence() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    
    const showNextLine = () => {
      if (currentIndex < LOG_LINES.length) {
        setVisibleLines((prev) => [...prev, LOG_LINES[currentIndex]]);
        
        // Calculate progress percentage
        const currentProgress = Math.floor(((currentIndex + 1) / LOG_LINES.length) * 100);
        setProgress(currentProgress);
        
        currentIndex++;
        
        if (currentIndex < LOG_LINES.length) {
          // Delay between lines
          const nextDelay = Math.random() * 300 + 200; // 200-500ms
          setTimeout(showNextLine, nextDelay);
        }
      }
    };

    const timeout = setTimeout(showNextLine, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Generate ASCII progress bar
  const barLength = 40;
  const filledLength = Math.floor((progress / 100) * barLength);
  const emptyLength = barLength - filledLength;
  const progressBar = `[${'█'.repeat(filledLength)}${'░'.repeat(emptyLength)}] ${progress}%`;

  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-end p-6 md:p-12 bg-background font-mono text-sm sm:text-base relative overflow-hidden">
      
      {/* Cool subtle background grid to add depth */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)`,
          backgroundSize: '2rem 2rem'
      }} />

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col space-y-2 mb-10 overflow-hidden relative z-10 w-full max-w-4xl mx-auto">
        {visibleLines.map((line, index) => (
          <div key={index} className="flex flex-wrap sm:flex-nowrap">
            <span className="text-green-500 mr-3 shrink-0">github@wrapped:~$</span>
            <span className={index === LOG_LINES.length - 1 ? 'text-green-400 font-bold' : 'text-text-secondary drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}>
              <ScrambleText text={line} />
            </span>
          </div>
        ))}
        
        {/* Blinking cursor and Progress bar */}
        {visibleLines.length < LOG_LINES.length && (
          <div className="flex flex-col mt-2">
            <div className="flex">
               <span className="text-green-500 mr-3 shrink-0">github@wrapped:~$</span>
               <span className="inline-block w-[1ch] h-[1.2em] bg-green-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </div>
            
            <div className="mt-8 text-green-500/80 font-bold tracking-widest text-xs sm:text-sm">
              {progressBar}
            </div>
          </div>
        )}

        {visibleLines.length === LOG_LINES.length && (
          <div className="mt-8 text-green-400 font-bold tracking-widest text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            {`[${'█'.repeat(barLength)}] 100% - ACCESS GRANTED`}
          </div>
        )}
      </div>
    </div>
  );
}
