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
        return { text: 'Listening…', dotColor: 'bg-[#16A34A] animate-subtle-pulse' };
      case 'thinking':
        return { text: 'Thinking…', dotColor: 'bg-[#8A8A8A] animate-subtle-pulse' };
      case 'speaking':
        return { text: 'Speaking…', dotColor: 'bg-[#16A34A]' };
      case 'connecting':
      case 'reconnecting':
        return { text: 'Reconnecting…', dotColor: 'bg-[#D97706] animate-subtle-pulse' };
      case 'error':
        return { text: 'Conversation ended', dotColor: 'bg-[#DC2626]' };
      default:
        return { text: 'Ready', dotColor: 'bg-[#8A8A8A]' };
    }
  };

  const stateInfo = getVoiceStateLabel();

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-10 font-sans text-left">
      {/* ─── Active Conversation Status Header ─── */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E6] text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stateInfo.dotColor}`} />
          <span className="font-semibold text-[#111111]">Suyash AI</span>
          <span className="text-[#8A8A8A]">· {stateInfo.text}</span>
        </div>

        {isConnected && (
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMute}
              className="inline-flex items-center gap-1 text-[#6B6B6B] hover:text-[#111111] transition-colors cursor-pointer"
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
              <div className="text-xs font-semibold text-[#8A8A8A] tracking-wider uppercase">
                {isAssistant ? 'Suyash AI' : 'You'}
              </div>

              {/* Message Content */}
              <div
                className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${
                  isAssistant ? 'text-[#111111]' : 'text-[#555555]'
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
                      className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#111111] transition-colors cursor-pointer"
                    >
                      <span className="text-[#16A34A] font-medium">✓ Verified</span>
                      <span className="text-[#8A8A8A]">·</span>
                      <span className="underline underline-offset-3 decoration-[#D4D4D4] hover:decoration-[#111111]">
                        {c.source} · {c.section} {c.entity ? `· ${c.entity}` : ''} · p.{c.page}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-[#8A8A8A]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Interim User Speech Recognition */}
        {interimTranscript && (
          <div className="space-y-2 animate-pulse">
            <div className="text-xs font-semibold text-[#16A34A] tracking-wider uppercase">
              You (speaking…)
            </div>
            <div className="text-base sm:text-lg text-[#6B6B6B] italic leading-relaxed">
              &ldquo;{interimTranscript}&rdquo;
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─── Bottom Input Bar ─── */}
      <div className="pt-6 border-t border-[#E8E8E6]">
        <form onSubmit={handleTextSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask something about Suyash..."
            className="w-full py-3.5 pl-4 pr-12 text-sm bg-white border border-[#E8E8E6] rounded-md text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:border-[#111111] transition-colors shadow-2xs disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2.5 p-2 rounded-md bg-[#111111] text-white hover:bg-[#333333] disabled:bg-[#E8E8E6] disabled:text-[#8A8A8A] transition-colors cursor-pointer"
            aria-label="Send inquiry"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
