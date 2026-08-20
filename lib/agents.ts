export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  greeting: string;
  color: {
    orbGradient: string;
    orbPrimary: string;
    orbSecondary: string;
    accent: string;
    lightBg: string;
    border: string;
  };
  suggestedQuestions: string[];
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'suyash-general',
    name: 'Suyash Singh',
    role: 'Full AI Digital Twin',
    description: 'General background, projects, education & career overview',
    greeting:
      'Hi! I’m Suyash’s AI digital twin. Feel free to ask about my projects like PathFlow, research at ICDDS 2025, technical stack, or internships.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(134, 239, 172, 0.85) 0%, rgba(74, 222, 128, 0.5) 45%, rgba(187, 247, 208, 0.2) 70%, transparent 100%)',
      orbPrimary: '#22C55E',
      orbSecondary: '#86EFAC',
      accent: '#16A34A',
      lightBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      border: 'border-emerald-500',
    },
    suggestedQuestions: [
      'Who are you?',
      'What are your strongest technical areas?',
      'Tell me about your education and GPA.',
      'What makes you stand out as an engineer?',
    ],
  },
  {
    id: 'pathflow-observability',
    name: 'PathFlow Specialist',
    role: 'Agent Observability & DAG Tracing',
    description: 'OpenTelemetry, React Flow DAGs & Agent Fleets',
    greeting:
      'PathFlow is my OpenTelemetry-compatible observability platform for AI agents. Ask me about execution trees, token velocity, or my React Flow DAG visualizer.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(147, 197, 253, 0.85) 0%, rgba(96, 165, 250, 0.5) 45%, rgba(191, 219, 254, 0.2) 70%, transparent 100%)',
      orbPrimary: '#3B82F6',
      orbSecondary: '#93C5FD',
      accent: '#2563EB',
      lightBg: 'bg-blue-50 text-blue-900 border-blue-200',
      border: 'border-blue-500',
    },
    suggestedQuestions: [
      'What is PathFlow (“Strava for AI Agents”)?',
      'What is PathFlow’s architecture & tech stack?',
      'How does the React Flow DAG visualizer work?',
      'What is the agent ranking formula?',
    ],
  },
  {
    id: 'semantic-gateway',
    name: 'Semantic LLM Gateway',
    role: 'Routing & Caching Proxy',
    description: 'FastAPI, Qdrant semantic caching (<50ms) & circuit breakers',
    greeting:
      'I can explain my Semantic LLM Gateway & Routing Proxy. Ask about Qdrant semantic caching (<50ms hits), dynamic intent routing, or fallback reliability.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(192, 132, 252, 0.85) 0%, rgba(168, 85, 247, 0.5) 45%, rgba(233, 213, 255, 0.2) 70%, transparent 100%)',
      orbPrimary: '#A855F7',
      orbSecondary: '#C084FC',
      accent: '#7C3AED',
      lightBg: 'bg-purple-50 text-purple-900 border-purple-200',
      border: 'border-purple-500',
    },
    suggestedQuestions: [
      'What is the Semantic LLM Gateway?',
      'How does it achieve under 50ms cache hits?',
      'What is dynamic intent routing?',
      'How does the circuit-breaker fallback work?',
    ],
  },
  {
    id: 'senns-research',
    name: 'SENNs & AI Research',
    role: 'ICDDS 2025 Machine Unlearning',
    description: 'GDPR machine unlearning, PyTorch & weight shift diagnostics',
    greeting:
      'Ask me about my co-authored peer-reviewed research paper on Self-Erasing Neural Networks (SENNs) accepted at the ICDDS 2025 conference.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(253, 186, 116, 0.85) 0%, rgba(251, 146, 60, 0.5) 45%, rgba(254, 215, 170, 0.2) 70%, transparent 100%)',
      orbPrimary: '#F97316',
      orbSecondary: '#FDBA74',
      accent: '#EA580C',
      lightBg: 'bg-orange-50 text-orange-900 border-orange-200',
      border: 'border-orange-500',
    },
    suggestedQuestions: [
      'What is SENNs research at ICDDS 2025?',
      'How does GDPR machine unlearning work?',
      'What diagnostic pipelines were evaluated?',
    ],
  },
  {
    id: 'stealth-internship',
    name: 'Systems & Work Experience',
    role: 'AI Intern (Stealth) & IEEE R&D',
    description: 'AWS inference pipelines, state machines & distributed nodes',
    greeting:
      'Ask me about my work experience as an AI Intern at a Stealth Startup on AWS inference pipelines, and R&D Intern at IEEE Computer Society.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(94, 234, 212, 0.85) 0%, rgba(45, 212, 191, 0.5) 45%, rgba(204, 251, 241, 0.2) 70%, transparent 100%)',
      orbPrimary: '#0D9488',
      orbSecondary: '#5EEAD4',
      accent: '#0F766E',
      lightBg: 'bg-teal-50 text-teal-900 border-teal-200',
      border: 'border-teal-500',
    },
    suggestedQuestions: [
      'Tell me about your internships at Stealth & IEEE.',
      'What did you build at the Stealth Startup?',
      'What did you do at IEEE Computer Society?',
    ],
  },
  {
    id: 'skills-competitive',
    name: 'Skills & Problem Solving',
    role: 'Competitive Programming & DSA',
    description: 'LeetCode 200+, Codeforces Pupil (1224), System Design',
    greeting:
      'Ask me about my core technical skills, programming languages, LeetCode (200+ solved), Codeforces ranking, and open-source leadership at MBOSC.',
    color: {
      orbGradient: 'radial-gradient(circle, rgba(253, 224, 71, 0.85) 0%, rgba(234, 179, 8, 0.5) 45%, rgba(254, 240, 138, 0.2) 70%, transparent 100%)',
      orbPrimary: '#CA8A04',
      orbSecondary: '#FDE047',
      accent: '#A16207',
      lightBg: 'bg-amber-50 text-amber-900 border-amber-200',
      border: 'border-amber-500',
    },
    suggestedQuestions: [
      'What programming languages do you know?',
      'What is your competitive programming background?',
      'Tell me about your leadership at MBOSC and Codex.',
    ],
  },
];
