'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, ArrowRight, CornerDownLeft } from 'lucide-react';
import { VoiceState } from './AudioOrb';

interface EditorialControlsProps {
  state: VoiceState;
  isMuted: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export function EditorialControls({
  state,
  isMuted,
  onToggleCall,
  onToggleMute,
  onSendMessage,
  isLoading,
}: EditorialControlsProps) {
  const isConnected = state !== 'idle' && state !== 'ended' && state !== 'error';
  const [callDuration, setCallDuration] = useState(0);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;
    onSendMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Primary Voice Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Main Talk Button */}
        <button
          onClick={onToggleCall}
          className={`editorial-link px-8 py-3.5 rounded-md font-medium text-sm transition-all duration-200 shadow-sm active:scale-98 ${
            isConnected
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          <span>{isConnected ? 'End conversation' : 'Talk to Suyash'}</span>
          <ArrowRight className="w-4 h-4 arrow-shift" />
        </button>

        {/* Live Call Secondary Actions */}
        {isConnected && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className={`p-3 rounded-md border text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <span className="font-mono text-xs text-neutral-500 bg-neutral-200/50 px-2.5 py-2 rounded-md border border-neutral-300/50">
              {formatTime(callDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Secondary Text Mode Input */}
      <form onSubmit={handleTextSubmit} className="pt-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
            placeholder="Prefer text? Type an inquiry..."
            className="w-full py-2.5 pl-3.5 pr-10 text-xs bg-white border border-neutral-300/80 rounded-md placeholder-neutral-400 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs font-sans disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-30 transition-colors"
            aria-label="Submit inquiry"
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-neutral-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
