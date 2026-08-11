'use client';

/**
 * RevealCard Component
 * 
 * Responsibility: Renders a single story-like screen in the reveal sequence.
 * Handles its own entrance animation and the count-up tween for the primary number.
 * 
 * Props:
 * - headline: The main text (e.g., "commits this year").
 * - value: The numerical value to count up to.
 * - prefix / suffix: Optional text before/after the value.
 * - accentColor: 'add' (green) | 'delete' (red) | 'modify' (amber) - Determines the structural border color.
 * - commitHash: A fake 7-character hex string for the metadata header.
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface RevealCardProps {
  headline: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accentColor: 'add' | 'delete' | 'modify';
  commitHash: string;
}

export default function RevealCard({
  headline,
  value,
  prefix = '',
  suffix = '',
  accentColor,
  commitHash
}: RevealCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  // Map the accent color prop to Tailwind classes for the structural bar
  const borderColorMap = {
    add: 'border-l-accent-add',
    delete: 'border-l-accent-delete',
    modify: 'border-l-accent-modify',
  };

  useEffect(() => {
    // Basic prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Timeline for this specific card
    // We name it for easier debugging if needed
    const tl = gsap.timeline({
      id: `reveal-${commitHash}`,
      defaults: { ease: 'power2.out' }
    });

    if (prefersReducedMotion) {
      // If user prefers reduced motion, just show the final state immediately
      gsap.set(containerRef.current, { opacity: 1, y: 0 });
      if (numberRef.current) {
        numberRef.current.innerText = value.toString();
      }
      return;
    }

    // 1. Fade and slide in the container
    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 }
    );

    // 2. Count up the primary number using GSAP's text/innerHTML tweening
    // We start a temporary object at 0 and tween its 'val' property to the target value
    const counter = { val: 0 };
    tl.to(counter, {
      val: value,
      duration: 1.2,
      ease: 'power1.out',
      onUpdate: () => {
        if (numberRef.current) {
          // Format with commas and remove decimals
          numberRef.current.innerText = Math.round(counter.val).toLocaleString();
        }
      }
    }, "-=0.3"); // Start slightly before the container finish animating

    return () => {
      tl.kill(); // Cleanup on unmount
    };
  }, [value, commitHash]);

  return (
    <div 
      ref={containerRef}
      className={`
        w-full max-w-md mx-auto h-full flex flex-col justify-center px-6
        border-l-[6px] ${borderColorMap[accentColor]}
        bg-surface/30 backdrop-blur-sm rounded-r-2xl py-12
        opacity-0 {/* Initial hidden state before GSAP takes over */}
      `}
    >
      {/* Metadata Header */}
      <div className="font-mono text-xs text-text-muted mb-8 flex items-center tracking-wider">
        <span className="opacity-70">commit</span>
        <span className="mx-2 text-text-primary">{commitHash}</span>
        <span className="opacity-70">&middot; just now</span>
      </div>

      {/* Primary Stat Display */}
      <div className="flex flex-col mb-4">
        <div className="font-mono text-5xl sm:text-6xl text-text-primary font-bold mb-2 tracking-tight">
          {prefix && <span className="opacity-80 mr-1">{prefix}</span>}
          <span ref={numberRef}>0</span>
          {suffix && <span className="opacity-80 ml-1">{suffix}</span>}
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
          {headline}
        </h2>
      </div>
    </div>
  );
}
