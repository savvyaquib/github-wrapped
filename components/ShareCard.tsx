"use client";

/**
 * ShareCard Component
 *
 * Responsibility: Renders the final summary card with a luxurious, premium dev-vibe.
 * Provides actions to download the card as a PNG or share via Web Share API.
 */

import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { IWrapped } from "@/models/Wrapped";
import { Download, Share2, Loader2 } from "lucide-react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function ShareCard({
  data,
}: {
  data: Omit<IWrapped, "createdAt">;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isExporting) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation (max 10 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });

    // Calculate glare position
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.2,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);

      // Reset tilt before snapshot
      setRotate({ x: 0, y: 0 });
      setGlare({ ...glare, opacity: 0 });

      // Give React a moment to apply the flat state
      await new Promise((resolve) => setTimeout(resolve, 50));

      // We use html-to-image to snapshot the card
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, // Ultra-high res for bragging
        filter: (node) => {
          if (node.classList?.contains("no-export")) return false;
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `${data.username}-github-wrapped-2026.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.username}'s GitHub Wrapped`,
          text: `I made ${data.totalContributions.toLocaleString()} open-source contributions this year! Check out my GitHub Wrapped.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col items-center"
      style={{ perspective: "1200px" }}
    >
      {/* 3D Tilt Wrapper */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition:
            rotate.x === 0 && rotate.y === 0
              ? "transform 0.5s ease-out"
              : "transform 0.1s ease-out",
          transformStyle: "preserve-3d",
        }}
        className="w-full relative cursor-crosshair group"
      >
        {/* The Premium Card to be exported */}
        <div
          ref={cardRef}
          className={`${space.className} relative w-full rounded-[24px] overflow-hidden shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] p-[1px]`}
        >
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-700 to-purple-900 opacity-90" />

          {/* Inner Card */}
          <div className="relative w-full h-full bg-[#09090b] rounded-[23px] overflow-hidden flex flex-col">
            {/* Dynamic Glare Effect */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-50 rounded-[23px] mix-blend-overlay"
              style={{
                opacity: glare.opacity,
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
              }}
            />

            {/* Noise texture overlay for premium matte finish */}
            <div
              className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  'url("https://grainy-gradients.vercel.app/noise.svg")',
              }}
            ></div>

            {/* Glowing orbs in the background */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Top Bar */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 relative z-10">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/80"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span
                  className={`text-white/60 text-[10px] tracking-[0.2em] uppercase ${jetbrains.className}`}
                >
                  GITHUB WRAPPED '26
                </span>
              </div>
              <div
                className={`text-green-400 text-[10px] tracking-[0.2em] font-bold uppercase ${jetbrains.className} flex items-center space-x-2`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>VERIFIED</span>
              </div>
            </div>

            {/* Main Content */}
            <div
              className="p-8 pb-10 flex flex-col items-center relative z-10"
              style={{
                transform: "translateZ(30px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* User Profile */}
              <div
                className="flex flex-col items-center mb-10 transition-transform duration-200"
                style={{
                  transform: `translateX(${rotate.y * -0.5}px) translateY(${rotate.x * 0.5}px)`,
                }}
              >
                <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-green-400 via-emerald-500 to-purple-600 mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <img
                    src={
                      data.avatarUrl ||
                      `https://github.com/${data.username}.png`
                    }
                    alt={data.username}
                    crossOrigin="anonymous" // Crucial for html-to-image canvas rendering
                    className="w-full h-full rounded-full object-cover border-4 border-[#09090b]"
                  />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  @{data.username}
                </h1>
                <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <p
                    className={`text-emerald-400 text-[10px] tracking-widest font-semibold ${jetbrains.className}`}
                  >
                    ELITE CONTRIBUTOR
                  </p>
                </div>
              </div>

              {/* Big Stat: Total Contributions */}
              <div
                className="w-full bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-2xl p-8 mb-4 flex flex-col items-center relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-200"
                style={{
                  transform: `translateX(${rotate.y * -0.3}px) translateY(${rotate.x * 0.3}px)`,
                }}
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
                <span
                  className={`text-white/60 text-[11px] tracking-[0.2em] uppercase mb-3 ${jetbrains.className}`}
                >
                  Total Commits
                </span>
                <span className="text-7xl font-extrabold bg-gradient-to-b from-white via-green-100 to-green-500 text-transparent bg-clip-text drop-shadow-[0_2px_20px_rgba(16,185,129,0.4)]">
                  {data.totalContributions.toLocaleString()}
                </span>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <StatCard
                  label="Longest Streak"
                  value={`${data.longestStreak} days`}
                  jetbrains={jetbrains.className}
                />
                <StatCard
                  label="Top Language"
                  value={data.topLanguages[0]?.name || "N/A"}
                  subValue={
                    data.topLanguages.length > 0
                      ? `${data.topLanguages[0].percentage}%`
                      : undefined
                  }
                  jetbrains={jetbrains.className}
                />
                <StatCard
                  label="Most Active"
                  value={data.mostActiveWeekday}
                  jetbrains={jetbrains.className}
                />
                <StatCard
                  label="Stars Earned"
                  value={data.totalStars.toLocaleString()}
                  jetbrains={jetbrains.className}
                />
                <StatCard
                  label="Total Repos"
                  value={(data.totalRepos || 0).toLocaleString()}
                  jetbrains={jetbrains.className}
                />
                <StatCard
                  label="Account Age"
                  value={`${data.accountAgeInYears} year${data.accountAgeInYears === 1 ? '' : 's'}`}
                  jetbrains={jetbrains.className}
                />
              </div>

              <div
                className={`mt-12 text-[9px] text-white/30 tracking-[0.3em] uppercase ${jetbrains.className}`}
              >
                github-wrapped.vercel.app
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Not exported in PNG) */}
      <div className="mt-8 flex space-x-4 w-full no-export">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-sans font-medium py-4 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-400" />
          ) : (
            <Download className="w-5 h-5 mr-2 text-green-400" />
          )}
          Download HD
        </button>
        <button
          onClick={handleShare}
          disabled={isExporting}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-sans font-medium py-4 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share to brag
        </button>
      </div>
    </div>
  );
}

// Helper component for uniform rows
function StatCard({
  label,
  value,
  subValue,
  jetbrains,
}: {
  label: string;
  value: string;
  subValue?: string;
  jetbrains: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-colors rounded-[16px] p-5 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:to-green-500/5 transition-colors"></div>
      <span
        className={`text-white/40 text-[9px] tracking-widest uppercase mb-4 ${jetbrains}`}
      >
        {label}
      </span>
      <div className="flex items-baseline space-x-2 relative z-10">
        <span className="text-xl font-bold text-white tracking-tight">
          {value}
        </span>
        {subValue && (
          <span
            className={`text-emerald-400 text-xs font-semibold ${jetbrains}`}
          >
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
