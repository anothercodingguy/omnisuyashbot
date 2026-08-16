import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;
    const voice = body.voice || process.env.TTS_VOICE || 'alloy';

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text parameter is required for TTS.' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      console.log(`[TTS] Generating OpenAI speech for ${text.length} chars using voice '${voice}'`);
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.trim(),
          voice: voice,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[TTS] OpenAI TTS error:', response.status, errText);
        return NextResponse.json(
          { error: `TTS service returned error: ${response.statusText}`, available: false },
          { status: 502 }
        );
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(`[TTS] Speech generated successfully (${audioBuffer.byteLength} bytes)`);

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // If no OpenAI key, check for alternative or report unavailable
    console.warn('[TTS] No OpenAI API key configured for server-side TTS.');
    return NextResponse.json(
      {
        error: 'No server-side TTS provider API key configured.',
        available: false,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('[TTS] Internal route error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
