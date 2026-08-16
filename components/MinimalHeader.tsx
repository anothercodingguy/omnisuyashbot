'use client';

import React from 'react';
import { ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function MinimalHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-[var(--bg)]/95 backdrop-blur-xs border-b border-[var(--line)] sticky top-0 z-40 px-6 sm:px-12 py-3.5 transition-colors">
      <div className="max-w-[850px] mx-auto flex items-center justify-between">
        {/* Left: Name + Digital Twin Label */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            className="font-bold text-sm tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity font-sans"
          >
            SUYASH SINGH
          </a>
          <span className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
            DIGITAL TWIN
          </span>
        </div>

        {/* Right: GitHub + Portfolio Links + Dark Mode Toggle */}
        <div className="flex items-center gap-5 text-xs text-[var(--text-secondary)]">
          <a
            href="https://github.com/anothercodingguy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
          </a>
          <a
            href="https://suyash.website"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--line)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#6B6B6B]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
