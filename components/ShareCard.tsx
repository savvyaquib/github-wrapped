'use client';

/**
 * ShareCard Component
 * 
 * Responsibility: Renders the final summary card in a macOS-terminal style frame.
 * Provides actions to download the card as a PNG or share via Web Share API.
 * 
 * Props:
 * - data: The aggregated IWrapped data to display.
 */

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { IWrapped } from '@/models/Wrapped';
import { Download, Share2, Loader2 } from 'lucide-react';

export default function ShareCard({ data }: { data: Omit<IWrapped, 'createdAt'> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      
      // Temporarily hide action buttons during render by adjusting their opacity/display
      // Note: html-to-image supports a filter function to exclude nodes.
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High-res for sharing
        filter: (node) => {
          // Exclude elements with the 'no-export' class
          if (node.classList?.contains('no-export')) return false;
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `${data.username}-github-wrapped.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.username}'s GitHub Wrapped`,
          text: `Check out my GitHub Wrapped! ${data.totalContributions} contributions this year.`,
          url: window.location.href, // Current URL
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      // Fallback to download if Web Share API is not supported (e.g. desktop)
      handleDownload();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      
      {/* The Card to be exported */}
      <div 
        ref={cardRef} 
        className="w-full bg-surface border border-white/5 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Terminal Title Bar */}
        <div className="h-10 bg-background/50 flex items-center px-4 border-b border-white/5">
          <div className="flex space-x-2">
            {/* Diff-colored window controls */}
            <div className="w-3 h-3 rounded-full bg-accent-delete"></div>
            <div className="w-3 h-3 rounded-full bg-accent-modify"></div>
            <div className="w-3 h-3 rounded-full bg-accent-add"></div>
          </div>
          <div className="mx-auto font-mono text-xs text-text-muted opacity-70">
            {data.username} ~/github-wrapped
          </div>
        </div>

        {/* Card Content */}
        <div className="p-8 pb-10 flex flex-col">
          <div className="font-display font-bold text-3xl mb-8 tracking-tight">
            2026 Recap
          </div>

          <div className="space-y-6">
            <StatRow 
              label="Total Contributions" 
              value={data.totalContributions.toLocaleString()} 
              color="add" 
            />
            <StatRow 
              label="Longest Streak" 
              value={`${data.longestStreak} days`} 
              color="modify" 
            />
            {data.topLanguages.length > 0 && (
              <StatRow 
                label="Top Language" 
                value={data.topLanguages[0].name} 
                subValue={`${data.topLanguages[0].percentage}%`}
                color="delete" 
              />
            )}
            <StatRow 
              label="Most Active Day" 
              value={data.mostActiveWeekday} 
              color="add" 
            />
          </div>
          
          <div className="mt-12 font-mono text-xs text-text-muted text-center opacity-60">
            github-wrapped.example.com
          </div>
        </div>
      </div>

      {/* Action Buttons (Not exported in PNG) */}
      <div className="mt-8 flex space-x-4 w-full no-export">
        <button 
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 bg-surface hover:bg-surface/80 border border-white/10 text-text-primary font-sans font-medium py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Download className="w-5 h-5 mr-2" />
          )}
          Download
        </button>
        <button 
          onClick={handleShare}
          disabled={isExporting}
          className="flex-1 bg-accent-add text-surface hover:bg-accent-add/90 font-sans font-medium py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </button>
      </div>

    </div>
  );
}

// Helper component for uniform rows
function StatRow({ 
  label, 
  value, 
  subValue,
  color 
}: { 
  label: string, 
  value: string | number, 
  subValue?: string,
  color: 'add' | 'delete' | 'modify' 
}) {
  const textColorMap = {
    add: 'text-accent-add',
    delete: 'text-accent-delete',
    modify: 'text-accent-modify',
  };

  return (
    <div className="flex justify-between items-end border-b border-white/10 pb-2">
      <span className="font-sans text-sm text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline space-x-2">
        {subValue && (
          <span className="font-mono text-xs text-text-muted opacity-60">{subValue}</span>
        )}
        <span className={`font-mono text-lg font-bold ${textColorMap[color]}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
