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
