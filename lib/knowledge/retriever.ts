import { KNOWLEDGE_BASE, KnowledgeChunk } from './chunks';

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedTerms: string[];
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  citedChunkIds?: string[];
}

// Common entity aliases and context keywords
const ENTITY_ALIASES: Record<string, string[]> = {
  'resume-project-pathflow': [
    'pathflow',
    'strava for ai agents',
    'agent observability',
    'execution tree',
    'dag visualizer',
    'dag',
    'visualization',
    'visualizer',
    'react flow',
    'opentelemetry',
    '@pf.trace',
    'benchmarking engine',
    'token velocity',
    'context volume',
  ],
  'resume-project-semantic-llm': [
    'semantic llm gateway',
    'routing proxy',
    'gateway',
    'proxy',
    'semantic caching',
    '50ms',
    'under 50ms',
    'intent routing',
    'circuit breaker',
    'groq',
    'ollama',
    'qdrant',
  ],
  'resume-project-senns': [
    'senns',
    'senn',
    'self-erasing neural networks',
    'machine unlearning',
    'unlearning',
    'icdds',
    'icdds 2025',
    'gdpr',
    'research paper',
    'publication',
    'weight shifts',
  ],
  'resume-project-reachinbox': [
    'reachinbox',
    'email scheduler',
    'email scheduling',
    'distributed queues',
  ],
  'resume-experience-stealth': [
    'stealth startup',
    'stealth',
    'ai intern',
    'state machine',
    'inference pipelines',
    'multi-turn session',
  ],
  'resume-experience-ieee': [
    'ieee',
    'ieee computer society',
    'bangalore chapter',
    'r&d intern',
    'distributed nodes',
  ],
  'resume-education': [
    'education',
    'college',
    'university',
    'study',
    'studies',
    'degree',
    'btech',
    'b.tech',
    'manipal',
    'mit',
    'cgpa',
    'gpa',
    'graduation',
    '2027',
  ],
  'resume-skills-fundamentals': [
    'dsa',
    'data structures',
    'algorithms',
    'system design',
    'ood',
    'operating systems',
    'languages',
    'c++',
    'java',
    'python',
    'typescript',
    'javascript',
    'sql',
  ],
  'resume-skills-backend-cloud': [
    'backend',
    'cloud',
    'fastapi',
    'node',
    'express',
    'docker',
    'kubernetes',
    'k8s',
    'nats',
    'keda',
    'aws',
    'gcp',
    'redis',
    'postgres',
    'postgresql',
    'mongodb',
    'qdrant',
    'prometheus',
    'grafana',
    'upstash',
  ],
  'resume-skills-ml-cp': [
    'ml',
    'ai',
    'machine learning',
    'pytorch',
    'competitive programming',
    'leetcode',
    'codeforces',
    'codechef',
    'rating',
    'pupil',
    'solved',
  ],
  'resume-leadership-mbosc': [
    'mbosc',
    'manipal bengaluru open-source',
    'open source',
    'mentored 200+',
    'mentorship',
    'leadership',
  ],
  'resume-leadership-codex': [
    'codex',
    'competitive programming club',
  ],
  'resume-identity': [
    'who is suyash',
    'who is he',
    'tell me about suyash',
    'bio',
    'profile',
    'github',
    'linkedin',
    'email',
    'contact',
    'hire suyash',
    'why hire',
    'strongest technical areas',
    'what does he build',
  ],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-_@]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Resolves context & entity references from previous conversational turns
 * E.g., User asks "What did he use for visualization?" -> refers to PathFlow (React Flow)
 */
export function resolveQueryWithContext(query: string, history: ConversationTurn[] = []): string {
  const qLower = query.toLowerCase();
  const hasPronounOrVague =
    /\b(it|he|him|his|this|that|they|the project|the app|the tool|visualization|visualizer|architecture|stack|technologies|backend|cache|framework)\b/i.test(
      qLower
    );

  if (!hasPronounOrVague || history.length === 0) {
    return query;
  }

  // Look backwards through history for cited entities
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.citedChunkIds && turn.citedChunkIds.length > 0) {
      const primaryChunkId = turn.citedChunkIds[0];
      const chunk = KNOWLEDGE_BASE.find((c) => c.id === primaryChunkId);
      if (chunk) {
        return `${query} ${chunk.entity} ${chunk.title}`;
      }
    }
    const prevText = turn.content.toLowerCase();
    for (const [chunkId, aliases] of Object.entries(ENTITY_ALIASES)) {
      for (const alias of aliases) {
        if (prevText.includes(alias)) {
          const chunk = KNOWLEDGE_BASE.find((c) => c.id === chunkId);
          if (chunk) {
            return `${query} ${chunk.entity} ${alias}`;
          }
        }
      }
    }
  }

  return query;
}

/**
 * Searches the verified knowledge base and returns ranked chunks
 */
export function searchProfile(
  rawQuery: string,
  history: ConversationTurn[] = [],
  topK: number = 4
): { results: KnowledgeChunk[]; allMatches: RetrievalResult[]; queryUsed: string } {
  const query = resolveQueryWithContext(rawQuery, history);
  const qLower = query.toLowerCase();
  const queryTokens = tokenize(query);

  const scored: RetrievalResult[] = KNOWLEDGE_BASE.map((chunk) => {
    let score = 0;
    const matchedTerms: string[] = [];

    // 1. Direct Entity and Alias matching
    const aliases = ENTITY_ALIASES[chunk.id] || [];
    for (const alias of aliases) {
      if (qLower.includes(alias.toLowerCase())) {
        score += 15;
        matchedTerms.push(alias);
      }
    }

    // 2. Keyword exact matching
    for (const kw of chunk.keywords) {
      const kwLower = kw.toLowerCase();
      if (qLower.includes(kwLower)) {
        score += 8;
        matchedTerms.push(kw);
      }
    }

    // 3. Technologies matching
    if (chunk.technologies) {
      for (const tech of chunk.technologies) {
        const tLower = tech.toLowerCase();
        if (qLower.includes(tLower) || queryTokens.includes(tLower)) {
          score += 6;
          matchedTerms.push(tech);
        }
      }
    }

    // 4. Token Overlap Scoring
    const chunkTokens = tokenize(
      `${chunk.title} ${chunk.section} ${chunk.entity} ${chunk.content}`
    );
    const tokenSet = new Set(chunkTokens);

    for (const token of queryTokens) {
      if (tokenSet.has(token)) {
        score += 2;
        matchedTerms.push(token);
      }
    }

    // 5. Category-level boosts
    if (
      (qLower.includes('project') || qLower.includes('built') || qLower.includes('build')) &&
      chunk.category === 'project'
    ) {
      score += 3;
    }
    if (
      (qLower.includes('intern') || qLower.includes('work') || qLower.includes('experience') || qLower.includes('job')) &&
      chunk.category === 'experience'
    ) {
      score += 4;
    }
    if (
      (qLower.includes('study') || qLower.includes('education') || qLower.includes('college') || qLower.includes('degree') || qLower.includes('gpa') || qLower.includes('cgpa')) &&
      chunk.category === 'education'
    ) {
      score += 5;
    }
    if (
      (qLower.includes('skill') || qLower.includes('technolog') || qLower.includes('stack') || qLower.includes('language')) &&
      (chunk.category === 'skills' || chunk.technologies)
    ) {
      score += 3;
    }
    if (
      (qLower.includes('lead') || qLower.includes('club') || qLower.includes('community') || qLower.includes('mentor')) &&
      chunk.category === 'leadership'
    ) {
      score += 4;
    }
    if (
      (qLower.includes('research') || qLower.includes('paper') || qLower.includes('publication') || qLower.includes('unlearning')) &&
      chunk.id === 'resume-project-senns'
    ) {
      score += 6;
    }

    return {
      chunk,
      score,
      matchedTerms: Array.from(new Set(matchedTerms)),
    };
  });

  // Filter and sort by score
  const filtered = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

  // If general "who is suyash" or "why hire" and no specific chunk high scored, include identity & skills
  if (filtered.length === 0 && (qLower.includes('suyash') || qLower.includes('who') || qLower.includes('hire') || qLower.includes('overview'))) {
    const fallbackIds = ['resume-identity', 'resume-skills-fundamentals', 'resume-project-pathflow'];
    const fallbacks = KNOWLEDGE_BASE.filter((c) => fallbackIds.includes(c.id)).map((c) => ({
      chunk: c,
      score: 1,
      matchedTerms: ['general-profile'],
    }));
    return {
      results: fallbacks.map((f) => f.chunk),
      allMatches: fallbacks,
      queryUsed: query,
    };
  }

  const topResults = filtered.slice(0, topK);

  return {
    results: topResults.map((item) => item.chunk),
    allMatches: topResults,
    queryUsed: query,
  };
}
