'use client';

import React from 'react';
import { ArrowUpRight, MessageSquare } from 'lucide-react';

interface MinimalHeaderProps {
  onOpenTranscript?: () => void;
}

export function MinimalHeader({ onOpenTranscript }: MinimalHeaderProps) {
  return (
    <header className="w-full bg-[#131314] px-6 py-4 flex items-center justify-between z-40 shrink-0">
      {/* Left: Chat icon */}
      <button
        onClick={onOpenTranscript}
        className="p-2.5 rounded-full text-[#9E9E9E] hover:text-white hover:bg-[#1E1F20] transition-colors cursor-pointer"
        aria-label="View history"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Right: GitHub / Portfolio & Avatar */}
      <div className="flex items-center gap-4 text-xs text-[#9E9E9E]">
        <a
          href="https://github.com/anothercodingguy"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>GitHub</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
        <a
          href="https://suyash.website"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>Portfolio</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>

        {/* Profile Avatar with Google/Gemini style subtle gradient ring */}
        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#9B72CB] to-[#D96570]">
          <div className="w-7 h-7 rounded-full bg-[#1E1F20] flex items-center justify-center text-[11px] font-bold text-white font-mono">
            SS
          </div>
        </div>
      </div>
    </header>
  );
}
