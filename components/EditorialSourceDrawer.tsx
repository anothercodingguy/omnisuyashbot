'use client';

import React from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { X, Check, Copy } from 'lucide-react';

interface EditorialSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citation: CitationItem | null;
}

export function EditorialSourceDrawer({
  isOpen,
  onClose,
  citation,
}: EditorialSourceDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    if (!citation) return;
    const text = `Source: ${citation.source} (${citation.section}, Page ${citation.page})\n${citation.snippet || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-[2px] transition-opacity duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Side Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#F7F6F2] border-l border-neutral-300/80 p-8 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-300/80">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                Verified Source Evidence
              </span>
              <h3 className="font-semibold text-neutral-900 text-base font-sans">
                {citation.entity || citation.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
              aria-label="Close source drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grounding Status Indicator */}
          <div className="py-2.5 px-3 rounded-md bg-neutral-200/50 border border-neutral-300/60 flex items-center justify-between text-xs">
            <span className="text-neutral-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              100% Grounded in Official Profile
            </span>
            <span className="font-mono text-[11px] text-neutral-400">P.{citation.page}</span>
          </div>

          {/* Metadata Table */}
          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between py-2 border-b border-neutral-200/80">
              <span className="text-neutral-400 uppercase tracking-wider">Document</span>
              <span className="font-medium text-neutral-800">{citation.source}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-200/80">
              <span className="text-neutral-400 uppercase tracking-wider">Section</span>
              <span className="font-medium text-neutral-800">{citation.section}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-200/80">
              <span className="text-neutral-400 uppercase tracking-wider">Source ID</span>
              <span className="font-mono text-neutral-600">{citation.source_id}</span>
            </div>
          </div>

          {/* Verified Content Excerpt */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                Verified Excerpt
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-sans text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-sm leading-relaxed font-sans shadow-xs">
              {citation.snippet}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-300/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
