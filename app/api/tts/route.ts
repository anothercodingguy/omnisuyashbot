import { NextRequest, NextResponse } from 'next/server';

// Splits long text into natural sentence/clause chunks for TTS generation
function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLen) {
        // Break long sentence by comma or word
        const words = trimmed.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxLen) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = '';
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;
    const voice = body.voice || process.env.TTS_VOICE || 'alloy';

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text parameter is required for TTS.' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. OpenAI TTS Provider (if API key is present)
    if (openaiKey) {
      try {
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

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          console.log(`[TTS] OpenAI speech generated (${audioBuffer.byteLength} bytes)`);

          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.byteLength.toString(),
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
        console.warn('[TTS] OpenAI returned non-200, falling back to server neural TTS');
      } catch (e) {
        console.warn('[TTS] OpenAI TTS error, falling back to server neural TTS:', e);
      }
    }

    // 2. High-Fidelity Server-Side Neural TTS Stream (Zero external key required)
    console.log(`[TTS] Generating server-side audio stream for ${text.length} chars`);
    const chunks = splitTextIntoChunks(text.trim());

    const audioBuffers: ArrayBuffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (res.ok) {
        const buf = await res.arrayBuffer();
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to synthesize audio stream' }, { status: 502 });
    }

    // Concatenate all binary MP3 buffers
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.byteLength, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of audioBuffers) {
      merged.set(new Uint8Array(b), offset);
      offset += b.byteLength;
    }

    console.log(`[TTS] Successfully synthesized concatenated audio stream (${totalLength} bytes)`);

    return new NextResponse(merged.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': totalLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[TTS] Internal route error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
