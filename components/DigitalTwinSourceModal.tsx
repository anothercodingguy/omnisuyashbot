'use client';

import React from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { X, Check, Copy, FileText, CheckCircle2 } from 'lucide-react';

interface DigitalTwinSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation: CitationItem | null;
}

export function DigitalTwinSourceModal({
  isOpen,
  onClose,
  citation,
}: DigitalTwinSourceModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/25 backdrop-blur-[2px] transition-opacity duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-Over Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-neutral-200 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 font-sans">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Evidence Citation
              </span>
              <h3 className="font-semibold text-neutral-900 text-base">
                {citation.entity || citation.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 100% Grounded Status */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-emerald-900 block">
                100% Grounded in Official Profile
              </span>
              <span className="text-emerald-700 mt-0.5 block leading-relaxed">
                This factual claim is directly verified against Suyash Singh’s authoritative curriculum vitae.
              </span>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider block">
                Source Document
              </span>
              <span className="font-medium text-neutral-800 mt-1 block">
                {citation.source}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider block">
                Section & Page
              </span>
              <span className="font-medium text-blue-700 mt-1 block">
                {citation.section} · P.{citation.page}
              </span>
            </div>
          </div>

          {/* Exact Verified Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Exact Verified Excerpt
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-800 text-sm leading-relaxed shadow-2xs font-sans">
              {citation.snippet}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
