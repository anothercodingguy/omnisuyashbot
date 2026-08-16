'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceState } from './AudioOrb';
import { AgentPersona } from '@/lib/agents';
import { Mic, MicOff, PhoneOff, Sparkles, Loader2 } from 'lucide-react';

interface DigitalTwinOrbProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  activePersona: AgentPersona;
  onToggleCall: () => void;
  size?: number;
}

export function DigitalTwinOrb({
  state,
  audioLevel = 0,
  activePersona,
  onToggleCall,
  size = 280,
}: DigitalTwinOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isConnected = state !== 'idle' && state !== 'ended' && state !== 'error';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isConnecting = state === 'connecting' || state === 'reconnecting';

  // Smooth canvas animation rendering the soft ambient glowing orb with subtle sacred geometry/overlapping curves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Base radius
      const baseR = w * 0.44;
      const dynamicScale = isListening || isSpeaking
        ? 1 + audioLevel * 0.12 + Math.sin(phase * 2.5) * 0.02
        : 1 + Math.sin(phase * 1.2) * 0.015;

      const r = baseR * dynamicScale;

      // 1. Soft Ambient Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.15);
      glowGrad.addColorStop(0, `${activePersona.color.orbPrimary}40`);
      glowGrad.addColorStop(0.6, `${activePersona.color.orbSecondary}25`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main Ethereal Body Gradient (Matching the soft green translucent sphere in screenshot)
      const bodyGrad = ctx.createRadialGradient(
        cx - r * 0.2,
        cy - r * 0.25,
        0,
        cx,
        cy,
        r
      );
      bodyGrad.addColorStop(0, '#FFFFFFE0');
      bodyGrad.addColorStop(0.25, `${activePersona.color.orbSecondary}B0`);
      bodyGrad.addColorStop(0.7, `${activePersona.color.orbPrimary}75`);
      bodyGrad.addColorStop(1, `${activePersona.color.orbPrimary}40`);

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // 3. Delicate Overlapping Geometric Curves (Flower of Life / Sacred Geometry Mesh)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;

      const petals = 6;
      const petalR = r * 0.58;
      const rot = isThinking ? phase * 0.5 : phase * 0.05;

      for (let i = 0; i < petals; i++) {
        const angle = rot + (i * Math.PI * 2) / petals;
        const px = cx + Math.cos(angle) * (r * 0.45);
        const py = cy + Math.sin(angle) * (r * 0.45);

        ctx.beginPath();
        ctx.arc(px, py, petalR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner concentric rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      phase += 0.02;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [state, audioLevel, activePersona, isListening, isSpeaking, isThinking]);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* The Ambient Canvas Sphere */}
      <div
        onClick={onToggleCall}
        className="relative cursor-pointer group transition-transform duration-300 active:scale-98"
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          className="w-full h-full drop-shadow-sm"
        />

        {/* Center Action Pill Button exactly as shown in reference */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`pointer-events-auto px-6 py-3 rounded-full bg-white/95 text-neutral-800 text-sm font-medium shadow-md border border-neutral-200/80 flex items-center gap-2 group-hover:scale-105 transition-all duration-200 ${
              isConnected ? 'bg-white shadow-lg border-neutral-300' : ''
            }`}
          >
            {isConnecting && (
              <>
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Connecting…</span>
              </>
            )}
            {isListening && (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>Listening…</span>
              </>
            )}
            {isThinking && (
              <>
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Thinking…</span>
              </>
            )}
            {isSpeaking && (
              <>
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0s]" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <span>End Call</span>
              </>
            )}
            {!isConnected && (
              <span>Start Speaking</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
