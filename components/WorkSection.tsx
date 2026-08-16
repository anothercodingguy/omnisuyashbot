'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface WorkSectionProps {
  onAskAbout: (topic: string) => void;
}

export function WorkSection({ onAskAbout }: WorkSectionProps) {
  return (
    <div className="w-full space-y-24 pt-8">
      {/* ─── SECTION 1: WHAT I WORK ON ─── */}
      <section className="space-y-8">
        <div className="border-b border-neutral-300/80 pb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            [ 01 ] Core Technical Focus
          </h2>
          <span className="text-xs text-neutral-500 font-sans">
            Areas of verified engineering depth
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <span className="text-xs font-mono text-neutral-400">01.01</span>
            <h3 className="text-lg font-semibold text-neutral-900 font-sans tracking-tight">
              AI Agent Observability
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Architecting OpenTelemetry-compatible telemetry to inspect multi-step agent execution trees, sub-span latencies, token velocity, and compute costs across autonomous fleets.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-mono text-neutral-400">01.02</span>
            <h3 className="text-lg font-semibold text-neutral-900 font-sans tracking-tight">
              Distributed Systems & Proxies
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Building low-latency semantic caching gateways with Qdrant and Redis, circuit-breaker fallbacks, concurrent AWS inference pipelines, and state-machine multi-turn sessions.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-mono text-neutral-400">01.03</span>
            <h3 className="text-lg font-semibold text-neutral-900 font-sans tracking-tight">
              Machine Unlearning & ML
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Designing GDPR-compliant algorithmic frameworks for data erasure in deep neural networks, published and accepted at the ICDDS 2025 international conference.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SELECTED SYSTEMS & PROJECTS ─── */}
      <section className="space-y-8">
        <div className="border-b border-neutral-300/80 pb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            [ 02 ] Selected Engineering Systems
          </h2>
          <span className="text-xs text-neutral-500 font-sans">
            Directly cited from technical portfolio
          </span>
        </div>

        <div className="divide-y divide-neutral-300/80">
          {/* Project 1: PathFlow */}
          <div className="py-8 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">01</span>
                  <h3 className="text-2xl font-bold text-neutral-900 font-sans tracking-tight">
                    PathFlow — “Strava for AI Agents”
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                  An OpenTelemetry-compatible agent observability platform designed to trace multi-step execution paths, token velocity (t/s), context volume, and API compute costs across autonomous agent fleets. Includes an interactive React Flow DAG visualizer and a multi-factor skill benchmarking engine.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-neutral-500">
                  <span>Next.js 15</span>
                  <span>·</span>
                  <span>TypeScript</span>
                  <span>·</span>
                  <span>React Flow</span>
                  <span>·</span>
                  <span>OpenTelemetry</span>
                  <span>·</span>
                  <span>Python SDK (@pf.trace)</span>
                </div>
              </div>

              {/* Abstract DAG Visual Representation */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-md">
                  <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="overflow-visible">
                    {/* DAG nodes */}
                    <rect x="10" y="22" width="36" height="16" rx="2" fill="#FFFFFF" stroke="rgba(17,17,17,0.2)" strokeWidth="1" />
                    <text x="18" y="33" fontSize="8" fontFamily="monospace" fill="#111111">Root</text>
                    <path d="M 46 30 L 70 18" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 46 30 L 70 42" stroke="#6D5EF5" strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="70" y="10" width="42" height="16" rx="2" fill="#FFFFFF" stroke="rgba(17,17,17,0.2)" strokeWidth="1" />
                    <text x="76" y="21" fontSize="8" fontFamily="monospace" fill="#3B82F6">Span A</text>
                    <rect x="70" y="34" width="42" height="16" rx="2" fill="#FFFFFF" stroke="rgba(17,17,17,0.2)" strokeWidth="1" />
                    <text x="76" y="45" fontSize="8" fontFamily="monospace" fill="#6D5EF5">Span B</text>
                    <path d="M 112 18 L 136 30" stroke="#3B82F6" strokeWidth="1" />
                    <path d="M 112 42 L 136 30" stroke="#F59E0B" strokeWidth="1" />
                    <rect x="136" y="22" width="36" height="16" rx="2" fill="#111111" stroke="#111111" strokeWidth="1" />
                    <text x="144" y="33" fontSize="8" fontFamily="monospace" fill="#FFFFFF">Sink</text>
                  </svg>
                </div>

                <button
                  onClick={() => onAskAbout('What is PathFlow and how does its DAG visualizer work?')}
                  className="editorial-link text-xs font-medium text-neutral-800 hover:text-blue-600 transition-colors"
                >
                  <span>Ask AI Twin about PathFlow</span>
                  <ArrowUpRight className="w-3.5 h-3.5 arrow-shift" />
                </button>
              </div>
            </div>
          </div>

          {/* Project 2: Semantic LLM Gateway */}
          <div className="py-8 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">02</span>
                  <h3 className="text-2xl font-bold text-neutral-900 font-sans tracking-tight">
                    Semantic LLM Gateway & Routing Proxy
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                  A high-throughput AI routing proxy with Qdrant-backed semantic caching, drastically reducing redundant LLM API calls with cache-hit latencies verified under 50ms. Features dynamic intent routing to classify prompt complexity and a resilient circuit-breaker fallback mechanism.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-neutral-500">
                  <span>FastAPI</span>
                  <span>·</span>
                  <span>Qdrant Vector DB</span>
                  <span>·</span>
                  <span>Redis</span>
                  <span>·</span>
                  <span>Groq</span>
                  <span>·</span>
                  <span>Ollama</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-md">
                  <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
                    <circle cx="20" cy="30" r="10" stroke="rgba(17,17,17,0.3)" strokeWidth="1" />
                    <text x="14" y="33" fontSize="8" fontFamily="monospace" fill="#111111">In</text>
                    <path d="M 30 30 L 60 30" stroke="#3B82F6" strokeWidth="1" />
                    <rect x="60" y="16" width="50" height="28" rx="2" fill="#FFFFFF" stroke="#6D5EF5" strokeWidth="1" />
                    <text x="66" y="28" fontSize="7" fontFamily="monospace" fill="#6D5EF5">Qdrant</text>
                    <text x="66" y="38" fontSize="6" fontFamily="monospace" fill="#10B981">&lt;50ms</text>
                    <path d="M 110 30 L 140 30" stroke="#F59E0B" strokeWidth="1" />
                    <circle cx="155" cy="30" r="10" fill="#111111" />
                    <text x="148" y="33" fontSize="8" fontFamily="monospace" fill="#FFFFFF">LLM</text>
                  </svg>
                </div>

                <button
                  onClick={() => onAskAbout('How does the Semantic LLM Gateway achieve under 50ms cache hits?')}
                  className="editorial-link text-xs font-medium text-neutral-800 hover:text-blue-600 transition-colors"
                >
                  <span>Ask AI Twin about the Gateway</span>
                  <ArrowUpRight className="w-3.5 h-3.5 arrow-shift" />
                </button>
              </div>
            </div>
          </div>

          {/* Project 3: SENNs */}
          <div className="py-8 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">03</span>
                  <h3 className="text-2xl font-bold text-neutral-900 font-sans tracking-tight">
                    Self-Erasing Neural Networks (SENNs)
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                  Co-authored peer-reviewed research publication accepted at the ICDDS 2025 international conference. Designed a complex algorithmic framework for GDPR-compliant machine unlearning, developing rigorous diagnostic pipelines in Python and PyTorch to evaluate weight shifts and accuracy trade-offs.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-neutral-500">
                  <span>Python</span>
                  <span>·</span>
                  <span>PyTorch</span>
                  <span>·</span>
                  <span>ICDDS 2025 International Conference</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-md">
                  <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
                    <circle cx="25" cy="18" r="5" stroke="rgba(17,17,17,0.3)" />
                    <circle cx="25" cy="42" r="5" stroke="rgba(17,17,17,0.3)" />
                    <circle cx="90" cy="30" r="7" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />
                    <text x="85" y="33" fontSize="8" fill="#EF4444" fontFamily="monospace">x</text>
                    <circle cx="155" cy="18" r="5" fill="#111111" />
                    <circle cx="155" cy="42" r="5" fill="#111111" />
                    <path d="M 30 18 L 83 28" stroke="rgba(17,17,17,0.2)" />
                    <path d="M 30 42 L 83 32" stroke="rgba(17,17,17,0.2)" />
                    <path d="M 97 30 L 150 18" stroke="#F59E0B" />
                    <path d="M 97 30 L 150 42" stroke="#F59E0B" />
                  </svg>
                </div>

                <button
                  onClick={() => onAskAbout('Tell me about the SENNs research paper at ICDDS 2025.')}
                  className="editorial-link text-xs font-medium text-neutral-800 hover:text-blue-600 transition-colors"
                >
                  <span>Ask AI Twin about SENNs</span>
                  <ArrowUpRight className="w-3.5 h-3.5 arrow-shift" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: EXPERIENCE & LEADERSHIP ─── */}
      <section className="space-y-8">
        <div className="border-b border-neutral-300/80 pb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            [ 03 ] Verified Experience & Leadership
          </h2>
          <span className="text-xs text-neutral-500 font-sans">
            Authoritative source timeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Work Experience */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Industry Experience
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5 border-l-2 border-neutral-900 pl-4">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>AI Intern</span>
                  <span>Dec 2025 – May 2026</span>
                </div>
                <div className="font-semibold text-neutral-900 text-base font-sans">
                  Stealth Startup · Bengaluru
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Architected scalable REST APIs and distributed AWS inference pipelines, engineered concurrent state-machine logic, and managed multi-turn session routing.
                </p>
              </div>

              <div className="space-y-1.5 border-l-2 border-neutral-300 pl-4">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>R&D Intern</span>
                  <span>Apr 2025 – Sept 2025</span>
                </div>
                <div className="font-semibold text-neutral-900 text-base font-sans">
                  IEEE Computer Society Bangalore Chapter
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Evaluated distributed architectures and AI research to build production-ready reference implementations, analyzing log metrics across distributed nodes.
                </p>
              </div>
            </div>
          </div>

          {/* Education & Leadership */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Education & Community
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5 border-l-2 border-neutral-900 pl-4">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>B.Tech CSE (Data Science)</span>
                  <span>Graduating 2027</span>
                </div>
                <div className="font-semibold text-neutral-900 text-base font-sans">
                  Manipal Institute of Technology · CGPA 8.51
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Strong foundations in Data Structures & Algorithms, Object-Oriented Design, Operating Systems, and full-stack systems engineering.
                </p>
              </div>

              <div className="space-y-1.5 border-l-2 border-neutral-300 pl-4">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>Project Head</span>
                  <span>2024 – 2025</span>
                </div>
                <div className="font-semibold text-neutral-900 text-base font-sans">
                  Manipal Bengaluru Open-Source Community (MBOSC)
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Mentored 200+ student developers on system architecture, Git workflows, and open-source contributions, leading code reviews and design best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
