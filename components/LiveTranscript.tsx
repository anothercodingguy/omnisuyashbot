'use client';

import React, { useEffect, useRef } from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { ChatMessage } from '@/lib/types';
import { Bot, User, Bookmark, CheckCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

export type { ChatMessage };

interface LiveTranscriptProps {
  messages: ChatMessage[];
  interimTranscript?: string;
  onSelectCitation: (citation: CitationItem) => void;
  isSpeaking?: boolean;
}

export function LiveTranscript({
  messages,
  interimTranscript,
  onSelectCitation,
}: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !interimTranscript && (
          <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Start the Conversation</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Click &quot;Talk to Suyash&quot; to speak directly with his AI digital twin, or choose one of the suggested questions below.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm animate-in fade-in duration-300 ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {/* Assistant Avatar */}
              {isAssistant && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
                  <Image
                    src="/avatar.png"
                    alt="Suyash"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if avatar image missing
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Bot className="w-4 h-4 text-white hidden" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    isAssistant
                      ? 'bg-[#121826]/90 border border-white/10 text-slate-100 rounded-tl-sm'
                      : 'bg-indigo-600/90 text-white rounded-tr-sm border border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] font-medium opacity-60">
                    <span>{isAssistant ? 'Suyash AI' : 'You'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Grounded Citation Badges */}
                {isAssistant && msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      Sources:
                    </span>
                    {msg.citations.map((c, idx) => (
                      <button
                        key={`${msg.id}-cite-${idx}`}
                        onClick={() => onSelectCitation(c)}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 text-[11px] text-slate-300 hover:text-white transition-all shadow-sm"
                        title="Click to view verified source chunk"
                      >
                        <Bookmark className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300" />
                        <span className="font-medium text-indigo-200">
                          {c.source} · {c.section} (P.{c.page})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Interim User Speech Recognition */}
        {interimTranscript && (
          <div className="flex gap-3 text-sm justify-end animate-pulse">
            <div className="max-w-[75%] p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-slate-200 rounded-tr-sm italic text-xs leading-relaxed">
              <div className="text-[10px] font-medium text-indigo-400 mb-1">Transcribing speech...</div>
              &quot;{interimTranscript}&quot;
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
