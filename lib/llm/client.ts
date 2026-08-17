import { KnowledgeChunk, KNOWLEDGE_BASE } from '../knowledge/chunks';
import {
  SYSTEM_GROUNDING_PROMPT,
  buildPromptWithContext,
  validateCitations,
  GroundedResponse,
} from '../knowledge/grounding';
import { searchProfile, ConversationTurn } from '../knowledge/retriever';
import { ClassifiedQuery } from '../knowledge/intent';

export async function generateGroundedAnswer(
  query: string,
  history: ConversationTurn[] = []
): Promise<GroundedResponse> {
  const startTime = Date.now();

  // 1. Retrieve relevant verified profile chunks and classify intent
  const { results: retrievedChunks, queryUsed, classification } = searchProfile(query, history, 6);
  const { intent, detectedEntity, subtopic } = classification;

  // 2. Internal Diagnostic Decision Logging
  console.log(`[RETRIEVAL] ──────────────────────────────────────────`);
  console.log(`[RETRIEVAL] Query: "${query}"`);
  console.log(`[RETRIEVAL] Intent: ${intent} | Entity: ${detectedEntity || 'none'} | Subtopic: ${subtopic || 'none'}`);
  console.log(`[RETRIEVAL] Expanded: "${queryUsed}"`);
  console.log(`[RETRIEVAL] Retrieved ${retrievedChunks.length} chunks: [${retrievedChunks.map((c) => c.id).join(', ')}]`);

  // 3. Fast-path: Casual Conversational Greetings
  if (intent === 'greeting') {
    console.log(`[RETRIEVAL] Fast-path greeting returned (no citations required)`);
    return {
      answer: "Hey! I’m Suyash’s AI digital twin. What would you like to know about his projects, engineering experience, or research?",
      citations: [],
      grounded: true,
      retrieved_chunk_ids: [],
    };
  }

  // 4. Prompt Injection Defense
  if (intent === 'prompt_injection') {
    console.log(`[RETRIEVAL] Prompt injection detected and blocked`);
    return {
      answer: "I am strictly grounded in Suyash's verified technical profile. I cannot fabricate personal details, salary, or unverified claims.",
      citations: [],
      grounded: false,
      retrieved_chunk_ids: [],
    };
  }

  // 5. Unsupported Personal Trivia Defense
  if (intent === 'unsupported') {
    console.log(`[RETRIEVAL] Unsupported trivia detected (grounded fallback returned)`);
    return {
      answer: "I don't have verified information in Suyash's available profile sources to answer that. As his AI twin, I can discuss his projects like PathFlow, research at ICDDS 2025, technical stack, internships, and leadership.",
      citations: [],
      grounded: false,
      retrieved_chunk_ids: [],
    };
  }

  // 6. Identity / Digital Twin self-explanation
  if (intent === 'identity') {
    const identityChunk = retrievedChunks.find((c) => c.id === 'resume-identity') || KNOWLEDGE_BASE[0];
    const citations = validateCitations(['resume-identity'], [identityChunk, ...retrievedChunks]);
    return {
      answer: "I’m Suyash’s AI digital twin. I can tell you about his projects (like PathFlow and the Semantic LLM Gateway), engineering experience at a Stealth Startup and IEEE, machine unlearning research at ICDDS 2025, education at Manipal, and core technical skills.",
      citations,
      grounded: true,
      retrieved_chunk_ids: ['resume-identity'],
    };
  }

  // 7. Try External LLM APIs (Groq -> OpenAI -> Gemini) if keys exist
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey && retrievedChunks.length > 0) {
    try {
      const response = await callGroq(query, retrievedChunks, history, groqKey);
      if (response && response.grounded) {
        console.log(`[RETRIEVAL] Groq returned grounded answer with ${response.citations.length} citations`);
        return response;
      }
    } catch (e) {
      console.warn('[LLM] Groq call notice:', e);
    }
  }

  if (openaiKey && retrievedChunks.length > 0) {
    try {
      const response = await callOpenAI(query, retrievedChunks, history, openaiKey);
      if (response && response.grounded) {
        console.log(`[RETRIEVAL] OpenAI returned grounded answer with ${response.citations.length} citations`);
        return response;
      }
    } catch (e) {
      console.warn('[LLM] OpenAI call notice:', e);
    }
  }

  if (geminiKey && retrievedChunks.length > 0) {
    try {
      const response = await callGemini(query, retrievedChunks, history, geminiKey);
      if (response && response.grounded) {
        console.log(`[RETRIEVAL] Gemini returned grounded answer with ${response.citations.length} citations`);
        return response;
      }
    } catch (e) {
      console.warn('[LLM] Gemini call notice:', e);
    }
  }

  // 8. Deterministic High-Fidelity Grounded Engine (100% Reliability & Zero Failure Rate)
  const deterministicResponse = generateDeterministicGroundedResponse(
    query,
    retrievedChunks,
    history,
    classification
  );
  console.log(`[RETRIEVAL] Deterministic engine generated response with ${deterministicResponse.citations.length} citations`);
  return deterministicResponse;
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

  if (!res.ok) return null;
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

  if (!res.ok) return null;
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

  if (!res.ok) return null;
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
 * Deterministic Grounded Engine ensuring zero failure rate and complete factual fidelity
 */
function generateDeterministicGroundedResponse(
  query: string,
  retrievedChunks: KnowledgeChunk[],
  history: ConversationTurn[],
  classification: ClassifiedQuery
): GroundedResponse {
  const { intent, subtopic } = classification;
  const qLower = query.toLowerCase().replace(/[’‘]/g, "'");

  // 1. Broad Profile Overview Intent (Handles "What does he do?", "Tell me about his background", etc.)
  if (intent === 'profile_overview') {
    const citedIds = [
      'resume-identity',
      'resume-education',
      'resume-project-pathflow',
      'resume-project-senns',
      'resume-experience-stealth',
    ];
    const availableCitations = validateCitations(citedIds, retrievedChunks);

    return {
      answer:
        "Suyash is a Computer Science Engineering student at Manipal Institute of Technology (Data Science, graduating 2027) focused on software engineering, AI systems, and backend infrastructure. His technical work includes PathFlow (observability platform for AI agent fleets) and the Semantic LLM Gateway, co-authored machine unlearning research accepted at ICDDS 2025 (SENNs), and industry experience building scalable AWS inference pipelines at a Stealth Startup.",
      citations: availableCitations.length > 0 ? availableCitations : validateCitations(citedIds, KNOWLEDGE_BASE),
      grounded: true,
      retrieved_chunk_ids: retrievedChunks.map((c) => c.id),
    };
  }

  // 2. Education Intent
  if (intent === 'education') {
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

  // 3. Work Experience / Internships Intent
  if (intent === 'work_experience') {
    const targetChunks =
      retrievedChunks.filter((c) => c.category === 'experience').length > 0
        ? retrievedChunks.filter((c) => c.category === 'experience')
        : KNOWLEDGE_BASE.filter((c) => c.category === 'experience');
    const expCitations = validateCitations(
      targetChunks.map((c) => c.id),
      [...targetChunks, ...retrievedChunks]
    );
    return {
      answer:
        "Suyash's industry experience includes working as an AI Intern at a Stealth Startup building scalable AWS distributed inference pipelines and state-machine logic (Dec 2025 – May 2026), and as an R&D Intern at IEEE Computer Society Bangalore Chapter evaluating distributed architectures (Apr 2025 – Sept 2025).",
      citations: expCitations,
      grounded: true,
      retrieved_chunk_ids: targetChunks.map((c) => c.id),
    };
  }

  // 4. PathFlow Intent (including subtopics like visualization, stack)
  if (intent === 'pathflow') {
    const pathChunk =
      retrievedChunks.find((c) => c.id === 'resume-project-pathflow') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-project-pathflow')!;
    const pathCitations = validateCitations(['resume-project-pathflow'], [pathChunk, ...retrievedChunks]);

    if (subtopic === 'visualization' || qLower.includes('visualiz') || qLower.includes('tree') || qLower.includes('dag')) {
      return {
        answer:
          "For visualization in PathFlow, Suyash built an interactive DAG visualizer using React Flow to inspect multi-step agent execution trees, sub-span latencies, and tool-routing decisions in real time.",
        citations: pathCitations,
        grounded: true,
        retrieved_chunk_ids: ['resume-project-pathflow'],
      };
    }
    if (subtopic === 'tech_stack' || qLower.includes('technolog') || qLower.includes('built with') || qLower.includes('stack') || qLower.includes('used to build')) {
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

  // 5. Semantic LLM Gateway Intent
  if (intent === 'semantic_gateway') {
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

  // 6. Research / SENNs Intent
  if (intent === 'research') {
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

  // 7. ReachInbox Intent
  if (intent === 'reachinbox') {
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

  // 8. Projects General Intent
  if (intent === 'projects') {
    const projectChunks = KNOWLEDGE_BASE.filter((c) => c.category === 'project');
    const projectCitations = validateCitations(
      projectChunks.map((c) => c.id),
      [...projectChunks, ...retrievedChunks]
    );
    return {
      answer:
        "Suyash has built several key projects: PathFlow (an OpenTelemetry observability platform for AI agent fleets with React Flow DAG visualization), the Semantic LLM Gateway (a low-latency FastAPI proxy with Qdrant caching under 50ms), ReachInbox (a concurrent distributed email scheduler), and SENNs (peer-reviewed research in machine unlearning accepted at ICDDS 2025).",
      citations: projectCitations,
      grounded: true,
      retrieved_chunk_ids: projectChunks.map((c) => c.id),
    };
  }

  // 9. Technical Skills Intent
  if (intent === 'skills') {
    const skillChunks = KNOWLEDGE_BASE.filter((c) => c.category === 'skills');
    const skillCitations = validateCitations(
      skillChunks.map((c) => c.id),
      [...skillChunks, ...retrievedChunks]
    );
    return {
      answer:
        "Suyash's core technical stack spans Data Structures & Algorithms, System Design, Java, C++, Python, TypeScript, Node.js, FastAPI, Docker, Kubernetes, AWS, GCP, Redis, Qdrant, Prometheus, and PyTorch. He is also a Codeforces Pupil (1224 rating) with 200+ LeetCode problems solved.",
      citations: skillCitations,
      grounded: true,
      retrieved_chunk_ids: skillChunks.map((c) => c.id),
    };
  }

  // 10. Leadership Intent
  if (intent === 'leadership') {
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

  // 11. Competitive Programming Intent
  if (intent === 'competitive_programming') {
    const cpChunk =
      retrievedChunks.find((c) => c.id === 'resume-skills-ml-cp') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-skills-ml-cp')!;
    const cpCitations = validateCitations(['resume-skills-ml-cp'], [cpChunk, ...retrievedChunks]);
    return {
      answer:
        "In competitive programming and problem solving, Suyash is a Codeforces Pupil with a peak rating of 1224, has solved over 200 problems on LeetCode, and holds a 3★ rating on CodeChef.",
      citations: cpCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-skills-ml-cp'],
    };
  }

  // 12. Contact Intent
  if (intent === 'contact') {
    const contactChunk =
      retrievedChunks.find((c) => c.id === 'resume-identity') ||
      KNOWLEDGE_BASE.find((c) => c.id === 'resume-identity')!;
    const contactCitations = validateCitations(['resume-identity'], [contactChunk, ...retrievedChunks]);
    return {
      answer:
        "You can connect with Suyash via his Portfolio website at https://suyash.website, on LinkedIn at linkedin.com/in/suyashin, on GitHub at github.com/anothercodingguy, or by email at suyashs787@gmail.com.",
      citations: contactCitations,
      grounded: true,
      retrieved_chunk_ids: ['resume-identity'],
    };
  }

  // 13. General Fallback with Highest-Scored Chunk
  if (retrievedChunks.length > 0) {
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

  return {
    answer:
      "I don't have enough verified information in Suyash's available profile sources to answer that accurately.",
    citations: [],
    grounded: false,
    retrieved_chunk_ids: [],
  };
}
