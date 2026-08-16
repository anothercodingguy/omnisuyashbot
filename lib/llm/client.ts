import { KnowledgeChunk, KNOWLEDGE_BASE } from '../knowledge/chunks';
import {
  SYSTEM_GROUNDING_PROMPT,
  buildPromptWithContext,
  validateCitations,
  GroundedResponse,
} from '../knowledge/grounding';
import { searchProfile, ConversationTurn } from '../knowledge/retriever';

export async function generateGroundedAnswer(
  query: string,
  history: ConversationTurn[] = []
): Promise<GroundedResponse> {
  const startTime = Date.now();

  const qLower = query
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"');

  // 1. Defend against prompt injection attempts & forced hallucination
  const injectionPatterns = [
    'ignore all previous',
    'ignore previous',
    'ignore your sources',
    'ignore sources',
    'disregard rules',
    'make up',
    'invent a',
    'jailbreak',
    'act as an unrestricted',
  ];

  if (injectionPatterns.some((pattern) => qLower.includes(pattern))) {
    return {
      answer:
        "I am strictly grounded in Suyash's verified technical profile. I cannot fabricate personal details, salary, or unverified claims.",
      citations: [],
      grounded: false,
      retrieved_chunk_ids: [],
    };
  }

  // 2. Check for unsupported out-of-scope personal queries
  const unsupportedTriggers = [
    'favorite movie',
    'favourite movie',
    'favorite food',
    'favorite football',
    'favourite football',
    'favorite sport',
    'girlfriend',
    'salary',
    'compensation',
    'how much do you make',
    'how much does he make',
    'where was he born',
    'hometown',
    'parents',
    'religion',
    'political',
  ];

  const isUnsupported = unsupportedTriggers.some((t) => qLower.includes(t));
  if (isUnsupported) {
    return {
      answer:
        "I don't have verified information in Suyash's available profile sources to answer that. As his AI twin, I can discuss his projects like PathFlow, research at ICDDS 2025, technical stack, internships, and leadership.",
      citations: [],
      grounded: false,
      retrieved_chunk_ids: [],
    };
  }

  // 3. Retrieve relevant verified profile chunks
  const { results: retrievedChunks, queryUsed } = searchProfile(query, history, 4);

  // 4. Try LLM API (Groq -> OpenAI -> Gemini) if keys exist
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    try {
      const response = await callGroq(query, retrievedChunks, history, groqKey);
      if (response) return response;
    } catch (e) {
      console.warn('[LLM] Groq call failed, falling back:', e);
    }
  }

  if (openaiKey) {
    try {
      const response = await callOpenAI(query, retrievedChunks, history, openaiKey);
      if (response) return response;
    } catch (e) {
      console.warn('[LLM] OpenAI call failed, falling back:', e);
    }
  }

  if (geminiKey) {
    try {
      const response = await callGemini(query, retrievedChunks, history, geminiKey);
      if (response) return response;
    } catch (e) {
      console.warn('[LLM] Gemini call failed, falling back:', e);
    }
  }

  // 5. Deterministic High-Fidelity Grounded Engine
  return generateDeterministicGroundedResponse(query, retrievedChunks, history);
}

async function callGroq(
  query: string,
  retrievedChunks: KnowledgeChunk[],
  history: ConversationTurn[],
  apiKey: string
): Promise<GroundedResponse | null> {
  const userPrompt = buildPromptWithContext(query, retrievedChunks, history);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 350,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.statusText}`);
  const data = await res.json();
  const rawContent = data.choices[0]?.message?.content;
  if (!rawContent) return null;

  const parsed = JSON.parse(rawContent);
  const citations = validateCitations(parsed.citations || [], retrievedChunks);

  return {
    answer: parsed.answer,
    citations,
    grounded: parsed.grounded !== false && citations.length > 0,
    retrieved_chunk_ids: retrievedChunks.map((c) => c.id),
  };
}

async function callOpenAI(
  query: string,
  retrievedChunks: KnowledgeChunk[],
  history: ConversationTurn[],
  apiKey: string
): Promise<GroundedResponse | null> {
  const userPrompt = buildPromptWithContext(query, retrievedChunks, history);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 350,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
  const data = await res.json();
  const rawContent = data.choices[0]?.message?.content;
  if (!rawContent) return null;

  const parsed = JSON.parse(rawContent);
  const citations = validateCitations(parsed.citations || [], retrievedChunks);

  return {
    answer: parsed.answer,
    citations,
    grounded: parsed.grounded !== false && citations.length > 0,
    retrieved_chunk_ids: retrievedChunks.map((c) => c.id),
  };
}

async function callGemini(
  query: string,
  retrievedChunks: KnowledgeChunk[],
  history: ConversationTurn[],
  apiKey: string
): Promise<GroundedResponse | null> {
  const userPrompt = buildPromptWithContext(query, retrievedChunks, history);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_GROUNDING_PROMPT}\n\n${userPrompt}` },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
  const data = await res.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) return null;

  const parsed = JSON.parse(rawContent);
  const citations = validateCitations(parsed.citations || [], retrievedChunks);

  return {
    answer: parsed.answer,
    citations,
    grounded: parsed.grounded !== false && citations.length > 0,
    retrieved_chunk_ids: retrievedChunks.map((c) => c.id),
  };
}

/**
 * Deterministic Grounded Engine ensuring zero failure rate even without API keys
 */
function generateDeterministicGroundedResponse(
  query: string,
  retrievedChunks: KnowledgeChunk[],
  history: ConversationTurn[]
): GroundedResponse {
  const qLower = query.toLowerCase().replace(/[’‘]/g, "'");

  if (retrievedChunks.length === 0) {
    return {
      answer:
        "I don't have enough verified information in Suyash's available profile sources to answer that accurately.",
      citations: [],
      grounded: false,
      retrieved_chunk_ids: [],
    };
  }

  // Check specific intent categories first

  // 1. Education
  if (
    qLower.includes('education') ||
    qLower.includes('study') ||
    qLower.includes('college') ||
    qLower.includes('degree') ||
    qLower.includes('gpa') ||
    qLower.includes('cgpa')
  ) {
    const eduChunk =
      retrievedChunks.find((c) => c.id === 'resume-education') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-education')!;
    const eduCitations = validateCitations(['resume-education'], [eduChunk, ...retrievedChunks]);
    return {
      answer:
        "Suyash is pursuing a B.Tech in Computer Science Engineering (Data Science) at Manipal Institute of Technology, Bengaluru, with an expected graduation in 2027 and a CGPA of 8.51/10.",
      citations: eduCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-education'],
    };
  }

  // 2. Internships & Work Experience
  if (
    qLower.includes('intern') ||
    qLower.includes('work experience') ||
    qLower.includes('experience') ||
    qLower.includes('job')
  ) {
    const experienceChunks = retrievedChunks.filter((c) => c.category === 'experience');
    const targetChunks =
      experienceChunks.length > 0
        ? experienceChunks
        : KNOWLEDGE_BASE.filter((c) => c.category === 'experience');
    const expCitations = validateCitations(
      targetChunks.map((c) => c.id),
      [...targetChunks, ...retrievedChunks]
    );
    return {
      answer:
        "Suyash's industry experience includes working as an AI Intern at a Stealth Startup building AWS distributed inference pipelines and state-machine logic (Dec 2025 – May 2026), and as an R&D Intern at IEEE Computer Society Bangalore Chapter evaluating distributed architectures (Apr 2025 – Sept 2025).",
      citations: expCitations,
      grounded: true,
      retrieved_chunk_ids: targetChunks.map((c) => c.id),
    };
  }

  // 3. PathFlow
  if (
    qLower.includes('pathflow') ||
    retrievedChunks[0]?.id === 'resume-project-pathflow'
  ) {
    const pathChunk =
      retrievedChunks.find((c) => c.id === 'resume-project-pathflow') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-project-pathflow')!;
    const pathCitations = validateCitations(['resume-project-pathflow'], [pathChunk, ...retrievedChunks]);

    if (qLower.includes('visualiz') || qLower.includes('tree') || qLower.includes('dag')) {
      return {
        answer:
          "For visualization in PathFlow, Suyash built an interactive DAG visualizer using React Flow to inspect multi-step agent execution trees, sub-span latencies, and tool-routing decisions in real time.",
        citations: pathCitations,
        grounded: true,
        retrieved_chunk_ids: ['resume-project-pathflow'],
      };
    }
    if (qLower.includes('technolog') || qLower.includes('built with') || qLower.includes('stack') || qLower.includes('used to build')) {
      return {
        answer:
          "PathFlow is built using Next.js 15, TypeScript, Tailwind CSS, React Flow, Prisma, OpenTelemetry, and Python, featuring a lightweight @pf.trace SDK for streaming execution spans.",
        citations: pathCitations,
        grounded: true,
        retrieved_chunk_ids: ['resume-project-pathflow'],
      };
    }
    return {
      answer:
        "PathFlow is Suyash's OpenTelemetry-compatible observability platform for autonomous AI agent fleets, described as 'Strava for AI Agents.' It tracks execution paths, token velocity, context volume, and API compute costs, with a React Flow DAG visualizer and multi-factor agent benchmarking.",
      citations: pathCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-project-pathflow'],
    };
  }

  // 4. Semantic LLM Gateway
  if (
    qLower.includes('semantic llm') ||
    qLower.includes('gateway') ||
    qLower.includes('routing proxy') ||
    retrievedChunks[0]?.id === 'resume-project-semantic-llm'
  ) {
    const semChunk =
      retrievedChunks.find((c) => c.id === 'resume-project-semantic-llm') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-project-semantic-llm')!;
    const semCitations = validateCitations(['resume-project-semantic-llm'], [semChunk, ...retrievedChunks]);
    return {
      answer:
        "The Semantic LLM Gateway is a production-grade AI proxy built with FastAPI, Qdrant, Redis, Groq, and Ollama. It features Qdrant-backed semantic caching achieving cache-hit latencies under 50ms, dynamic intent routing, and circuit-breaker fallbacks.",
      citations: semCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-project-semantic-llm'],
    };
  }

  // 5. SENNs Research
  if (
    qLower.includes('senns') ||
    qLower.includes('senn') ||
    qLower.includes('self-erasing') ||
    qLower.includes('unlearning') ||
    qLower.includes('icdds') ||
    retrievedChunks[0]?.id === 'resume-project-senns'
  ) {
    const sennChunk =
      retrievedChunks.find((c) => c.id === 'resume-project-senns') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-project-senns')!;
    const sennCitations = validateCitations(['resume-project-senns'], [sennChunk, ...retrievedChunks]);
    return {
      answer:
        "SENNs (Self-Erasing Neural Networks) is a peer-reviewed research publication accepted at the ICDDS 2025 international conference. Suyash co-authored this algorithmic framework for GDPR-compliant machine unlearning, developing diagnostic pipelines in Python and PyTorch to evaluate weight shifts and accuracy trade-offs.",
      citations: sennCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-project-senns'],
    };
  }

  // 6. ReachInbox
  if (qLower.includes('reachinbox') || qLower.includes('email scheduler')) {
    const reachChunk =
      retrievedChunks.find((c) => c.id === 'resume-project-reachinbox') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-project-reachinbox')!;
    const reachCitations = validateCitations(['resume-project-reachinbox'], [reachChunk, ...retrievedChunks]);
    return {
      answer:
        "ReachInbox is a highly concurrent email scheduling system built with TypeScript, Next.js, Node.js, and Redis, ensuring reliable asynchronous task execution across distributed queues with responsive interfaces.",
      citations: reachCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-project-reachinbox'],
    };
  }

  // 7. Stealth Startup specifically
  if (qLower.includes('stealth')) {
    const stealthChunk =
      retrievedChunks.find((c) => c.id === 'resume-experience-stealth') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-experience-stealth')!;
    const stealthCitations = validateCitations(['resume-experience-stealth'], [stealthChunk, ...retrievedChunks]);
    return {
      answer:
        "At the Stealth Startup in Bengaluru (Dec 2025 – May 2026), Suyash served as an AI Intern. He architected scalable REST APIs and distributed inference pipelines on AWS, engineering highly concurrent state-machine logic, multi-turn session management, and intelligent routing logic.",
      citations: stealthCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-experience-stealth'],
    };
  }

  // 8. Leadership & Clubs
  if (qLower.includes('leadership') || qLower.includes('mbosc') || qLower.includes('codex') || qLower.includes('mentor')) {
    const mboscChunk =
      retrievedChunks.find((c) => c.id === 'resume-leadership-mbosc') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-leadership-mbosc')!;
    const leadCitations = validateCitations(['resume-leadership-mbosc'], [mboscChunk, ...retrievedChunks]);
    return {
      answer:
        "Suyash served as Project Head for the Manipal Bengaluru Open-Source Community (MBOSC 2024–2025), mentoring over 200 student developers on system architecture and code reviews, and as Project Head for Codex competitive programming club in 2025.",
      citations: leadCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-leadership-mbosc'],
    };
  }

  // 9. Skills & Competitive Programming
  if (
    qLower.includes('skill') ||
    qLower.includes('technolog') ||
    qLower.includes('language') ||
    qLower.includes('leetcode') ||
    qLower.includes('codeforces') ||
    qLower.includes('codechef') ||
    qLower.includes('rating')
  ) {
    const skillChunk =
      retrievedChunks.find((c) => c.category === 'skills') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-skills-fundamentals')!;
    const skillCitations = validateCitations([skillChunk.id], [skillChunk, ...retrievedChunks]);
    return {
      answer:
        "Suyash's core technical stack spans Data Structures & Algorithms, System Design, Java, C++, Python, TypeScript, Node.js, FastAPI, Docker, Kubernetes, AWS, GCP, Redis, Qdrant, Prometheus, and PyTorch. He is also a Codeforces Pupil (1224 rating) with 200+ LeetCode problems solved.",
      citations: skillCitations,
      grounded: true,
      retrieved_chunk_ids: [skillChunk.id],
    };
  }

  // 10. General Profile / Why Hire
  const primary = retrievedChunks[0];
  const citations = validateCitations([primary.id], retrievedChunks);
  return {
    answer:
      "Suyash Singh is a full-stack and systems engineer specializing in AI agent observability (PathFlow), low-latency AI proxies, and distributed inference. He combines rigorous CS fundamentals (8.51 CGPA at Manipal, Codeforces Pupil) with production backend engineering on AWS and published machine unlearning research at ICDDS 2025.",
    citations,
    grounded: true,
    retrieved_chunk_ids: [primary.id],
  };
}
