'use client';

import React from 'react';
import { VoiceState } from './AudioOrb';

interface VoiceGatewayProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  onClick?: () => void;
  size?: number;
}

export function VoiceGateway({
  state,
  audioLevel = 0,
  onClick,
  size = 220,
}: VoiceGatewayProps) {
  // Determine state-specific colors and animation metrics
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isConnecting = state === 'connecting' || state === 'reconnecting';

  // Dynamic scale factor derived from audio amplitude
  const dynamicExpansion = isListening || isSpeaking ? 1 + audioLevel * 0.18 : 1;

  // Spectrum gradient stroke definition based on state
  const getGradientStops = () => {
    switch (state) {
      case 'speaking':
        return {
          start: '#6D5EF5',
          mid: '#F59E0B',
          end: '#EF4444',
          label: 'Speaking',
          statusDot: '#F59E0B',
        };
      case 'thinking':
        return {
          start: '#3B82F6',
          mid: '#6D5EF5',
          end: '#8B5CF6',
          label: 'Checking verified sources…',
          statusDot: '#6D5EF5',
        };
      case 'listening':
        return {
          start: '#3B82F6',
          mid: '#60A5FA',
          end: '#6D5EF5',
          label: 'Listening',
          statusDot: '#3B82F6',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          start: '#F59E0B',
          mid: '#EAB308',
          end: '#3B82F6',
          label: state === 'reconnecting' ? 'Reconnecting…' : 'Opening conversation…',
          statusDot: '#F59E0B',
        };
      case 'error':
        return {
          start: '#EF4444',
          mid: '#DC2626',
          end: '#991B1B',
          label: 'Connection interrupted',
          statusDot: '#EF4444',
        };
      default:
        return {
          start: '#111111',
          mid: '#5A5A55',
          end: '#111111',
          label: 'Ready when you are',
          statusDot: 'rgba(17,17,17,0.4)',
        };
    }
  };

  const currentTheme = getGradientStops();

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Interactive Gateway Geometric Frame */}
      <div
        onClick={onClick}
        className="relative cursor-pointer group transition-transform duration-500 ease-out"
        style={{
          width: size,
          height: size,
          transform: `scale(${dynamicExpansion})`,
        }}
        role="button"
        tabIndex={0}
        aria-label={`Voice Gateway: ${currentTheme.label}`}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dynamic Continuous Spectrum Gradient */}
            <linearGradient id="gatewaySpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.start} />
              <stop offset="50%" stopColor={currentTheme.mid} />
              <stop offset="100%" stopColor={currentTheme.end} />
            </linearGradient>

            <linearGradient id="neutralHairline" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(17,17,17,0.18)" />
              <stop offset="100%" stopColor="rgba(17,17,17,0.06)" />
            </linearGradient>
          </defs>

          {/* 1. Outer Concentric Structural Ring */}
          <circle
            cx="100"
            cy="100"
            r="94"
            stroke="url(#neutralHairline)"
            strokeWidth="1"
            strokeDasharray="2 4"
            className={isThinking ? 'animate-gateway-spin' : ''}
            style={{ transformOrigin: '100px 100px' }}
          />

          {/* 2. Cardinal Alignment Ticks */}
          <line x1="100" y1="2" x2="100" y2="8" stroke="rgba(17,17,17,0.25)" strokeWidth="1" />
          <line x1="100" y1="192" x2="100" y2="198" stroke="rgba(17,17,17,0.25)" strokeWidth="1" />
          <line x1="2" y1="100" x2="8" y2="100" stroke="rgba(17,17,17,0.25)" strokeWidth="1" />
          <line x1="192" y1="100" x2="198" y2="100" stroke="rgba(17,17,17,0.25)" strokeWidth="1" />

          {/* 3. Nested Gateway Archway 1 (Outer Silhouette) */}
          <path
            d="M 46 160 L 46 95 C 46 65.176 70.176 41 100 41 C 129.824 41 154 65.176 154 95 L 154 160 Z"
            stroke={state === 'idle' ? 'rgba(17,17,17,0.20)' : 'url(#gatewaySpectrum)'}
            strokeWidth={isSpeaking || isListening ? '2' : '1.25'}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* 4. Nested Gateway Archway 2 (Mid Arch) */}
          <path
            d="M 60 156 L 60 96 C 60 73.908 77.908 56 100 56 C 122.092 56 140 73.908 140 96 L 140 156 Z"
            stroke={state === 'idle' ? 'rgba(17,17,17,0.12)' : 'url(#gatewaySpectrum)'}
            strokeWidth="1"
            strokeDasharray={isThinking ? '4 3' : 'none'}
            className={isThinking ? 'animate-gateway-spin' : 'transition-all duration-500'}
            style={{ transformOrigin: '100px 100px', opacity: isThinking ? 0.8 : 0.6 }}
          />

          {/* 5. Central Threshold Portal (Inner Arch & Aperture) */}
          <path
            d="M 74 152 L 74 98 C 74 83.64 85.64 72 100 72 C 114.36 72 126 83.64 126 98 L 126 152 Z"
            stroke={state === 'idle' ? 'rgba(17,17,17,0.30)' : 'url(#gatewaySpectrum)'}
            strokeWidth={isSpeaking ? '2.5' : '1.5'}
            fill={isSpeaking ? 'rgba(245, 158, 11, 0.04)' : isListening ? 'rgba(59, 130, 246, 0.04)' : 'transparent'}
            className="transition-all duration-300"
          />

          {/* 6. Geometric Central Resonator */}
          <circle
            cx="100"
            cy="110"
            r={isSpeaking || isListening ? 12 + audioLevel * 10 : 8}
            stroke={state === 'idle' ? 'rgba(17,17,17,0.40)' : 'url(#gatewaySpectrum)'}
            strokeWidth="1.5"
            fill={state === 'idle' ? 'none' : 'url(#gatewaySpectrum)'}
            fillOpacity={isSpeaking || isListening ? 0.15 : 0}
            className="transition-all duration-200"
          />

          {/* Center Focal Point */}
          <circle
            cx="100"
            cy="110"
            r="2.5"
            fill={state === 'idle' ? '#111111' : currentTheme.statusDot}
            className="transition-colors duration-300"
          />

          {/* 7. Base Threshold Floor Line */}
          <line
            x1="36"
            y1="160"
            x2="164"
            y2="160"
            stroke={state === 'idle' ? 'rgba(17,17,17,0.35)' : 'url(#gatewaySpectrum)'}
            strokeWidth="1.5"
          />
        </svg>

        {/* Minimal Corner Indicators on Hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-900/30" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-900/30" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-900/30" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-900/30" />
        </div>
      </div>

      {/* Quiet Status Label & Metric */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: currentTheme.statusDot }}
        />
        <span className="text-xs font-medium tracking-wide text-neutral-600 font-sans">
          {currentTheme.label}
        </span>
      </div>
    </div>
  );
}
