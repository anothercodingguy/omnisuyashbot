'use client';

import React from 'react';

export function EditorialFooter() {
  return (
    <footer className="w-full border-t border-neutral-300/80 bg-[#F7F6F2] py-12 px-6 sm:px-12 mt-24">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-baseline justify-between gap-6 font-sans text-xs text-neutral-500">
        <div className="space-y-1">
          <div className="font-bold text-neutral-900 text-sm">
            SUYASH SINGH
          </div>
          <p className="text-neutral-500 max-w-sm leading-relaxed">
            AI Digital Twin conversational knowledge representative. 100% grounded in verified curriculum vitae.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-neutral-400">
          <span>LiveKit WebRTC</span>
          <span>·</span>
          <span>Next.js 15</span>
          <span>·</span>
          <span>Zero Hallucination</span>
          <span>·</span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
