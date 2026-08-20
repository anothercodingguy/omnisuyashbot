'use client';

import React, { useState } from 'react';
import { useLiveKitTwin } from '@/lib/livekit/use-livekit-twin';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalSourceDrawer } from '@/components/MinimalSourceDrawer';
import { FullTranscriptDrawer } from '@/components/FullTranscriptDrawer';
import { ActiveVoiceView } from '@/components/ActiveVoiceView';
import { InteractivePlasmaOrb } from '@/components/InteractivePlasmaOrb';
import { DiaTextAnimation } from '@/components/DiaTextAnimation';
import { Mic } from 'lucide-react';

export default function Home() {
  const {
    state,
    messages,
    interimTranscript,
    audioLevel,
    isMuted,
    activeCitation,
    isDrawerOpen,
    errorMessage,
    startCall,
    endCall,
    resetSession,
    toggleMute,
    sendMessage,
    interruptPlayback,
    openCitation,
    closeCitation,
  } = useLiveKitTwin();

  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const isCallActive = state !== 'idle' && state !== 'ended' && state !== 'error';
  const hasMessages = messages.length > 0;
  const isVoiceMode = isCallActive || hasMessages || state === 'ended' || (state === 'error' && messages.length > 0);

  const handleStartCall = () => {
    startCall();
  };

  const handlePromptClick = (prompt: string) => {
    startCall();
    setTimeout(() => {
      sendMessage(prompt);
    }, 250);
  };

  return (
    <div className="h-screen w-screen bg-[#030509] text-[#E3E3E3] flex flex-col font-sans selection:bg-[#1E88E5]/30 overflow-hidden relative">
      {/* Subtle Ambient Cosmic Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-radial from-[#00E5FF]/8 via-[#1E88E5]/4 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-radial from-[#1E88E5]/10 via-[#0A193B]/20 to-transparent blur-3xl pointer-events-none" />

      {isVoiceMode ? (
        /* ─── FULL-SCREEN LIVE VOICE EXPERIENCE ─── */
        <ActiveVoiceView
          state={state}
          messages={messages}
          interimTranscript={interimTranscript}
          audioLevel={audioLevel}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onEndCall={endCall}
          onRestartCall={startCall}
          onReturnToHome={resetSession}
          onSendMessage={sendMessage}
          onSelectCitation={openCitation}
          onInterrupt={interruptPlayback}
          errorMessage={errorMessage}
        />
      ) : (
        /* ─── EXACT REFERENCE HERO LANDING SCREEN WITH MOVING BLUE PLASMA BALL ─── */
        <div className="h-full w-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto z-10 relative">
          {/* Header */}
          <MinimalHeader onOpenTranscript={() => setIsTranscriptOpen(true)} />

          {/* Connection Notice if any */}
          {errorMessage && (
            <div className="w-full max-w-md pt-2 shrink-0 mx-auto">
              <div className="p-3.5 rounded-2xl bg-[#2A1515] border border-[#5A2525] text-xs text-[#FC8181] flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <span className="font-semibold block">Voice Connection Notice</span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleStartCall}
                  className="px-3 py-1.5 rounded-lg bg-[#C53030] text-white text-xs font-medium hover:bg-[#9B2C2C] transition-colors cursor-pointer shrink-0 ml-3"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Main 2-Column Hero Grid */}
          <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
            {/* Left Column: Editorial Typography & Call To Action */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-7 z-20">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-[4.75rem] font-light tracking-tight text-white leading-[1.06]">
                  Hello <span className="text-[#8E95A5] font-light">I’m</span><br />
                  Suyash <span className="text-[#6C768A] font-extralight">Singh</span>
                </h1>
                <p className="text-sm sm:text-base text-[#9A9EA6] font-normal leading-relaxed max-w-lg">
                  Ask my AI twin about my projects, engineering work, research, and the systems I build.
                </p>
              </div>

              {/* Crisp White Pill CTA matching the reference screenshot */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleStartCall}
                  className="h-12 px-7 rounded-full bg-white hover:bg-[#E8EAED] text-[#0A0D14] font-medium text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_35px_rgba(0,180,255,0.25)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#0A0D14]" />
                  <span>Talk to Suyash</span>
                </button>

                <button
                  onClick={() => setIsTranscriptOpen(true)}
                  className="h-12 px-5 rounded-full bg-[#12151D]/90 hover:bg-[#1C202B] text-[#9A9EA6] hover:text-white border border-white/10 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  View Transcript
                </button>
              </div>

              {/* Dia-style Chromatic Cycling Prompt Animation */}
              <div className="pt-2">
                <DiaTextAnimation onSelectPrompt={handlePromptClick} />
              </div>
            </div>

            {/* Right Column: Moving 3D Plasma Sphere */}
            <div className="lg:col-span-6 w-full h-[360px] sm:h-[460px] lg:h-[560px] flex items-center justify-center relative">
              <InteractivePlasmaOrb
                state={state}
                audioLevel={audioLevel}
                onClick={handleStartCall}
              />
            </div>
          </main>
        </div>
      )}

      {/* Document Evidence Drawer */}
      <MinimalSourceDrawer
        isOpen={isDrawerOpen}
        onClose={closeCitation}
        citation={activeCitation}
      />

      {/* Full Transcript Drawer */}
      <FullTranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        messages={messages}
        onSelectCitation={openCitation}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
