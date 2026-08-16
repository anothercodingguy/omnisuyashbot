'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { AgentPersona } from '@/lib/agents';
import { ArrowUpRight, Send, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isInterim?: boolean;
}

interface DigitalTwinConversationProps {
  messages: ChatMessage[];
  interimTranscript?: string;
  activePersona: AgentPersona;
  onSelectCitation: (citation: CitationItem) => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
}

export function DigitalTwinConversation({
  messages,
  interimTranscript,
  activePersona,
  onSelectCitation,
  onSendMessage,
  isLoading,
  isSpeaking,
}: DigitalTwinConversationProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // If no messages yet, show default persona greeting
  const displayMessages =
    messages.length === 0
      ? [
          {
            id: 'initial-greeting',
            sender: 'assistant' as const,
            text: activePersona.greeting,
            timestamp: 'Just now',
          },
        ]
      : messages;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      {/* ─── Header matching reference UI ─── */}
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400">
            Conversation
          </h3>
          <p className="text-xs text-neutral-500 font-sans">
            Live grounded transcript
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium">
          {activePersona.name}
        </div>
      </div>

      {/* ─── Messages Scroll Area ─── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {displayMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
            >
              {/* Message Bubble styled exactly like reference */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] px-4 py-3 text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-[#E8F1FC] text-[#1E293B] rounded-2xl rounded-tl-xs'
                    : 'bg-[#FDECE4] text-[#431407] rounded-2xl rounded-tr-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Verified Source Citations Pill */}
              {isAssistant && msg.citations && msg.citations.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 pl-1">
                  {msg.citations.map((c, idx) => (
                    <button
                      key={`${msg.id}-cite-${idx}`}
                      onClick={() => onSelectCitation(c)}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-neutral-50 border border-blue-200/80 hover:border-blue-400 text-[11px] text-neutral-600 hover:text-neutral-900 transition-all shadow-2xs"
                      title="Click to view verified source evidence"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="font-medium text-neutral-700">
                        {c.source}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">
                        {c.section} (P.{c.page})
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Interim User Speech Recognition */}
        {interimTranscript && (
          <div className="flex flex-col items-end animate-pulse">
            <div className="max-w-[82%] px-4 py-3 text-sm bg-[#FDECE4]/80 text-[#431407] rounded-2xl rounded-tr-xs italic">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-600 block mb-0.5">
                Listening…
              </span>
              &ldquo;{interimTranscript}&rdquo;
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─── Suggested Prompt Chips ─── */}
      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/60">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Suggested Inquiries</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activePersona.suggestedQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => onSendMessage(q)}
              className="text-left text-xs px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-neutral-900 transition-colors shadow-2xs disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Text Input Bar ─── */}
      <div className="p-4 border-t border-neutral-100 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask ${activePersona.name} anything…`}
            className="w-full pl-4 pr-11 py-2.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-1.5 p-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
