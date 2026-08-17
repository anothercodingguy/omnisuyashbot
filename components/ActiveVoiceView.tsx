'use client';

import React, { useState } from 'react';
import { VoiceState } from './AudioOrb';
import { ChatMessage } from './MinimalConversationView';
import { CitationItem } from '@/lib/knowledge/grounding';
import { LiveFluidWave } from './LiveFluidWave';
import { FullTranscriptDrawer } from './FullTranscriptDrawer';
import {
  Pause,
  Play,
  X,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

interface ActiveVoiceViewProps {
  state: VoiceState;
  messages: ChatMessage[];
  interimTranscript: string;
  audioLevel: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  onRestartCall: () => void;
  onReturnToHome: () => void;
  onSendMessage: (text: string) => void;
  onSelectCitation: (citation: CitationItem) => void;
  onInterrupt?: () => void;
  errorMessage?: string | null;
}

export function ActiveVoiceView({
  state,
  messages,
  audioLevel,
  isMuted,
  onToggleMute,
  onEndCall,
  onRestartCall,
  onReturnToHome,
  onSelectCitation,
  onInterrupt,
  errorMessage,
}: ActiveVoiceViewProps) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const isCallActive = state !== 'idle' && state !== 'ended' && state !== 'error';
  const isEnded = state === 'ended';
  const isError = state === 'error';

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center bg-[#101114] text-[#E3E3E3] font-sans select-none overflow-hidden p-6 sm:p-10 relative">
      {/* ─── 1. Discreet Top Bar ─── */}
      <header className="w-full flex items-center justify-between z-20 shrink-0 max-w-5xl">
        {/* Left: Transcript Drawer trigger */}
        <button
          onClick={() => setIsTranscriptOpen(true)}
          className="p-2.5 rounded-full text-[#9E9E9E] hover:text-white hover:bg-[#1E1F20] transition-colors cursor-pointer"
          aria-label="View transcript"
          title="View Transcript"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Right: Active Live Status */}
        <div className="flex items-center gap-2">
          {isCallActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1F20]/80 border border-white/5 text-xs text-[#E3E3E3]">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
              <span className="font-medium text-xs">Live</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. Clean Center Hint Text (No chat/text clutter) ─── */}
      <div 
        onClick={() => { if (state === 'speaking') onInterrupt?.(); }}
        className="my-auto text-center space-y-2 z-10 max-w-lg px-4 cursor-pointer"
      >
        {isEnded ? (
          <div className="space-y-1">
            <h2 className="text-xl font-normal text-[#E3E3E3]">Conversation ended</h2>
            <p className="text-xs text-[#9E9E9E]">Ask Suyash something else or restart anytime.</p>
          </div>
        ) : isError ? (
          <div className="space-y-1">
            <h2 className="text-xl font-normal text-[#F28B82]">Connection notice</h2>
            <p className="text-xs text-[#9E9E9E]">{errorMessage || 'Could not connect to voice.'}</p>
          </div>
        ) : state === 'thinking' ? (
          <p className="text-sm sm:text-base text-[#9E9E9E] font-normal tracking-wide">
            Thinking…
          </p>
        ) : state === 'connecting' ? (
          <p className="text-sm sm:text-base text-[#9E9E9E] font-normal tracking-wide">
            Connecting…
          </p>
        ) : (
          <p className="text-sm sm:text-base text-[#9E9E9E] font-normal tracking-wide leading-relaxed">
            To interrupt Suyash AI,<br />
            tap or start talking
          </p>
        )}
      </div>

      {/* ─── 3. Full-Width Glowing Aurora Fluid Wave (Bottom Half) ─── */}
      <div 
        onClick={() => { if (state === 'speaking') onInterrupt?.(); }}
        className="w-full max-w-5xl h-[320px] sm:h-[380px] shrink-0 relative z-10 cursor-pointer"
      >
        <LiveFluidWave state={state} audioLevel={audioLevel} />
      </div>

      {/* ─── 4. Bottom Controls (Hold / End) ─── */}
      <div className="w-full flex justify-center items-center pt-6 pb-2 shrink-0 z-20">
        {isCallActive ? (
          <div className="flex items-center justify-center gap-10">
            {/* Hold / Pause Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isMuted
                    ? 'bg-[#3C4043] text-[#F28B82] border border-[#F28B82]/30'
                    : 'bg-[#282A2C] text-white hover:bg-[#3C4043] border border-white/10'
                }`}
                aria-label={isMuted ? 'Resume' : 'Hold'}
              >
                {isMuted ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
              </button>
              <span className="text-xs text-[#9E9E9E] font-medium">
                {isMuted ? 'Resume' : 'Hold'}
              </span>
            </div>

            {/* End Button (Red circle) */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onEndCall}
                className="w-14 h-14 rounded-full bg-[#EA4335] hover:bg-[#D93025] text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
                aria-label="End conversation"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-xs text-[#9E9E9E] font-medium">End</span>
            </div>
          </div>
        ) : (
          /* Ended State Controls */
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onRestartCall}
              className="px-6 py-3 rounded-full bg-[#E3E3E3] text-[#131314] hover:bg-white font-medium text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Talk again</span>
            </button>
            <button
              onClick={onReturnToHome}
              className="px-6 py-3 rounded-full bg-[#282A2C] text-white hover:bg-[#3C4043] border border-white/10 font-medium text-sm shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              Back to home
            </button>
          </div>
        )}
      </div>

      {/* ─── 5. Full Transcript Drawer (Only visible when user taps transcript icon) ─── */}
      <FullTranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        messages={messages}
        onSelectCitation={onSelectCitation}
      />
    </div>
  );
}
