'use client';

import React, { useState, useEffect } from 'react';
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
        
        // Wait a minimum of 4 seconds to let the loading animation play out
        setTimeout(() => {
          setPhase('share');
        }, 4000);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchData();
  }, [params.username]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="font-mono text-accent-delete text-center mb-4">
          Error: {error}
        </div>
        <button 
          onClick={() => router.push('/')}
          className="font-sans flex items-center justify-center gap-2 text-sm font-medium text-background bg-text-primary hover:bg-white px-6 py-3 rounded-full transition-all hover:scale-105"
        >
          Try another username
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
              onClick={() => router.push('/')}
              className="font-sans flex items-center justify-center gap-2 mx-auto text-sm font-medium text-text-muted hover:text-text-primary px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create another Wrapped
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
