'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './MinimalConversationView';
import { CitationItem } from '@/lib/knowledge/grounding';
import { X, ArrowUpRight, MessageSquare, Send } from 'lucide-react';

interface FullTranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSelectCitation: (citation: CitationItem) => void;
  onSendMessage?: (text: string) => void;
}

export function FullTranscriptDrawer({
  isOpen,
  onClose,
  messages,
  onSelectCitation,
  onSendMessage,
}: FullTranscriptDrawerProps) {
  const [inputVal, setInputVal] = React.useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-[var(--line)] p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden font-sans text-[var(--text-primary)] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] shrink-0">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
              CONVERSATION TRANSCRIPT
            </span>
            <h3 className="font-semibold text-base text-[var(--text-primary)]">
              Full History ({messages.length} {messages.length === 1 ? 'message' : 'messages'})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--line)] transition-colors cursor-pointer"
            aria-label="Close transcript drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] space-y-2 py-12">
              <MessageSquare className="w-6 h-6 opacity-40" />
              <p className="text-sm">No messages yet. Speak to Suyash to start.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div key={msg.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold font-mono tracking-wider uppercase text-[var(--text-muted)]">
                      {isAssistant ? 'Suyash AI' : 'You'}
                    </span>
                    {msg.timestamp && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                      isAssistant ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Grounded Citation Badge */}
                  {isAssistant && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-2">
                      {msg.citations.map((c, idx) => (
                        <button
                          key={`${msg.id}-cite-${idx}`}
                          onClick={() => {
                            onSelectCitation(c);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-0.5"
                        >
                          <span className="text-[var(--accent-green)] font-medium">✓ Verified</span>
                          <span className="text-[var(--text-muted)]">·</span>
                          <span className="underline underline-offset-3 decoration-[var(--line-hover)] hover:decoration-[var(--text-primary)] truncate max-w-[280px]">
                            {c.source} · {c.section} · p.{c.page}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Optional Text Input Bar */}
        {onSendMessage && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputVal.trim()) {
                onSendMessage(inputVal.trim());
                setInputVal('');
              }
            }}
            className="pt-3 pb-1 border-t border-[var(--line)] shrink-0 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question about my work or projects..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--line)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-lg bg-white hover:bg-neutral-200 text-[#0A0D14] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--line)] shrink-0 flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Grounded on verified profile sources
          </span>
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
