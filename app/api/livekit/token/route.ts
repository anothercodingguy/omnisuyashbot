import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomName = body.roomName || `suyash-digital-twin-${Math.random().toString(36).substring(2, 8)}`;
    const participantName = body.participantName || `visitor-${Math.random().toString(36).substring(2, 6)}`;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        token: null,
        url: livekitUrl || null,
        roomName,
        participantName,
        mode: 'text_fallback',
        warning: 'LIVEKIT_API_KEY and LIVEKIT_API_SECRET not set. Realtime voice agent requires LiveKit cloud credentials.',
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      ttl: '1h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: livekitUrl || 'wss://livekit.cloud',
      roomName,
      participantName,
      mode: 'livekit_webrtc',
    });
  } catch (error) {
    console.error('[LiveKit Token Error]', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
