'use client';

import React from 'react';
import { AgentPersona, AGENT_PERSONAS } from '@/lib/agents';
import { CheckCircle2 } from 'lucide-react';

interface AgentSidebarProps {
  selectedAgentId: string;
  onSelectAgent: (agent: AgentPersona) => void;
  disabled?: boolean;
}

export function AgentSidebar({
  selectedAgentId,
  onSelectAgent,
  disabled,
}: AgentSidebarProps) {
  return (
    <aside className="w-full flex flex-col space-y-4">
      {/* Column Header matching reference screenshot */}
      <div className="px-2">
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-400">
          Choose An Agent
        </h2>
      </div>

      {/* List of Agents */}
      <div className="space-y-2">
        {AGENT_PERSONAS.map((agent) => {
          const isSelected = agent.id === selectedAgentId;

          return (
            <button
              key={agent.id}
              disabled={disabled}
              onClick={() => onSelectAgent(agent)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex flex-col gap-1 ${
                isSelected
                  ? 'bg-white border-2 border-blue-400/80 shadow-xs ring-2 ring-blue-500/10'
                  : 'bg-white/60 hover:bg-white border border-neutral-200/70 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm font-sans">
                  {agent.name}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>

              <span className="text-xs text-neutral-500 font-sans">
                {agent.role}
              </span>
            </button>
          );
        })}
      </div>

      {/* Verified CV Grounding Guarantee Pill */}
      <div className="mt-4 p-3.5 rounded-xl bg-neutral-100/80 border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
        <div className="flex items-center gap-1.5 font-medium text-neutral-900">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>100% Resume Grounded</span>
        </div>
        <p className="text-neutral-500 leading-relaxed">
          Zero hallucination guarantee. All responses verified against official CV.
        </p>
      </div>
    </aside>
  );
}
