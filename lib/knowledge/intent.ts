import { ConversationTurn } from './retriever';

export type QueryIntent =
  | 'greeting'
  | 'identity'
  | 'profile_overview'
  | 'education'
  | 'skills'
  | 'projects'
  | 'pathflow'
  | 'semantic_gateway'
  | 'reachinbox'
  | 'research'
  | 'work_experience'
  | 'leadership'
  | 'competitive_programming'
  | 'contact'
  | 'prompt_injection'
  | 'unsupported'
  | 'general_query';

export interface ClassifiedQuery {
  rawQuery: string;
  normalizedQuery: string;
  intent: QueryIntent;
  detectedEntity: string | null;
  subtopic: string | null;
  expandedKeywords: string[];
  resolvedContextQuery: string;
}

const INJECTION_PATTERNS = [
  'ignore all previous',
  'ignore previous',
  'ignore your sources',
  'ignore sources',
  'ignore your instructions',
  'ignore instructions',
  'disregard rules',
  'disregard your instructions',
  'make up',
  'invent a',
  'jailbreak',
  'act as an unrestricted',
  'reveal system prompt',
];

const UNSUPPORTED_TRIGGERS = [
  'favorite movie',
  'favourite movie',
  'favorite food',
  'favourite food',
  'favorite football',
  'favourite football',
  'favorite club',
  'favorite team',
  'favourite team',
  'favorite sport',
  'favourite sport',
  'favorite player',
  'girlfriend',
  'boyfriend',
  'salary',
  'compensation',
  'how much do you make',
  'how much does he make',
  'how much money',
  'net worth',
  'where was he born',
  'hometown',
  'parents',
  'father',
  'mother',
  'religion',
  'political',
  'politics',
  'marital',
  'married',
  'crush',
];

const GREETING_PATTERNS = [
  /^hello[\s!.]*$/i,
  /^hi[\s!.]*$/i,
  /^hey[\s!.]*$/i,
  /^hey there[\s!.]*$/i,
  /^hi there[\s!.]*$/i,
  /^good morning[\s!.]*$/i,
  /^good afternoon[\s!.]*$/i,
  /^good evening[\s!.]*$/i,
  /^howdy[\s!.]*$/i,
  /^yo[\s!.]*$/i,
  /^greetings[\s!.]*$/i,
];

/**
 * Classifies a natural language query into an intent and resolves contextual pronouns
 */
export function classifyQuery(rawQuery: string, history: ConversationTurn[] = []): ClassifiedQuery {
  const normalized = rawQuery
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();

  // 1. Check prompt injection
  if (INJECTION_PATTERNS.some((p) => normalized.includes(p))) {
    return {
      rawQuery,
      normalizedQuery: normalized,
      intent: 'prompt_injection',
      detectedEntity: null,
      subtopic: null,
      expandedKeywords: [],
      resolvedContextQuery: rawQuery,
    };
  }

  // 2. Check unsupported personal trivia
  if (UNSUPPORTED_TRIGGERS.some((t) => normalized.includes(t))) {
    return {
      rawQuery,
      normalizedQuery: normalized,
      intent: 'unsupported',
      detectedEntity: null,
      subtopic: null,
      expandedKeywords: [],
      resolvedContextQuery: rawQuery,
    };
  }

  // 3. Check greetings
  if (GREETING_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      rawQuery,
      normalizedQuery: normalized,
      intent: 'greeting',
      detectedEntity: null,
      subtopic: null,
      expandedKeywords: [],
      resolvedContextQuery: rawQuery,
    };
  }

  // 4. Entity Detection in Current Query or Conversation Context
  let detectedEntity: string | null = null;
  let subtopic: string | null = null;

  if (normalized.includes('pathflow') || normalized.includes('strava for ai')) {
    detectedEntity = 'PathFlow';
  } else if (
    normalized.includes('semantic llm') ||
    normalized.includes('semantic gateway') ||
    normalized.includes('routing proxy') ||
    (normalized.includes('gateway') && !normalized.includes('pathflow'))
  ) {
    detectedEntity = 'Semantic LLM Gateway';
  } else if (normalized.includes('senns') || normalized.includes('self-erasing') || normalized.includes('unlearning')) {
    detectedEntity = 'SENNs';
  } else if (normalized.includes('reachinbox')) {
    detectedEntity = 'ReachInbox';
  } else if (normalized.includes('stealth')) {
    detectedEntity = 'Stealth Startup';
  } else if (normalized.includes('ieee')) {
    detectedEntity = 'IEEE Computer Society';
  } else if (normalized.includes('mbosc')) {
    detectedEntity = 'MBOSC';
  } else if (normalized.includes('codex')) {
    detectedEntity = 'Codex';
  }

  // Contextual Follow-up Entity & Pronoun Resolution
  if (!detectedEntity && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      const prevText = turn.content.toLowerCase();
      if (turn.citedChunkIds?.some((id) => id.includes('pathflow')) || prevText.includes('pathflow')) {
        detectedEntity = 'PathFlow';
        break;
      }
      if (turn.citedChunkIds?.some((id) => id.includes('semantic-llm')) || prevText.includes('gateway')) {
        detectedEntity = 'Semantic LLM Gateway';
        break;
      }
      if (turn.citedChunkIds?.some((id) => id.includes('senns')) || prevText.includes('senns') || prevText.includes('unlearning')) {
        detectedEntity = 'SENNs';
        break;
      }
      if (turn.citedChunkIds?.some((id) => id.includes('reachinbox')) || prevText.includes('reachinbox')) {
        detectedEntity = 'ReachInbox';
        break;
      }
    }
  }

  // Subtopic Detection
  if (normalized.includes('visualiz') || normalized.includes('dag') || normalized.includes('tree') || normalized.includes('react flow')) {
    subtopic = 'visualization';
  } else if (normalized.includes('tech') || normalized.includes('stack') || normalized.includes('built with') || normalized.includes('used to build')) {
    subtopic = 'tech_stack';
  } else if (normalized.includes('latency') || normalized.includes('cache') || normalized.includes('50ms')) {
    subtopic = 'caching';
  }

  // 5. Intent Classification
  let intent: QueryIntent = 'general_query';
  let expandedKeywords: string[] = [];

  // Identity / Digital Twin self-reference
  if (
    normalized.includes('who are you') ||
    normalized.includes('what are you') ||
    normalized.includes('what is your profile') ||
    normalized.includes('tell me about yourself') ||
    normalized.includes('who is the twin')
  ) {
    intent = 'identity';
    expandedKeywords = ['Suyash Singh identity AI digital twin background profile'];
  }
  // Broad Profile Overview (CRITICAL FIX)
  else if (
    normalized === 'what does he do' ||
    normalized === 'what does he do?' ||
    normalized === 'what does suyash do' ||
    normalized === 'what does suyash do?' ||
    normalized.includes('what kind of engineer') ||
    normalized.includes('tell me about suyash') ||
    normalized.includes('tell me about his background') ||
    normalized.includes('what is his background') ||
    normalized.includes('what is his profile') ||
    normalized.includes('what does he work on') ||
    normalized.includes('what does suyash work on') ||
    normalized.includes('what is suyash into') ||
    normalized.includes('what are his main areas') ||
    normalized.includes('give me an overview') ||
    normalized.includes('what does he specialize in') ||
    normalized.includes('tell me about his technical background') ||
    normalized.includes('what are his strengths') ||
    normalized.includes('why should someone hire') ||
    normalized.includes('why hire suyash') ||
    normalized.includes('who would hire') ||
    normalized.includes('who is suyash')
  ) {
    intent = 'profile_overview';
    expandedKeywords = [
      'Suyash Singh',
      'profile overview',
      'education',
      'Computer Science',
      'Data Science',
      'software engineering',
      'AI systems',
      'backend infrastructure',
      'PathFlow',
      'Semantic LLM Gateway',
      'SENNs',
      'machine unlearning',
      'work experience',
      'Stealth Startup',
      'skills',
    ];
  }
  // PathFlow Specific
  else if (detectedEntity === 'PathFlow' || normalized.includes('pathflow')) {
    intent = 'pathflow';
    expandedKeywords = ['PathFlow', 'Strava for AI Agents', 'observability', 'React Flow', 'DAG visualizer', 'OpenTelemetry', '@pf.trace'];
  }
  // Semantic Gateway Specific
  else if (detectedEntity === 'Semantic LLM Gateway' || normalized.includes('semantic gateway') || (normalized.includes('gateway') && !normalized.includes('pathflow'))) {
    intent = 'semantic_gateway';
    expandedKeywords = ['Semantic LLM Gateway', 'FastAPI', 'Qdrant', 'semantic caching', '50ms', 'routing proxy', 'Groq', 'circuit-breaker'];
  }
  // SENNs / Research
  else if (detectedEntity === 'SENNs' || normalized.includes('senns') || normalized.includes('research') || normalized.includes('unlearning') || normalized.includes('paper') || normalized.includes('icdds')) {
    intent = 'research';
    expandedKeywords = ['SENNs', 'Self-Erasing Neural Networks', 'ICDDS 2025', 'machine unlearning', 'GDPR', 'PyTorch', 'weight shifts'];
  }
  // ReachInbox
  else if (detectedEntity === 'ReachInbox' || normalized.includes('reachinbox') || normalized.includes('email scheduler')) {
    intent = 'reachinbox';
    expandedKeywords = ['ReachInbox', 'email scheduler', 'TypeScript', 'Next.js', 'Redis', 'distributed queues'];
  }
  // Education
  else if (
    normalized.includes('education') ||
    normalized.includes('study') ||
    normalized.includes('studies') ||
    normalized.includes('studying') ||
    normalized.includes('college') ||
    normalized.includes('university') ||
    normalized.includes('degree') ||
    normalized.includes('gpa') ||
    normalized.includes('cgpa') ||
    normalized.includes('academic') ||
    normalized.includes('manipal') ||
    normalized.includes('btech')
  ) {
    intent = 'education';
    expandedKeywords = ['Manipal Institute of Technology', 'B.Tech', 'Data Science', '2027', 'CGPA 8.51', 'education'];
  }
  // Work Experience / Internships
  else if (
    normalized.includes('intern') ||
    normalized.includes('work experience') ||
    normalized.includes('where has he worked') ||
    normalized.includes('professional experience') ||
    normalized.includes('job') ||
    normalized.includes('stealth') ||
    normalized.includes('ieee')
  ) {
    intent = 'work_experience';
    expandedKeywords = ['Stealth Startup', 'AI Intern', 'AWS distributed inference', 'IEEE Computer Society', 'R&D Intern', 'work experience'];
  }
  // Projects General
  else if (
    normalized.includes('what has he built') ||
    normalized.includes('what projects') ||
    normalized.includes('tell me about his projects') ||
    normalized.includes('built') ||
    normalized.includes('projects')
  ) {
    intent = 'projects';
    expandedKeywords = ['PathFlow', 'Semantic LLM Gateway', 'ReachInbox', 'SENNs', 'projects built'];
  }
  // Technical Skills
  else if (
    normalized.includes('skill') ||
    normalized.includes('technolog') ||
    normalized.includes('tech stack') ||
    normalized.includes('what does he use') ||
    normalized.includes('programming languages') ||
    normalized.includes('frameworks') ||
    normalized.includes('tools') ||
    normalized.includes('languages')
  ) {
    intent = 'skills';
    expandedKeywords = ['Java', 'C++', 'Python', 'TypeScript', 'Node.js', 'FastAPI', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Qdrant', 'PyTorch', 'skills'];
  }
  // Leadership
  else if (
    normalized.includes('leadership') ||
    normalized.includes('mbosc') ||
    normalized.includes('codex') ||
    normalized.includes('mentor') ||
    normalized.includes('community')
  ) {
    intent = 'leadership';
    expandedKeywords = ['MBOSC', 'Manipal Bengaluru Open-Source Community', 'Codex', 'mentored 200+ developers', 'leadership'];
  }
  // Competitive Programming
  else if (
    normalized.includes('competitive programming') ||
    normalized.includes('leetcode') ||
    normalized.includes('codeforces') ||
    normalized.includes('codechef') ||
    normalized.includes('pupil') ||
    normalized.includes('rating')
  ) {
    intent = 'competitive_programming';
    expandedKeywords = ['Codeforces Pupil 1224', 'LeetCode 200+ solved', 'CodeChef 3 star', 'competitive programming'];
  }
  // Contact
  else if (
    normalized.includes('contact') ||
    normalized.includes('email') ||
    normalized.includes('linkedin') ||
    normalized.includes('github') ||
    normalized.includes('phone') ||
    normalized.includes('reach out') ||
    normalized.includes('website')
  ) {
    intent = 'contact';
    expandedKeywords = ['email', 'portfolio https://suyash.website', 'linkedin', 'github', 'contact'];
  }

  // Construct resolved context query
  let resolvedContextQuery = rawQuery;
  if (detectedEntity && !normalized.includes(detectedEntity.toLowerCase())) {
    resolvedContextQuery = `${rawQuery} ${detectedEntity}`;
  }
  if (expandedKeywords.length > 0) {
    resolvedContextQuery = `${resolvedContextQuery} ${expandedKeywords.join(' ')}`;
  }

  return {
    rawQuery,
    normalizedQuery: normalized,
    intent,
    detectedEntity,
    subtopic,
    expandedKeywords,
    resolvedContextQuery,
  };
}
