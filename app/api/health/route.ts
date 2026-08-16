import { NextResponse } from 'next/server';
import { KNOWLEDGE_BASE } from '@/lib/knowledge/chunks';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'suyash-digital-twin',
      version: '1.0.0',
      knowledge_chunks: KNOWLEDGE_BASE.length,
      providers: {
        groq: !!process.env.GROQ_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        livekit: !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
        qdrant: !!process.env.QDRANT_URL,
      },
      system: {
        node: process.version,
        uptime_seconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}
