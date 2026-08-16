'use client';

import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export function DigitalTwinHeader() {
  return (
    <header className="w-full bg-white border-b border-neutral-200/80 px-6 sm:px-10 py-3.5 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
            SS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 text-sm tracking-tight font-sans">
                SUYASH SINGH
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                Digital Twin
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Conversational Voice Agent powered by LiveKit
            </p>
          </div>
        </div>

        {/* Right Grounding Trust Indicator & Socials */}
        <div className="flex items-center gap-4 text-xs font-sans text-neutral-600">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Grounded in Official CV</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/anothercodingguy"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://linkedin.com/in/suyashin"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
