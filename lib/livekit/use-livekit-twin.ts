'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Participant,
} from 'livekit-client';
import { VoiceState } from '@/components/AudioOrb';
import { ChatMessage } from '@/components/LiveTranscript';
import { CitationItem } from '@/lib/knowledge/grounding';

interface UseLiveKitTwinReturn {
  state: VoiceState;
  messages: ChatMessage[];
  interimTranscript: string;
  audioLevel: number;
  isMuted: boolean;
  activeCitation: CitationItem | null;
  isDrawerOpen: boolean;
  errorMessage: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  sendMessage: (text: string) => Promise<void>;
  openCitation: (c: CitationItem) => void;
  closeCitation: () => void;
}

export function useLiveKitTwin(): UseLiveKitTwinReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioElementsRef = useRef<HTMLMediaElement[]>([]);

  // Initialize or resume the Web Audio Context for audio analysis
  const getAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Audio Level Analyser Loop for microphone and remote LiveKit audio stream
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      getAudioContext().then((audioCtx) => {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        localAnalyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkLevel = () => {
          const activeAnalyser = remoteAnalyserRef.current || localAnalyserRef.current;
          if (activeAnalyser) {
            activeAnalyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 128);
            setAudioLevel(normalized);
          }

          animFrameRef.current = requestAnimationFrame(checkLevel);
        };

        checkLevel();
      });
    } catch (e) {
      console.warn('[Audio Analysis Error]', e);
    }
  };

  const startRemoteAudioAnalysis = (remoteStream: MediaStream) => {
    try {
      getAudioContext().then((audioCtx) => {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(remoteStream);
        source.connect(analyser);
        remoteAnalyserRef.current = analyser;
      });
    } catch (e) {
      console.warn('[Remote Audio Analysis Error]', e);
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    remoteAnalyserRef.current = null;
    localAnalyserRef.current = null;
    setAudioLevel(0);
  };

  // Text Inquiry Handler (Text fallback that shares retrieval & grounded LLM pipeline without browser TTS)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimTranscript('');

      try {
        const historyPayload = messages.slice(-8).map((m) => ({
          role: m.sender,
          content: m.text,
          citedChunkIds: m.citations?.map((c) => c.source_id),
        }));

        console.log(`[QUERY] Sending text inquiry to grounded RAG pipeline: "${text.trim()}"`);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: historyPayload,
          }),
        });

        const data = await res.json();
        console.log(`[LLM] Grounded text response received with ${data.citations?.length || 0} citations`);

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || "I'm having trouble retrieving verified profile data.",
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('[Chat Error]', err);
        setErrorMessage('Failed to receive grounded answer.');
      }
    },
    [messages]
  );

  // Connects Call: Connects to LiveKit Room, publishes microphone, subscribes to agent audio track
  const startCall = async () => {
    try {
      setState('connecting');
      setErrorMessage(null);

      // Unlock AudioContext for browser autoplay policy
      await getAudioContext();

      // 1. Request microphone permission
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        startAudioAnalysis(stream);
      } catch (micErr: any) {
        console.error('[Microphone Permission Error]', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setErrorMessage(
            'Microphone access is required for voice conversation. Please allow microphone permissions in your browser and try again.'
          );
        } else {
          setErrorMessage(
            'Could not access microphone (' + (micErr.message || 'audio device error') + ').'
          );
        }
        setState('error');
        return;
      }

      // 2. Request LiveKit token from backend
      let tokenData: any = {};
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          tokenData = await res.json().catch(() => ({}));
        }
      } catch (tokenErr) {
        console.warn('[LiveKit Token Fetch Error]', tokenErr);
      }

      if (!tokenData.token || !tokenData.url) {
        console.warn('[LiveKit] No LiveKit server credentials returned from token endpoint.');
        setErrorMessage('Voice agent is currently offline. You can still ask questions via text below.');
        setState('idle');
        return;
      }

      // 3. Connect to LiveKit Room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Connected, () => {
        console.log('[LIVEKIT] Connected to LiveKit Room:', room.name);
        setState('listening');
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('[LIVEKIT] Disconnected from LiveKit Room');
        setState('ended');
        stopAudioAnalysis();
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log('[LIVEKIT] Reconnecting to room...');
        setState('reconnecting');
      });

      room.on(RoomEvent.Reconnected, () => {
        console.log('[LIVEKIT] Reconnected to room');
        setState('listening');
      });

      // 4. Remote Track Subscription (Plays the real LiveKit Agent TTS Audio Track)
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          console.log(`[AUDIO] Remote track subscribed from participant ${participant.identity} (kind: ${track.kind})`);
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            audioElement.id = `remote-audio-${participant.identity}`;
            audioElement.autoplay = true;
            audioElementsRef.current.push(audioElement);
            document.body.appendChild(audioElement);

            if (track.mediaStreamTrack) {
              const remoteStream = new MediaStream([track.mediaStreamTrack]);
              startRemoteAudioAnalysis(remoteStream);
            }
          }
        }
      );

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        console.log('[AUDIO] Remote track unsubscribed');
        track.detach().forEach((el) => el.remove());
      });

      // 5. Active Speaker Events (Drives speaking and listening state from real audio activity)
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const isAgentSpeaking = speakers.some((p) => p !== room.localParticipant);
        if (isAgentSpeaking) {
          setState('speaking');
        } else if (state === 'speaking') {
          setState('listening');
        }
      });

      // 6. Data Channel Transcripts & Citations published by LiveKit Agent
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const str = new TextDecoder().decode(payload);
          const parsed = JSON.parse(str);
          if (parsed.type === 'transcript_and_citation') {
            console.log('[DATA] Received transcript and citation payload from LiveKit Agent');
            setMessages((prev) => [
              ...prev,
              {
                id: `livekit-${Date.now()}`,
                sender: 'assistant',
                text: parsed.answer || parsed.query,
                citations: parsed.citations,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        } catch (e) {
          console.warn('[LiveKit Data Decode Error]', e);
        }
      });

      // 7. Connect Room and publish microphone track
      await room.connect(tokenData.url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;

      console.log('[LIVEKIT] Microphone published to room, listening for LiveKit Agent...');
    } catch (err: any) {
      console.error('[Start Call Error]', err);
      setErrorMessage('Could not connect to LiveKit voice agent. You can ask questions via text below.');
      setState('error');
      stopAudioAnalysis();
    }
  };

  const endCall = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    audioElementsRef.current.forEach((el) => el.remove());
    audioElementsRef.current = [];

    stopAudioAnalysis();
    setState('idle');
    setInterimTranscript('');
  };

  const toggleMute = () => {
    if (roomRef.current?.localParticipant) {
      const nextMuted = !isMuted;
      roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } else if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const openCitation = (c: CitationItem) => {
    setActiveCitation(c);
    setIsDrawerOpen(true);
  };

  const closeCitation = () => {
    setIsDrawerOpen(false);
  };

  return {
    state,
    messages,
    interimTranscript,
    audioLevel,
    isMuted,
    activeCitation,
    isDrawerOpen,
    errorMessage,
    startCall,
    endCall,
    toggleMute,
    sendMessage,
    openCitation,
    closeCitation,
  };
}
