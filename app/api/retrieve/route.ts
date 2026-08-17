import { NextRequest, NextResponse } from 'next/server';
import { searchProfile } from '@/lib/knowledge/retriever';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query;
    const history = body.history || [];

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "query" string parameter' }, { status: 400 });
    }

    // Safety limit on query size
    if (query.length > 500) {
      return NextResponse.json({ error: 'Query exceeds maximum length of 500 characters' }, { status: 400 });
    }

    const { results, allMatches, queryUsed, classification } = searchProfile(query, history, 6);

    return NextResponse.json({
      query,
      queryUsed,
      intent: classification.intent,
      detectedEntity: classification.detectedEntity,
      total_matched: allMatches.length,
      top_k: results.length,
      results: results.map((r) => ({
        id: r.id,
        title: r.title,
        section: r.section,
        entity: r.entity,
        category: r.category,
        page: r.page,
        source: r.source,
        content: r.content,
        technologies: r.technologies,
      })),
    });
  } catch (error) {
    console.error('[Retrieve API Error]', error);
    return NextResponse.json({ error: 'Internal retrieval error' }, { status: 500 });
  }
}
