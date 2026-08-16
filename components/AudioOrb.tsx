'use client';

import React, { useEffect, useRef } from 'react';

export type VoiceState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'reconnecting'
  | 'ended'
  | 'error';

interface AudioOrbProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioOrb({ state, audioLevel = 0, onClick, size = 'lg' }: AudioOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map state to colors and glow
  const getStateColors = () => {
    switch (state) {
      case 'listening':
        return {
          primary: 'rgba(6, 182, 212, 0.9)', // Cyan
          secondary: 'rgba(59, 130, 246, 0.6)',
          glow: 'rgba(6, 182, 212, 0.45)',
          label: 'Listening...',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'thinking':
        return {
          primary: 'rgba(168, 85, 247, 0.9)', // Purple
          secondary: 'rgba(99, 102, 241, 0.7)',
          glow: 'rgba(168, 85, 247, 0.5)',
          label: 'Thinking & Grounding...',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'speaking':
        return {
          primary: 'rgba(16, 185, 129, 0.95)', // Emerald
          secondary: 'rgba(6, 182, 212, 0.7)',
          glow: 'rgba(16, 185, 129, 0.55)',
          label: 'Speaking...',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          primary: 'rgba(234, 179, 8, 0.9)', // Yellow
          secondary: 'rgba(249, 115, 22, 0.6)',
          glow: 'rgba(234, 179, 8, 0.4)',
          label: state === 'reconnecting' ? 'Reconnecting...' : 'Connecting to LiveKit...',
          badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        };
      case 'error':
        return {
          primary: 'rgba(239, 68, 68, 0.9)', // Red
          secondary: 'rgba(185, 28, 28, 0.6)',
          glow: 'rgba(239, 68, 68, 0.4)',
          label: 'Connection Error',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      default:
        return {
          primary: 'rgba(99, 102, 241, 0.8)', // Indigo
          secondary: 'rgba(59, 130, 246, 0.5)',
          glow: 'rgba(99, 102, 241, 0.25)',
          label: 'Ready to Talk',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
    }
  };

  const colors = getStateColors();

  // Canvas visualizer loop for fluid dynamic waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = width * 0.32;

      // React to audioLevel or create subtle ambient motion
      const dynamicScale = state === 'speaking' || state === 'listening'
        ? 1 + audioLevel * 0.35 + Math.sin(phase * 3) * 0.04
        : 1 + Math.sin(phase * 1.5) * 0.03;

      const radius = baseRadius * dynamicScale;

      // Outer glow circle
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.6
      );
      grad.addColorStop(0, colors.primary);
      grad.addColorStop(0.5, colors.secondary);
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner pulsating Core
      const coreGrad = ctx.createRadialGradient(
        centerX - radius * 0.2,
        centerY - radius * 0.2,
        0,
        centerX,
        centerY,
        radius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, colors.primary);
      coreGrad.addColorStop(0.8, colors.secondary);
      coreGrad.addColorStop(1, 'rgba(10, 15, 30, 0.95)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Rotating subtle orbital nodes
      const nodeCount = 8;
      ctx.fillStyle = colors.primary;
      for (let i = 0; i < nodeCount; i++) {
        const angle = phase + (i * Math.PI * 2) / nodeCount;
        const orbitRadius = radius * 1.15;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        const nodeSize = 2.5 + Math.sin(phase * 4 + i) * 1.5;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, nodeSize), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      phase += 0.025;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel, colors]);

  const dimension = size === 'sm' ? 120 : size === 'md' ? 180 : 260;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Orb Canvas with interactive glow */}
      <div
        onClick={onClick}
        className={`relative cursor-pointer transition-transform duration-300 ${
          state === 'speaking' || state === 'listening' ? 'scale-105' : 'hover:scale-102'
        }`}
        style={{ width: dimension, height: dimension }}
      >
        <canvas
          ref={canvasRef}
          width={dimension * 2}
          height={dimension * 2}
          className="w-full h-full"
        />

        {/* Ambient Ring Borders */}
        <div
          className="absolute inset-0 rounded-full border border-white/10 pointer-events-none animate-spin-slow"
          style={{ transform: 'scale(1.15)' }}
        />
        <div
          className="absolute inset-0 rounded-full border border-dashed border-indigo-400/20 pointer-events-none animate-spin-reverse-slow"
          style={{ transform: 'scale(1.28)' }}
        />
      </div>

      {/* State Status Pill */}
      <div className="mt-5 flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-300 ${colors.badgeColor}`}
        >
          {state === 'speaking' && (
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-1" />
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-4" />
            </div>
          )}
          {state === 'listening' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          )}
          {state === 'thinking' && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          {state === 'connecting' && (
            <div className="w-2.5 h-2.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          )}
          <span>{colors.label}</span>
        </div>
      </div>
    </div>
  );
}
