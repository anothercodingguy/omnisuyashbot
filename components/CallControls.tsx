'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, MessageSquare } from 'lucide-react';
import { VoiceState } from './AudioOrb';

interface CallControlsProps {
  state: VoiceState;
  isMuted: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
  onToggleTextMode: () => void;
  isTextMode: boolean;
}

export function CallControls({
  state,
  isMuted,
  onToggleCall,
  onToggleMute,
  onToggleTextMode,
  isTextMode,
}: CallControlsProps) {
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

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Primary Call Actions */}
      <div className="flex items-center gap-3">
        {/* Toggle Mute (when in active call) */}
        {isConnected && (
          <button
            onClick={onToggleMute}
            className={`p-3.5 rounded-full border transition-all shadow-lg ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Main Connect / Disconnect Button */}
        <button
          onClick={onToggleCall}
          className={`px-7 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
            isConnected
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-95 text-white shadow-indigo-500/30 glow-border'
          }`}
        >
          {isConnected ? (
            <>
              <PhoneOff className="w-5 h-5" />
              <span>End Conversation</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 animate-pulse" />
              <span>Talk to Suyash</span>
            </>
          )}
        </button>

        {/* Toggle Text Mode */}
        <button
          onClick={onToggleTextMode}
          className={`p-3.5 rounded-full border transition-all shadow-lg ${
            isTextMode
              ? 'bg-indigo-600 border-indigo-400 text-white'
              : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:text-white'
          }`}
          title={isTextMode ? 'Close text input' : 'Open text input'}
          aria-label="Toggle text chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Call Duration Meter */}
      {isConnected && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Call Live: {formatTime(callDuration)}</span>
        </div>
      )}
    </div>
  );
}
