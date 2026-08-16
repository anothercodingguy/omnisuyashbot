'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function EditorialHeader() {
  return (
    <header className="w-full border-b border-neutral-300/80 bg-[#F7F6F2]/90 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-baseline gap-3">
          <a href="#" className="font-bold text-neutral-900 text-sm tracking-tight hover:opacity-80 transition-opacity">
            SUYASH SINGH
          </a>
          <span className="text-neutral-400 text-xs font-mono">/</span>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            AI Digital Twin
          </span>
        </div>

        {/* Quiet Grounding Trust Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-sans text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Grounded in verified sources · Resume</span>
        </div>

        {/* External Links */}
        <nav className="flex items-center gap-4 text-xs font-medium text-neutral-600">
          <a
            href="https://github.com/anothercodingguy"
            target="_blank"
            rel="noreferrer"
            className="editorial-link hover:text-neutral-900 transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-400 arrow-shift" />
          </a>
          <a
            href="https://linkedin.com/in/suyashin"
            target="_blank"
            rel="noreferrer"
            className="editorial-link hover:text-neutral-900 transition-colors"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-400 arrow-shift" />
          </a>
          <a
            href="mailto:suyashs787@gmail.com"
            className="editorial-link hover:text-neutral-900 transition-colors hidden sm:inline-flex"
          >
            <span>Email</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-400 arrow-shift" />
          </a>
        </nav>
      </div>
    </header>
  );
}
