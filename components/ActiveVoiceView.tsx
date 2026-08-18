'use client';

import React, { useState } from 'react';
import { VoiceState } from './AudioOrb';
import { ChatMessage } from './MinimalConversationView';
import { CitationItem } from '@/lib/knowledge/grounding';
import { InteractivePlasmaOrb } from './InteractivePlasmaOrb';
import { FullTranscriptDrawer } from './FullTranscriptDrawer';
import { MinimalHeader } from './MinimalHeader';
import {
  Pause,
  Play,
  X,
  RotateCcw,
  MessageSquare,
  Sparkles,
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
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isConnecting = state === 'connecting' || state === 'reconnecting';

  return (
    <div className="h-screen w-screen bg-[#030509] text-[#E3E3E3] flex flex-col font-sans select-none overflow-hidden relative">
      {/* Subtle Ambient Cosmic Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-radial from-[#00E5FF]/8 via-[#1E88E5]/4 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-radial from-[#1E88E5]/10 via-[#0A193B]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="h-full w-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <header className="w-full flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#12151D] border border-white/10 flex items-center justify-center font-mono text-xs text-white font-bold">
              SS
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-xs sm:text-sm text-white tracking-wide">
                Suyash Singh AI
              </span>
              <span className="text-[10px] text-[#8E95A5] font-mono">
                Digital Twin · Realtime Voice
              </span>
            </div>
          </div>

          {/* Right Status Pill & Transcript Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="p-2 rounded-full text-[#9A9EA6] hover:text-white hover:bg-[#12151D] transition-colors cursor-pointer border border-white/5"
              aria-label="View transcript"
              title="View Transcript"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {isCallActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12151D]/90 border border-white/10 text-xs text-[#E3E3E3]">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="font-medium text-xs">Live Voice</span>
              </div>
            )}
          </div>
        </header>

        {/* Connection Notice if any */}
        {errorMessage && (
          <div className="w-full max-w-md pt-2 shrink-0 mx-auto">
            <div className="p-3.5 rounded-2xl bg-[#2A1515] border border-[#5A2525] text-xs text-[#FC8181] flex items-center justify-between shadow-md">
              <div className="space-y-0.5">
                <span className="font-semibold block">Voice Connection Notice</span>
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={onRestartCall}
                className="px-3 py-1.5 rounded-lg bg-[#C53030] text-white text-xs font-medium hover:bg-[#9B2C2C] transition-colors cursor-pointer shrink-0 ml-3"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Grid (Identical Layout to Homepage) */}
        <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
          {/* Left Column: Voice Status & Resume/Cancel Action Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 z-20">
            {/* Live Voice State Indicator */}
            <div className="space-y-3">
              {isEnded ? (
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                    Conversation Ended
                  </h2>
                  <p className="text-sm sm:text-base text-[#9A9EA6]">
                    Feel free to start another conversation anytime.
                  </p>
                </div>
              ) : isError ? (
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-light text-[#F28B82] tracking-tight">
                    Connection Notice
                  </h2>
                  <p className="text-sm sm:text-base text-[#9A9EA6]">
                    {errorMessage || 'Voice connection interrupted.'}
                  </p>
                </div>
              ) : isThinking ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151D] border border-purple-500/20 text-xs text-purple-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>Processing</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
                    Thinking…
                  </h2>
                  <p className="text-sm text-[#9A9EA6]">
                    Formulating grounded response from verified sources.
                  </p>
                </div>
              ) : isSpeaking ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151D] border border-cyan-500/20 text-xs text-cyan-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
                    <span>Speaking</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
                    Suyash AI is speaking
                  </h2>
                  <p className="text-sm text-[#9A9EA6]">
                    Tap anywhere on the sphere or screen to interrupt.
                  </p>
                </div>
              ) : isConnecting ? (
                <div className="space-y-2">
                  <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
                    Connecting…
                  </h2>
                  <p className="text-sm text-[#9A9EA6]">
                    Establishing realtime audio stream.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151D] border border-emerald-500/20 text-xs text-emerald-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                    <span>{isMuted ? 'Paused / On Hold' : 'Listening'}</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
                    {isMuted ? 'Conversation on Hold' : 'Listening…'}
                  </h2>
                  <p className="text-sm text-[#9A9EA6]">
                    {isMuted
                      ? 'Click Resume to continue talking.'
                      : 'Speak naturally to ask about projects, experience, or research.'}
                  </p>
                </div>
              )}
            </div>

            {/* Resume & Cancel Control Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isCallActive ? (
                <>
                  {/* Resume / Hold Button */}
                  <button
                    onClick={onToggleMute}
                    className={`h-12 px-7 rounded-full font-medium text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isMuted
                        ? 'bg-white text-[#0A0D14] hover:bg-[#E8EAED] shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                        : 'bg-[#12151D] hover:bg-[#1C202B] text-white border border-white/10'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <Play className="w-4 h-4 text-[#0A0D14] fill-current ml-0.5" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 text-white" />
                        <span>Hold</span>
                      </>
                    )}
                  </button>

                  {/* Cancel / End Button */}
                  <button
                    onClick={onEndCall}
                    className="h-12 px-7 rounded-full bg-[#EA4335] hover:bg-[#D93025] text-white font-medium text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_25px_rgba(234,67,53,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-white" />
                    <span>Cancel</span>
                  </button>

                  {/* View Transcript Button */}
                  <button
                    onClick={() => setIsTranscriptOpen(true)}
                    className="h-12 px-5 rounded-full bg-[#12151D]/90 hover:bg-[#1C202B] text-[#9A9EA6] hover:text-white border border-white/10 text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    View Transcript
                  </button>
                </>
              ) : (
                /* Ended State Actions */
                <>
                  <button
                    onClick={onRestartCall}
                    className="h-12 px-7 rounded-full bg-white hover:bg-[#E8EAED] text-[#0A0D14] font-medium text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Talk Again</span>
                  </button>

                  <button
                    onClick={onReturnToHome}
                    className="h-12 px-6 rounded-full bg-[#12151D] hover:bg-[#1C202B] text-[#9A9EA6] hover:text-white border border-white/10 text-sm transition-all cursor-pointer"
                  >
                    Back to Home
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Moving Celestial Blue Plasma Sphere */}
          <div 
            onClick={() => { if (state === 'speaking') onInterrupt?.(); }}
            className="lg:col-span-6 w-full h-[360px] sm:h-[460px] lg:h-[560px] flex items-center justify-center relative cursor-pointer"
          >
            <InteractivePlasmaOrb
              state={state}
              audioLevel={audioLevel}
              onClick={onInterrupt}
            />
          </div>
        </main>

        {/* Footer Status Indicators */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A606E] py-2 shrink-0 gap-2 border-t border-white/5 pt-4">
          <span>Grounded on verified technical sources · LiveKit Realtime Voice</span>
          <span className="flex items-center gap-1.5 text-[#8E95A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            {isCallActive ? 'Voice active · Tap orb to interrupt' : 'Ready to start'}
          </span>
        </footer>
      </div>

      {/* Full Transcript Drawer */}
      <FullTranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        messages={messages}
        onSelectCitation={onSelectCitation}
      />
    </div>
  );
}
