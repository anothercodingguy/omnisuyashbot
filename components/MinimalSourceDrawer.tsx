'use client';

import React from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { X, Check, Copy } from 'lucide-react';

interface MinimalSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citation: CitationItem | null;
}

export function MinimalSourceDrawer({
  isOpen,
  onClose,
  citation,
}: MinimalSourceDrawerProps) {
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
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/20 backdrop-blur-[1px] transition-opacity">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Document-like plain side sheet */}
      <div className="relative w-full max-w-md h-full bg-[#FFFFFF] border-l border-[#EAEAEA] p-8 flex flex-col justify-between shadow-lg overflow-y-auto font-sans">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                SOURCE
              </span>
              <h3 className="font-semibold text-base text-[#111111]">
                {citation.entity || citation.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#888888] hover:text-[#111111] hover:bg-[#FAFAF9] transition-colors"
              aria-label="Close source drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Simple Document Metadata */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
              <span className="text-[#888888]">Document</span>
              <span className="font-medium text-[#111111]">{citation.source}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
              <span className="text-[#888888]">Section</span>
              <span className="font-medium text-[#111111]">{citation.section}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
              <span className="text-[#888888]">Page</span>
              <span className="font-medium text-[#111111]">Page {citation.page}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
              <span className="text-[#888888]">Status</span>
              <span className="text-[#16A34A] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Verified from resume
              </span>
            </div>
          </div>

          {/* Excerpt Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Relevant excerpt
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-[#666666] hover:text-[#111111] flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-md bg-[#FAFAF9] border border-[#EAEAEA] text-[#222222] text-sm leading-relaxed font-sans">
              &ldquo;{citation.snippet}&rdquo;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#EAEAEA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
