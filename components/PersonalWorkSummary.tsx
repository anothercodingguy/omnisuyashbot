'use client';

import React from 'react';

interface PersonalWorkSummaryProps {
  onAskTopic: (topic: string) => void;
}

export function PersonalWorkSummary({ onAskTopic }: PersonalWorkSummaryProps) {
  return (
    <div className="w-full space-y-16 pt-12 pb-24 text-left font-sans">
      {/* ─── PROJECTS SECTION ─── */}
      <section id="projects" className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-[#888888]">
            Selected Work
          </h2>
          <span className="text-xs text-[#888888]">2024 — Present</span>
        </div>

        <div className="space-y-8 text-sm">
          {/* PathFlow */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <button
                onClick={() => onAskTopic('What is PathFlow?')}
                className="font-medium text-[#111111] hover:underline text-left cursor-pointer"
              >
                PathFlow — “Strava for AI Agents”
              </button>
              <span className="text-xs text-[#888888] font-mono">Next.js 15, OpenTelemetry, React Flow</span>
            </div>
            <p className="text-[#666666] leading-relaxed">
              An OpenTelemetry-compatible observability platform to trace multi-step execution paths, token velocity, context volume, and API compute costs across autonomous agent fleets. Includes an interactive React Flow DAG visualizer and @pf.trace SDK.
            </p>
          </div>

          {/* Semantic LLM Gateway */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <button
                onClick={() => onAskTopic('What is the Semantic LLM Gateway?')}
                className="font-medium text-[#111111] hover:underline text-left cursor-pointer"
              >
                Semantic LLM Gateway & Routing Proxy
              </button>
              <span className="text-xs text-[#888888] font-mono">FastAPI, Qdrant, Redis, Groq</span>
            </div>
            <p className="text-[#666666] leading-relaxed">
              Production-grade AI proxy with Qdrant-backed semantic caching achieving cache-hit latencies under 50ms, dynamic intent routing to classify prompt complexity, and circuit-breaker fallbacks.
            </p>
          </div>

          {/* SENNs */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <button
                onClick={() => onAskTopic('Tell me about the SENNs research paper at ICDDS 2025.')}
                className="font-medium text-[#111111] hover:underline text-left cursor-pointer"
              >
                Self-Erasing Neural Networks (SENNs)
              </button>
              <span className="text-xs text-[#888888] font-mono">ICDDS 2025, PyTorch</span>
            </div>
            <p className="text-[#666666] leading-relaxed">
              Co-authored peer-reviewed research accepted at the ICDDS 2025 international conference. Designed an algorithmic framework for GDPR-compliant machine unlearning, evaluating weight shifts and per-class accuracy trade-offs.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE SECTION ─── */}
      <section id="experience" className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-[#888888]">
            Experience
          </h2>
          <span className="text-xs text-[#888888]">Bengaluru, India</span>
        </div>

        <div className="space-y-6 text-sm">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <button
                onClick={() => onAskTopic('What did you do at the Stealth Startup?')}
                className="font-medium text-[#111111] hover:underline text-left cursor-pointer"
              >
                AI Intern · Stealth Startup
              </button>
              <span className="text-xs text-[#888888] font-mono">Dec 2025 – May 2026</span>
            </div>
            <p className="text-[#666666] leading-relaxed">
              Architected and deployed scalable REST APIs and distributed inference pipelines on AWS, engineering highly concurrent state-machine logic and intelligent routing.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <button
                onClick={() => onAskTopic('What did you do at IEEE Computer Society?')}
                className="font-medium text-[#111111] hover:underline text-left cursor-pointer"
              >
                R&D Intern · IEEE Computer Society Bangalore Chapter
              </button>
              <span className="text-xs text-[#888888] font-mono">Apr 2025 – Sept 2025</span>
            </div>
            <p className="text-[#666666] leading-relaxed">
              Evaluated distributed architectures and AI research to build production-ready reference implementations, analyzing system performance metrics and log data.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EDUCATION & COMMUNITY ─── */}
      <section id="education" className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-[#888888]">
            Education & Skills
          </h2>
          <span className="text-xs text-[#888888]">Academics</span>
        </div>

        <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
          <p>
            <strong className="text-[#111111] font-medium">Manipal Institute of Technology</strong> — B.Tech in Computer Science Engineering (Data Science), expected graduation 2027. CGPA: 8.51/10.
          </p>
          <p>
            <strong className="text-[#111111] font-medium">Skills</strong>: Java, C++, Python, TypeScript, SQL, Node.js, FastAPI, Docker, Kubernetes, AWS, GCP, Redis, Qdrant, Prometheus, PyTorch. LeetCode (200+ solved), Codeforces Pupil (1224).
          </p>
          <p>
            <strong className="text-[#111111] font-medium">Leadership</strong>: Project Head at Manipal Bengaluru Open-Source Community (MBOSC 2024–2025) mentoring 200+ student developers, and Project Head at Codex (2025).
          </p>
        </div>
      </section>
    </div>
  );
}
