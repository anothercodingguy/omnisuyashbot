'use client';

import React, { useState } from 'react';
import { useLiveKitTwin } from '@/lib/livekit/use-livekit-twin';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalSourceDrawer } from '@/components/MinimalSourceDrawer';
import { MinimalConversationView } from '@/components/MinimalConversationView';
import { Mic, ArrowRight, ArrowUp } from 'lucide-react';

export default function Home() {
  const {
    state,
    messages,
    interimTranscript,
    isMuted,
    activeCitation,
    isDrawerOpen,
    errorMessage,
    startCall,
    endCall,
    toggleMute,
    sendMessage,
    openCitation,
    closeCitation,
  } = useLiveKitTwin();

  const [landingInput, setLandingInput] = useState('');

  const isCallActive = state !== 'idle' && state !== 'ended' && state !== 'error';
  const hasMessages = messages.length > 0;
  const isConversationActive = isCallActive || hasMessages;

  const handleStartCall = () => {
    startCall();
  };

  const handleLandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landingInput.trim()) return;
    sendMessage(landingInput.trim());
    setLandingInput('');
  };

  return (
    <div className="h-screen bg-[#FAFAF9] text-[#111111] flex flex-col font-sans selection:bg-[#EAEAEA] overflow-hidden">
      {/* ─── 1. Header ─── */}
      <MinimalHeader />

      {/* ─── 2. Microphone Error Notice (Only when denied) ─── */}
      {errorMessage && (
        <div className="max-w-[850px] mx-auto w-full px-6 pt-4 shrink-0">
          <div className="p-3.5 rounded-md bg-[#FFF5F5] border border-[#FED7D7] text-xs text-[#C53030] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold block">Microphone access required</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleStartCall}
              className="px-3 py-1.5 rounded-md bg-[#C53030] text-white text-xs font-medium hover:bg-[#9B2C2C] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. Main Single-Screen Content ─── */}
      <main className="flex-1 max-w-[850px] w-full mx-auto px-6 sm:px-12 flex flex-col justify-center overflow-y-auto">
        {isConversationActive ? (
          /* ─── ACTIVE CONVERSATION STATE ─── */
          <div className="w-full py-6 animate-in fade-in duration-200">
            <MinimalConversationView
              messages={messages}
              interimTranscript={interimTranscript}
              voiceState={state}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onEndCall={endCall}
              onSendMessage={sendMessage}
              onSelectCitation={openCitation}
              isLoading={state === 'thinking'}
            />
          </div>
        ) : (
          /* ─── SINGLE PAGE LANDING VIEW (NO SCROLL) ─── */
          <div className="w-full space-y-8 text-left py-4 animate-in fade-in duration-200">
            {/* Hero Text */}
            <div className="space-y-3.5 max-w-[760px]">
              <span className="text-xs font-mono tracking-widest uppercase text-[#8A8A8A] block">
                HELLO, I&apos;M SUYASH
              </span>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-[1.12]">
                I build software, AI systems, and things I&apos;m curious about.
              </h1>

              <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-[620px]">
                Ask my AI twin about my projects, engineering work, research, and technical experience.
              </p>
            </div>

            {/* Tight Interaction Cluster: Button + Fallback Input */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center">
                <button
                  onClick={handleStartCall}
                  className="w-[220px] h-[48px] inline-flex items-center justify-between px-5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-medium transition-all shadow-2xs active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-[#16A34A]" />
                    <span>Talk to Suyash</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A8A]" />
                </button>
              </div>

              <div className="space-y-1.5 pt-1 max-w-[680px]">
                <span className="text-xs text-[#8A8A8A] block">
                  or ask a question
                </span>

                <form onSubmit={handleLandingSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={landingInput}
                    onChange={(e) => setLandingInput(e.target.value)}
                    placeholder="Ask about PathFlow, research, skills, or internships..."
                    className="w-full py-3 pl-4 pr-12 text-sm bg-white border border-[#E8E8E6] rounded-md text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:border-[#111111] transition-colors shadow-2xs font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!landingInput.trim()}
                    className="absolute right-2 p-1.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2A] disabled:bg-[#E8E8E6] disabled:text-[#8A8A8A] transition-colors cursor-pointer"
                    aria-label="Send question"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Suggested Prompts Cluster */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider block">
                YOU MIGHT ASK
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <button
                  onClick={() => sendMessage('What is PathFlow?')}
                  className="text-left text-[#111111] hover:text-[#16A34A] transition-colors flex items-center gap-2 cursor-pointer py-1"
                >
                  <span className="text-[#8A8A8A] font-mono text-xs">→</span>
                  <span className="truncate">What is PathFlow?</span>
                </button>
                <button
                  onClick={() => sendMessage('What has Suyash built?')}
                  className="text-left text-[#111111] hover:text-[#16A34A] transition-colors flex items-center gap-2 cursor-pointer py-1"
                >
                  <span className="text-[#8A8A8A] font-mono text-xs">→</span>
                  <span className="truncate">What has Suyash built?</span>
                </button>
                <button
                  onClick={() => sendMessage('Tell me about his engineering experience.')}
                  className="text-left text-[#111111] hover:text-[#16A34A] transition-colors flex items-center gap-2 cursor-pointer py-1"
                >
                  <span className="text-[#8A8A8A] font-mono text-xs">→</span>
                  <span className="truncate">Tell me about his engineering experience.</span>
                </button>
                <button
                  onClick={() => sendMessage('What is SENNs?')}
                  className="text-left text-[#111111] hover:text-[#16A34A] transition-colors flex items-center gap-2 cursor-pointer py-1"
                >
                  <span className="text-[#8A8A8A] font-mono text-xs">→</span>
                  <span className="truncate">What is SENNs?</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── 4. Document Source Drawer ─── */}
      <MinimalSourceDrawer
        isOpen={isDrawerOpen}
        onClose={closeCitation}
        citation={activeCitation}
      />
    </div>
  );
}
