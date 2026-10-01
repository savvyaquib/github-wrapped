'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IWrapped } from '@/models/Wrapped';
import LoadingSequence from '@/components/LoadingSequence';
import ShareCard from '@/components/ShareCard';

type Phase = 'loading' | 'share';

export default function WrappedSequencePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Omit<IWrapped, 'createdAt'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');

  // Extract as a stable string to avoid re-running the effect 
  // when useParams() returns a new object reference each render
  const username = params.username as string;

  // Refs to track timers and abort controllers for cleanup
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort any in-flight request from a previous render
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchData() {
      try {
        if (!username) return;

        const res = await fetch(`/api/wrapped/${encodeURIComponent(username)}`, {
          signal: controller.signal,
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch wrapped data');
        }

        // Don't update state if this effect was cleaned up (component unmounted / username changed)
        if (controller.signal.aborted) return;

        setData(json.data);
        
        // Wait a minimum of 4 seconds to let the loading animation play out
        phaseTimerRef.current = setTimeout(() => {
          setPhase('share');
        }, 4000);
      } catch (err: unknown) {
        // Silently ignore abort errors — they're expected during cleanup
        if (err instanceof DOMException && err.name === 'AbortError') return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    }

    fetchData();

    // Cleanup: abort in-flight fetch and clear any pending phase timer
    return () => {
      controller.abort();
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [username]);

  const handleGoHome = useCallback(() => router.push('/'), [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="font-mono text-accent-delete text-center mb-4">
          Error: {error}
        </div>
        <button 
          onClick={handleGoHome}
          className="group relative inline-flex items-center justify-center p-[1px] font-sans text-sm font-medium tracking-wide text-white rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(224,85,91,0.2)] mx-auto"
        >
          <span className="absolute inset-0 rounded-2xl bg-white/10 group-hover:bg-gradient-to-r group-hover:from-accent-delete group-hover:to-orange-500 transition-all duration-500"></span>
          <span className="relative flex items-center justify-center gap-3 px-8 py-4 bg-background rounded-2xl w-full h-full border border-transparent">
            <svg className="w-5 h-5 text-white/50 group-hover:text-accent-delete transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-white/70 group-hover:text-white transition-colors duration-300">
              Try another username
            </span>
          </span>
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return <LoadingSequence />;
  }

  if (phase === 'share' && data) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-6 relative">
        <div className="w-full max-w-4xl pt-8 pb-16">
          <ShareCard data={data} />
          
          <div className="mt-12 text-center">
            <button 
              onClick={handleGoHome}
              className="group relative inline-flex items-center justify-center p-[1px] font-sans text-sm font-medium tracking-wide text-white rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] mx-auto"
            >
              <span className="absolute inset-0 rounded-2xl bg-white/10 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:via-emerald-500 group-hover:to-purple-600 transition-all duration-500"></span>
              <span className="relative flex items-center justify-center gap-3 px-8 py-4 bg-background rounded-2xl w-full h-full border border-transparent">
                <svg className="w-5 h-5 text-white/50 group-hover:text-green-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-white/70 group-hover:text-white transition-colors duration-300">
                  Create another Wrapped
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
