'use client';

import React, { useEffect, useRef } from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { ArrowUpRight, FileText } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isInterim?: boolean;
}

interface EditorialTranscriptProps {
  messages: ChatMessage[];
  interimTranscript?: string;
  onSelectCitation: (citation: CitationItem) => void;
  isSpeaking?: boolean;
}

export function EditorialTranscript({
  messages,
  interimTranscript,
  onSelectCitation,
}: EditorialTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  if (messages.length === 0 && !interimTranscript) {
    return (
      <div className="py-12 text-center max-w-xl mx-auto">
        <p className="text-sm text-neutral-500 font-sans leading-relaxed">
          The conversation transcript will appear here in real time as you speak or inquire.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 font-sans">
      {messages.map((msg, index) => {
        const isAssistant = msg.sender === 'assistant';

        return (
          <div
            key={msg.id}
            className={`space-y-2 pt-4 ${index !== 0 ? 'border-t border-neutral-200/80' : ''}`}
          >
            {/* Speaker Header */}
            <div className="flex items-center justify-between text-xs tracking-wider uppercase text-neutral-400 font-mono">
              <span className="font-semibold text-neutral-700">
                {isAssistant ? 'Suyash AI' : 'You'}
              </span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Message Body */}
            <div className="text-base text-neutral-900 leading-relaxed font-normal whitespace-pre-wrap">
              {msg.text}
            </div>

            {/* Grounded Citation Evidence Line */}
            {isAssistant && msg.citations && msg.citations.length > 0 && (
              <div className="pt-2 mt-3 space-y-1.5 border-t border-neutral-100">
                {msg.citations.map((c, idx) => (
                  <button
                    key={`${msg.id}-cite-${idx}`}
                    onClick={() => onSelectCitation(c)}
                    className="group w-full text-left py-1 flex items-center justify-between text-xs text-neutral-600 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-neutral-400 font-medium">
                        [{String(idx + 1).padStart(2, '0')}]
                      </span>
                      <FileText className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                      <span className="font-medium text-neutral-800">
                        {c.source}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">
                        {c.section} / {c.entity}
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        (P.{c.page})
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-blue-600 font-medium transition-colors">
                      <span>View source</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Interim Transcribed User Speech */}
      {interimTranscript && (
        <div className="space-y-2 pt-4 border-t border-neutral-200/80 animate-pulse">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase text-blue-600 font-mono">
            <span>You (Speaking…)</span>
          </div>
          <div className="text-base text-neutral-500 italic leading-relaxed">
            &ldquo;{interimTranscript}&rdquo;
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
