'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VoiceState } from './AudioOrb';
import { AgentPersona } from '@/lib/agents';
import { DigitalTwinOrb } from './DigitalTwinOrb';
import { Mic, MicOff, PhoneOff, Clock } from 'lucide-react';

interface AgentVoicePanelProps {
  state: VoiceState;
  audioLevel: number;
  activePersona: AgentPersona;
  isMuted: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
}

export function AgentVoicePanel({
  state,
  audioLevel,
  activePersona,
  isMuted,
  onToggleCall,
  onToggleMute,
}: AgentVoicePanelProps) {
  const isConnected = state !== 'idle' && state !== 'ended' && state !== 'error';
  const [callDuration, setCallDuration] = useState(0);
  const prevConnectedRef = useRef(isConnected);

  useEffect(() => {
    // Reset duration when transitioning from connected to disconnected
    if (prevConnectedRef.current && !isConnected) {
      setCallDuration(0);
    }
    prevConnectedRef.current = isConnected;

    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusPill = () => {
    switch (state) {
      case 'listening':
        return {
          dotColor: 'bg-emerald-500',
          text: 'Listening…',
        };
      case 'thinking':
        return {
          dotColor: 'bg-purple-500',
          text: 'Checking verified sources…',
        };
      case 'speaking':
        return {
          dotColor: 'bg-orange-500',
          text: 'Speaking…',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          dotColor: 'bg-amber-500',
          text: 'Connecting to LiveKit…',
        };
      case 'error':
        return {
          dotColor: 'bg-red-500',
          text: 'Call interrupted',
        };
      default:
        return {
          dotColor: 'bg-neutral-400',
          text: 'Ready to call',
        };
    }
  };

  const status = getStatusPill();

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 space-y-7">
      {/* 1. Central Ambient Soft Voice Orb matching reference */}
      <div className="py-2">
        <DigitalTwinOrb
          state={state}
          audioLevel={audioLevel}
          activePersona={activePersona}
          onToggleCall={onToggleCall}
          size={270}
        />
      </div>

      {/* 2. Titles & Subtitle matching reference */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-sans tracking-tight">
          {activePersona.name}
        </h1>
        <p className="text-sm font-medium text-neutral-500 font-sans">
          {activePersona.role}
        </p>
      </div>

      {/* 3. Status Pill matching reference ("Ready to call") */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-600 shadow-2xs">
        <span className={`w-2 h-2 rounded-full ${status.dotColor} ${isConnected ? 'animate-pulse' : ''}`} />
        <span>{status.text}</span>
      </div>

      {/* 4. Help / Instruction text matching reference */}
      <p className="text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed font-sans">
        {isConnected
          ? 'Speak naturally to ask questions about Suyash. Live grounded answers and sources will appear in real-time.'
          : `Press Start Speaking to call ${activePersona.name}. The transcript will appear alongside the call.`}
      </p>

      {/* 5. Active Call Action Bar (Mute, Duration, Disconnect) */}
      {isConnected && (
        <div className="pt-2 flex items-center gap-3 animate-in fade-in">
          <button
            onClick={onToggleMute}
            className={`px-3 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs ${
              isMuted
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{formatTime(callDuration)}</span>
          </span>

          <button
            onClick={onToggleCall}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End</span>
          </button>
        </div>
      )}
    </div>
  );
}
