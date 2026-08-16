'use client';

import React from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { X, CheckCircle2, FileText, Bookmark, Sparkles, Copy, Check } from 'lucide-react';

interface SourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citation: CitationItem | null;
}

export function SourceDrawer({ isOpen, onClose, citation }: SourceDrawerProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg h-full bg-[#0d1117] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Verified Source Citation</h3>
                <p className="text-xs text-slate-400">Authoritative Resume Profile Grounding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verification Badge */}
          <div className="my-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                100% Grounded Evidence
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                This factual statement was validated against Suyash&apos;s verified curriculum vitae with zero AI hallucination.
              </p>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Document</span>
              <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                {citation.source}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Section & Page</span>
              <div className="text-sm font-semibold text-indigo-300 mt-1">
                {citation.section} · P.{citation.page}
              </div>
            </div>
          </div>

          {/* Entity & Chunk ID */}
          <div className="mb-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Entity / Subject</span>
            <div className="text-base font-semibold text-white mt-0.5">{citation.entity || citation.title}</div>
            <div className="text-xs text-slate-400 font-mono mt-1 bg-black/40 px-2.5 py-1 rounded inline-block border border-white/5">
              ID: {citation.source_id}
            </div>
          </div>

          {/* Verified Content Excerpt */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Exact Verified Excerpt
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-sm leading-relaxed font-sans font-normal selection:bg-indigo-500/30">
              {citation.snippet}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
