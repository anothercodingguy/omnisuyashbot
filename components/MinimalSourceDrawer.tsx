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

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    if (!citation) return;
    const text = `Source: ${citation.source} (${citation.section}, Page ${citation.page})\n${citation.snippet || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Document-like plain side sheet */}
      <div className="relative w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--line)] p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto font-sans text-[var(--text-primary)] animate-in slide-in-from-right duration-250">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                SOURCE
              </span>
              <h3 className="font-semibold text-base text-[var(--text-primary)]">
                {citation.entity || citation.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--line)] transition-colors cursor-pointer"
              aria-label="Close source drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Simple Document Metadata */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[var(--line)]">
              <span className="text-[var(--text-muted)]">Document</span>
              <span className="font-medium text-[var(--text-primary)]">{citation.source}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--line)]">
              <span className="text-[var(--text-muted)]">Section</span>
              <span className="font-medium text-[var(--text-primary)]">{citation.section}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--line)]">
              <span className="text-[var(--text-muted)]">Page</span>
              <span className="font-medium text-[var(--text-primary)]">Page {citation.page}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--line)]">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className="text-[var(--accent-green)] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                Verified from resume
              </span>
            </div>
          </div>

          {/* Excerpt Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Relevant excerpt
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[var(--accent-green)]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-md bg-[var(--bg-input)] border border-[var(--line)] text-[var(--text-primary)] text-sm leading-relaxed font-sans">
              &ldquo;{citation.snippet}&rdquo;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--line)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
