import { describe, it, expect } from 'vitest';
import { GET as healthGET } from '../app/api/health/route';
import { POST as retrievePOST } from '../app/api/retrieve/route';
import { POST as chatPOST } from '../app/api/chat/route';
import { POST as tokenPOST } from '../app/api/livekit/token/route';
import { NextRequest } from 'next/server';

function createMockRequest(url: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Routes Verification', () => {
  it('GET /api/health returns status ok and chunk count', async () => {
    const res = await healthGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('suyash-digital-twin');
    expect(data.knowledge_chunks).toBeGreaterThanOrEqual(12);
  });

  it('POST /api/retrieve returns structured chunks', async () => {
    const req = createMockRequest('http://localhost:3000/api/retrieve', {
      query: 'What is PathFlow?',
    });
    const res = await retrievePOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0].id).toBe('resume-project-pathflow');
  });

  it('POST /api/chat returns grounded answer with validated citations', async () => {
    const req = createMockRequest('http://localhost:3000/api/chat', {
      message: 'What is the Semantic LLM Gateway?',
    });
    const res = await chatPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.grounded).toBe(true);
    expect(data.citations.length).toBeGreaterThan(0);
    expect(data.citations[0].source_id).toBe('resume-project-semantic-llm');
  });

  it('POST /api/livekit/token returns token or graceful fallback mode', async () => {
    const req = createMockRequest('http://localhost:3000/api/livekit/token', {
      roomName: 'test-room',
      participantName: 'test-user',
    });
    const res = await tokenPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.roomName).toBe('test-room');
    expect(data.participantName).toBe('test-user');
    expect(['livekit_webrtc', 'text_fallback']).toContain(data.mode);
  });

  it('POST /api/tts validates input and returns response', async () => {
    const { POST: ttsPOST } = await import('../app/api/tts/route');
    const emptyReq = createMockRequest('http://localhost:3000/api/tts', { text: '' });
    const emptyRes = await ttsPOST(emptyReq);
    expect(emptyRes.status).toBe(400);

    const validReq = createMockRequest('http://localhost:3000/api/tts', {
      text: 'PathFlow is an observability platform for AI agents.',
    });
    const res = await ttsPOST(validReq);
    expect([200, 502, 503]).toContain(res.status);
  }, 15000);
});
