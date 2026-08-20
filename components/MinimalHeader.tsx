'use client';

import React from 'react';
import { ArrowUpRight, MessageSquare } from 'lucide-react';

interface MinimalHeaderProps {
  onOpenTranscript?: () => void;
}

export function MinimalHeader({ onOpenTranscript }: MinimalHeaderProps) {
  return (
    <header className="w-full bg-transparent flex items-center justify-between z-40 shrink-0">
      {/* Left: Chat history button */}
      <button
        onClick={onOpenTranscript}
        className="p-2.5 rounded-full text-[#9A9EA6] hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
        aria-label="View history"
        title="View conversation history"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {/* Right: GitHub / Portfolio & Links */}
      <div className="flex items-center gap-4 text-xs text-[#9A9EA6]">
        <a
          href="https://github.com/anothercodingguy"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>GitHub</span>
          <ArrowUpRight className="w-3 h-3 text-[#6C768A]" />
        </a>
        <a
          href="https://suyash.website"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>Portfolio</span>
          <ArrowUpRight className="w-3 h-3 text-[#6C768A]" />
        </a>
      </div>
    </header>
  );
}
