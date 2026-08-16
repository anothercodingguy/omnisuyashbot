'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CitationItem } from '@/lib/knowledge/grounding';
import { VoiceState } from './AudioOrb';
import { Mic, MicOff, ArrowUp, ArrowUpRight } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
}

interface MinimalConversationViewProps {
  messages: ChatMessage[];
  interimTranscript: string;
  voiceState: VoiceState;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  onSendMessage: (text: string) => void;
  onSelectCitation: (citation: CitationItem) => void;
  isLoading: boolean;
}

export function MinimalConversationView({
  messages,
  interimTranscript,
  voiceState,
  isMuted,
  onToggleMute,
  onEndCall,
  onSendMessage,
  onSelectCitation,
  isLoading,
}: MinimalConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [inputText, setInputText] = useState('');

  const isConnected = voiceState !== 'idle' && voiceState !== 'ended' && voiceState !== 'error';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getVoiceStateLabel = () => {
    switch (voiceState) {
      case 'listening':
        return { text: 'Listening…', dotColor: 'bg-[var(--accent-green)] animate-subtle-pulse' };
      case 'thinking':
        return { text: 'Thinking…', dotColor: 'bg-[var(--text-muted)] animate-subtle-pulse' };
      case 'speaking':
        return { text: 'Speaking…', dotColor: 'bg-[var(--accent-green)]' };
      case 'connecting':
      case 'reconnecting':
        return { text: 'Reconnecting…', dotColor: 'bg-[#D97706] animate-subtle-pulse' };
      case 'error':
        return { text: 'Conversation ended', dotColor: 'bg-[#DC2626]' };
      default:
        return { text: 'Ready', dotColor: 'bg-[var(--text-muted)]' };
    }
  };

  const stateInfo = getVoiceStateLabel();

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-10 font-sans text-left">
      {/* ─── Active Conversation Status Header ─── */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stateInfo.dotColor}`} />
          <span className="font-semibold text-[var(--text-primary)]">Suyash AI</span>
          <span className="text-[var(--text-muted)]">· {stateInfo.text}</span>
        </div>

        {isConnected && (
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMute}
              className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5 text-[#DC2626]" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button
              onClick={onEndCall}
              className="text-[#DC2626] hover:text-[#B91C1C] font-medium transition-colors cursor-pointer"
            >
              End conversation
            </button>
          </div>
        )}
      </div>

      {/* ─── Messages Stream (Clean Text Editorial Layout) ─── */}
      <div className="space-y-10 min-h-[260px]">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div key={msg.id} className="space-y-2">
              {/* Speaker Label */}
              <div className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
                {isAssistant ? 'Suyash AI' : 'You'}
              </div>

              {/* Message Content */}
              <div
                className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${
                  isAssistant ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {msg.text}
              </div>

              {/* Grounded Footnote Citation */}
              {isAssistant && msg.citations && msg.citations.length > 0 && (
                <div className="pt-2">
                  {msg.citations.map((c, idx) => (
                    <button
                      key={`${msg.id}-cite-${idx}`}
                      onClick={() => onSelectCitation(c)}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <span className="text-[var(--accent-green)] font-medium">✓ Verified</span>
                      <span className="text-[var(--text-muted)]">·</span>
                      <span className="underline underline-offset-3 decoration-[var(--line-hover)] hover:decoration-[var(--text-primary)]">
                        {c.source} · {c.section} {c.entity ? `· ${c.entity}` : ''} · p.{c.page}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Interim User Speech Recognition */}
        {interimTranscript && (
          <div className="space-y-1.5 p-4 rounded-md bg-[var(--bg-input)] border border-[var(--accent-green)]/30 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-green)] tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-ping" />
              <span>You (speaking…)</span>
            </div>
            <div className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed">
              &ldquo;{interimTranscript}&rdquo;
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─── Bottom Input Bar ─── */}
      <div className="pt-6 border-t border-[var(--line)]">
        <form onSubmit={handleTextSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask something about Suyash..."
            className="w-full py-3.5 pl-4 pr-12 text-sm bg-[var(--bg-input)] border border-[var(--line)] rounded-md text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] transition-colors shadow-2xs disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2.5 p-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:opacity-90 disabled:opacity-30 transition-colors cursor-pointer"
            aria-label="Send inquiry"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
