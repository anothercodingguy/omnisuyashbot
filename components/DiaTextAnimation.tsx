'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface DiaTextAnimationProps {
  onSelectPrompt?: (prompt: string) => void;
  className?: string;
}

const TOPICS = [
  {
    topic: 'PathFlow',
    fullPrompt: 'What is PathFlow?',
    subtext: 'AI Agent Observability',
  },
  {
    topic: 'Semantic LLM Gateway',
    fullPrompt: 'What is the Semantic LLM Gateway?',
    subtext: 'Qdrant Vector Caching',
  },
  {
    topic: 'SENNs Research',
    fullPrompt: 'What is SENNs and machine unlearning?',
    subtext: 'ICDDS 2025 Publication',
  },
  {
    topic: 'Engineering Experience',
    fullPrompt: 'Tell me about his internships and experience',
    subtext: 'Stealth Startup & IEEE',
  },
  {
    topic: 'Distributed Systems',
    fullPrompt: 'What technologies does Suyash use for systems?',
    subtext: 'FastAPI, Docker & PyTorch',
  },
  {
    topic: 'Education & Background',
    fullPrompt: 'What does Suyash study and where?',
    subtext: 'Computer Science at Manipal',
  },
];

export function DiaTextAnimation({ onSelectPrompt, className = '' }: DiaTextAnimationProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % TOPICS.length);
        setIsAnimating(false);
      }, 350);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const current = TOPICS[index];

  const handleClick = () => {
    if (onSelectPrompt) {
      onSelectPrompt(current.fullPrompt);
    }
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Dynamic Animated Chromatic Reveal Line */}
      <div
        onClick={handleClick}
        className="group inline-flex items-center gap-2 cursor-pointer py-1 transition-all"
        title={`Click to ask: "${current.fullPrompt}"`}
      >
        <span className="text-sm sm:text-base text-[#8E95A5] font-light tracking-wide">
          Ask about
        </span>

        <div className="relative overflow-hidden inline-flex items-center">
          <span
            className={`text-sm sm:text-base font-medium tracking-wide transition-all duration-300 transform inline-block bg-gradient-to-r from-[#00E5FF] via-[#9B72CB] to-[#FFA07A] bg-clip-text text-transparent ${
              isAnimating
                ? 'opacity-0 translate-y-3 blur-xs'
                : 'opacity-100 translate-y-0 blur-0'
            }`}
          >
            {current.topic}
          </span>
        </div>

        <ArrowUpRight className="w-3.5 h-3.5 text-[#5A606E] group-hover:text-[#00E5FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-70 group-hover:opacity-100" />
      </div>

      {/* Subtle Subtext Hint */}
      <div className="text-[11px] font-mono text-[#5A606E] tracking-wider uppercase flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-[#00E5FF]/60" />
        <span>{current.subtext}</span>
      </div>
    </div>
  );
}
