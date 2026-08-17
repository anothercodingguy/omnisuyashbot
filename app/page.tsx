'use client';

import React, { useState } from 'react';
import { useLiveKitTwin } from '@/lib/livekit/use-livekit-twin';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalSourceDrawer } from '@/components/MinimalSourceDrawer';
import { FullTranscriptDrawer } from '@/components/FullTranscriptDrawer';
import { ActiveVoiceView } from '@/components/ActiveVoiceView';
import { Mic, Sparkles } from 'lucide-react';

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
    <div className="h-screen w-screen bg-[#101114] text-[#E3E3E3] flex flex-col font-sans selection:bg-[#2A2B2E] overflow-hidden">
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
        /* ─── DARK MINIMAL LANDING SCREEN (VOICE-ONLY) ─── */
        <div className="h-full w-full flex flex-col justify-between items-center p-6 sm:p-10 max-w-5xl mx-auto">
          {/* Header */}
          <MinimalHeader onOpenTranscript={() => setIsTranscriptOpen(true)} />

          {/* Connection Error Notice */}
          {errorMessage && (
            <div className="w-full max-w-md pt-2 shrink-0">
              <div className="p-3.5 rounded-2xl bg-[#2A1515] border border-[#5A2525] text-xs text-[#FC8181] flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <span className="font-semibold block">
                    {errorMessage.toLowerCase().includes('microphone')
                      ? 'Microphone access required'
                      : 'Voice Connection Notice'}
                  </span>
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

          {/* Center Greeting & Voice Trigger */}
          <main className="flex-1 w-full flex flex-col justify-center items-center text-center space-y-8 my-auto max-w-2xl px-4">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-normal tracking-tight bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] bg-clip-text text-transparent leading-[1.15]">
                Hello, Suyash
              </h1>
              <p className="text-sm sm:text-base text-[#9E9E9E] max-w-[480px] mx-auto leading-relaxed">
                AI Digital Twin for Suyash Singh. Realtime voice grounded on verified resume, projects, and research.
              </p>
            </div>

            {/* Big Voice CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleStartCall}
                className="h-[60px] px-8 rounded-full bg-gradient-to-r from-[#4285F4] to-[#9B72CB] hover:opacity-95 text-white font-medium text-base sm:text-lg flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Mic className="w-5 h-5 text-white" />
                <span>Talk to Suyash</span>
                <Sparkles className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Suggested Prompt Topics */}
            <div className="space-y-3 pt-4">
              <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider block">
                SUGGESTED TOPICS
              </span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  'What is PathFlow?',
                  'What has Suyash built?',
                  'Tell me about his internships',
                  'What is SENNs?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 rounded-full bg-[#1E1F20] hover:bg-[#282A2C] border border-[#2E2F32] text-xs sm:text-sm text-[#E3E3E3] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full text-center text-xs text-[#666666] py-2 shrink-0">
            <span>Voice-first digital twin · Grounded on verified sources</span>
          </footer>
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
      />
    </div>
  );
}
