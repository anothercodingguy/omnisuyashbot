'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface EditorialSuggestedListProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  {
    id: '01',
    query: 'What is PathFlow?',
    hint: 'AI Agent Observability · OpenTelemetry · React Flow DAG',
  },
  {
    id: '02',
    query: 'What is the Semantic LLM Gateway & Routing Proxy?',
    hint: 'FastAPI · Qdrant Semantic Caching (<50ms) · Circuit Breakers',
  },
  {
    id: '03',
    query: 'Tell me about your research on SENNs at ICDDS 2025.',
    hint: 'Machine Unlearning · GDPR Compliance · Diagnostic Pipelines',
  },
  {
    id: '04',
    query: 'What did you do at your internships at Stealth Startup & IEEE?',
    hint: 'AWS Distributed Inference · State Machines · Node Reliability',
  },
  {
    id: '05',
    query: 'Tell me about your education and technical skills.',
    hint: 'Manipal Institute of Tech (8.51 CGPA) · Codeforces Pupil',
  },
];

export function EditorialSuggestedList({
  onSelect,
  disabled,
}: EditorialSuggestedListProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-300/80 pb-2">
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
          Suggested Inquiries
        </span>
        <span className="text-[11px] font-sans text-neutral-500">
          Select or speak a question
        </span>
      </div>

      <div className="divide-y divide-neutral-200/80">
        {QUESTIONS.map((item) => (
          <button
            key={item.id}
            disabled={disabled}
            onClick={() => onSelect(item.query)}
            className="group w-full py-3.5 text-left flex items-start justify-between gap-4 transition-all duration-200 hover:bg-neutral-200/30 px-2 rounded-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-neutral-400 group-hover:text-blue-600 transition-colors">
                  {item.id}
                </span>
                <span className="text-sm font-medium text-neutral-900 group-hover:text-neutral-950 font-sans">
                  {item.query}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-sans pl-7">
                {item.hint}
              </p>
            </div>

            <div className="pt-0.5 pr-1 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
