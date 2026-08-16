import { describe, it, expect } from 'vitest';
import { searchProfile } from '../lib/knowledge/retriever';
import { KNOWLEDGE_BASE } from '../lib/knowledge/chunks';

describe('Knowledge Base Structure & Integrity', () => {
  it('contains all required atomic chunks from the resume', () => {
    expect(KNOWLEDGE_BASE.length).toBeGreaterThanOrEqual(12);

    const chunkIds = KNOWLEDGE_BASE.map((c) => c.id);
    expect(chunkIds).toContain('resume-identity');
    expect(chunkIds).toContain('resume-education');
    expect(chunkIds).toContain('resume-skills-fundamentals');
    expect(chunkIds).toContain('resume-skills-backend-cloud');
    expect(chunkIds).toContain('resume-skills-ml-cp');
    expect(chunkIds).toContain('resume-project-pathflow');
    expect(chunkIds).toContain('resume-project-semantic-llm');
    expect(chunkIds).toContain('resume-project-reachinbox');
    expect(chunkIds).toContain('resume-project-senns');
    expect(chunkIds).toContain('resume-experience-stealth');
    expect(chunkIds).toContain('resume-experience-ieee');
    expect(chunkIds).toContain('resume-leadership-mbosc');
  });

  it('ensures all chunks have valid source and page numbers', () => {
    for (const chunk of KNOWLEDGE_BASE) {
      expect(chunk.source).toBe('Suyash Singh Resume');
      expect(chunk.source_type).toBe('resume');
      expect(chunk.page).toBe(1);
      expect(chunk.content.length).toBeGreaterThan(20);
    }
  });
});

describe('Retriever Engine Accuracy', () => {
  it('retrieves PathFlow for PathFlow questions', () => {
    const { results } = searchProfile('What is PathFlow?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('resume-project-pathflow');
  });

  it('retrieves SENNs research for unlearning queries', () => {
    const { results } = searchProfile('Tell me about SENNs and machine unlearning research');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('resume-project-senns');
  });

  it('retrieves Education for college and GPA questions', () => {
    const { results } = searchProfile('What college does Suyash attend and what is his CGPA?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('resume-education');
  });

  it('retrieves Stealth Startup and IEEE for internship inquiries', () => {
    const { results } = searchProfile('Tell me about his internships and work experience');
    const ids = results.map((r) => r.id);
    expect(ids).toContain('resume-experience-stealth');
  });

  it('retrieves Semantic LLM Gateway for proxy questions', () => {
    const { results } = searchProfile('What is the Semantic LLM Gateway with Qdrant caching?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('resume-project-semantic-llm');
  });

  it('resolves contextual follow-up pronouns correctly', () => {
    const history = [
      {
        role: 'user' as const,
        content: 'Tell me about PathFlow',
        citedChunkIds: ['resume-project-pathflow'],
      },
      {
        role: 'assistant' as const,
        content: 'PathFlow is an observability platform for AI agents.',
        citedChunkIds: ['resume-project-pathflow'],
      },
    ];

    const { results } = searchProfile('What did he use for visualization in it?', history);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('resume-project-pathflow');
  });
});
