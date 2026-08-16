'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function MinimalHeader() {
  return (
    <header className="w-full bg-[#FAFAF9]/95 backdrop-blur-xs border-b border-[#E8E8E6] sticky top-0 z-40 px-6 sm:px-12 py-4">
      <div className="max-w-[850px] mx-auto flex items-center justify-between">
        {/* Left: Name + Digital Twin Label (No SS Logo) */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            className="font-bold text-sm tracking-tight text-[#111111] hover:opacity-80 transition-opacity font-sans"
          >
            SUYASH SINGH
          </a>
          <span className="text-[11px] text-[#8A8A8A] font-mono uppercase tracking-wider">
            DIGITAL TWIN
          </span>
        </div>

        {/* Right: GitHub + Portfolio Links */}
        <div className="flex items-center gap-5 text-xs text-[#6B6B6B]">
          <a
            href="https://github.com/anothercodingguy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[#111111] hover:text-[#6B6B6B] transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-[#8A8A8A]" />
          </a>
          <a
            href="https://suyash.website"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[#111111] hover:text-[#6B6B6B] transition-colors"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-[#8A8A8A]" />
          </a>
        </div>
      </div>
    </header>
  );
}
