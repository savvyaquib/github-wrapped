'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IWrapped } from '@/models/Wrapped';
import LoadingSequence from '@/components/LoadingSequence';
import RevealCard from '@/components/RevealCard';
import ShareCard from '@/components/ShareCard';

type Phase = 'loading' | 'reveal' | 'share';

export default function WrappedSequencePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Omit<IWrapped, 'createdAt'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);

  // We define the sequence of reveals here.
  // Each function returns the props for a RevealCard based on the fetched data.
  const revealSteps = [
    (d: Omit<IWrapped, 'createdAt'>) => ({
      headline: 'commits this year',
      value: d.totalContributions,
      accentColor: 'add' as const,
      commitHash: 'a1b2c3d',
    }),
    (d: Omit<IWrapped, 'createdAt'>) => ({
      headline: 'day longest streak',
      value: d.longestStreak,
      accentColor: 'modify' as const,
      commitHash: 'e4f5g6h',
    }),
    (d: Omit<IWrapped, 'createdAt'>) => ({
      headline: 'total stars earned',
      value: d.totalStars,
      accentColor: 'add' as const,
      commitHash: '7j8k9l0',
    }),
    (d: Omit<IWrapped, 'createdAt'>) => ({
      headline: 'account age in years',
      value: d.accountAgeInYears,
      accentColor: 'delete' as const, // Just for visual variety
      commitHash: 'm1n2o3p',
    }),
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const usernameInput = params.username as string;
        if (!usernameInput) return;

        const res = await fetch(`/api/wrapped/${encodeURIComponent(usernameInput)}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch wrapped data');
        }

        setData(json.data);
        
        // Wait a minimum of 3 seconds to let the loading animation play out
        setTimeout(() => {
          setPhase('reveal');
        }, 3000);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchData();
  }, [params.username]);

  const handleNextReveal = () => {
    if (currentRevealIndex < revealSteps.length - 1) {
      setCurrentRevealIndex(prev => prev + 1);
    } else {
      setPhase('share');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="font-mono text-accent-delete text-center mb-4">
          Error: {error}
        </div>
        <button 
          onClick={() => router.push('/')}
          className="font-sans text-sm text-text-primary underline opacity-80 hover:opacity-100"
        >
          Try another username
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return <LoadingSequence />;
  }

  if (phase === 'reveal' && data) {
    const currentProps = revealSteps[currentRevealIndex](data);
    
    return (
      <div 
        className="min-h-screen w-full bg-background flex flex-col relative cursor-pointer"
        onClick={handleNextReveal}
      >
        {/* Progress Bar Header */}
        <div className="absolute top-0 left-0 w-full p-4 flex space-x-2 z-10">
          {revealSteps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < currentRevealIndex ? 'bg-text-primary/40' : 
                i === currentRevealIndex ? 'bg-text-primary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        
        {/* We use a key based on the index so React completely unmounts and remounts 
            the RevealCard, triggering the GSAP entrance animation again. */}
        <div className="flex-1 overflow-hidden">
          <RevealCard 
            key={currentRevealIndex} 
            {...currentProps} 
          />
        </div>

        {/* Tap Instruction */}
        <div className="absolute bottom-8 w-full text-center font-mono text-xs text-text-muted opacity-50 animate-pulse">
          tap to continue
        </div>
      </div>
    );
  }

  if (phase === 'share' && data) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-6 relative">
        <div className="w-full max-w-4xl pt-8 pb-16">
          <ShareCard data={data} />
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => router.push('/')}
              className="font-sans text-sm text-text-muted underline hover:text-text-primary transition-colors"
            >
              Create another Wrapped
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
