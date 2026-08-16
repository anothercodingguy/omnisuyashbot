'use client';

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  'What is PathFlow?',
  'What is PathFlow’s architecture & tech stack?',
  'Tell me about his internships at Stealth & IEEE.',
  'What is the Semantic LLM Gateway?',
  'What is SENNs research at ICDDS 2025?',
  'Tell me about his education & GPA.',
  'What technologies & skills does he know?',
  'What is his competitive programming rating?',
];

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        Suggested Inquiries
      </div>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onSelect(q)}
            className="text-left text-xs px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-indigo-500/15 border border-white/[0.08] hover:border-indigo-400/40 text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
