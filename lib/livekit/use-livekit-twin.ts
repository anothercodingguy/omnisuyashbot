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
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioElementsRef = useRef<HTMLMediaElement[]>([]);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize or resume the Web Audio Context for audio analysis & playback
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

  // Stops currently playing TTS audio (for interruption handling)
  const interruptPlayback = useCallback(() => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
  }, []);

  // Server-Side Realtime TTS Audio Playback
  const playServerTTS = useCallback(
    async (text: string): Promise<void> => {
      interruptPlayback();

      try {
        console.log('[TTS] Requesting server-side TTS audio for answer...');
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (res.ok && res.headers.get('Content-Type')?.includes('audio')) {
          console.log('[TTS] Received binary audio stream from server, decoding...');
          const arrayBuffer = await res.arrayBuffer();
          const audioCtx = await getAudioContext();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          remoteAnalyserRef.current = analyser;

          currentAudioSourceRef.current = source;
          setState('speaking');

          return new Promise<void>((resolve) => {
            source.onended = () => {
              console.log('[AUDIO] TTS playback completed');
              remoteAnalyserRef.current = null;
              currentAudioSourceRef.current = null;
              setState('listening');
              resolve();
            };

            source.start(0);
            console.log('[AUDIO] TTS audio playback started through Web Audio API');
          });
        } else {
          // If no cloud TTS key is available, remain in listening state with answer in transcript
          console.log('[TTS] Server TTS key not configured, answer delivered in transcript.');
          setState('listening');
        }
      } catch (err) {
        console.warn('[TTS] Server TTS notice:', err);
        setState('listening');
      }
    },
    [getAudioContext, interruptPlayback]
  );

  // Core RAG & LLM Message Handler
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      interruptPlayback();

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimTranscript('');
      setState('thinking');

      try {
        const historyPayload = messages.slice(-8).map((m) => ({
          role: m.sender,
          content: m.text,
          citedChunkIds: m.citations?.map((c) => c.source_id),
        }));

        console.log(`[QUERY] Sending inquiry to grounded RAG pipeline: "${text.trim()}"`);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: historyPayload,
          }),
        });

        const data = await res.json();
        console.log(`[LLM] Grounded response received with ${data.citations?.length || 0} citations`);

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || "I'm having trouble retrieving verified profile data.",
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Attempt server-side TTS audio playback if call is active
        if (state !== 'idle' && state !== 'ended') {
          await playServerTTS(assistantMsg.text);
        } else {
          setState('idle');
        }
      } catch (err: any) {
        console.error('[Chat Error]', err);
        setErrorMessage('Failed to receive grounded answer.');
        setState('listening');
      }
    },
    [messages, state, playServerTTS, interruptPlayback]
  );

  // Setup Continuous Speech Recognition for Local Microphone
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[STT] Local Speech Recognition started listening...');
      setState('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }

      if (interim) {
        if (state === 'speaking') {
          interruptPlayback();
          setState('listening');
        }
        setInterimTranscript(interim);
      }

      if (finalStr && finalStr.trim().length > 0) {
        console.log(`[STT] Recognized user utterance: "${finalStr.trim()}"`);
        setInterimTranscript('');
        sendMessage(finalStr.trim());
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        console.warn('[STT] Speech recognition notice:', e.error);
      }
    };

    recognition.onend = () => {
      if (state !== 'idle' && state !== 'ended' && state !== 'error') {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
  }, [sendMessage, state, interruptPlayback]);

  // Connects Call: Connects LiveKit Room + Continuous Speech Recognition
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

      // 2. Start Realtime Voice Recognition
      initSpeechRecognition();
      try {
        recognitionRef.current?.start();
      } catch (e) {}

      // Initial Welcome Message
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Hi! I’m Suyash’s AI digital twin. Speak into your microphone or type below to ask about PathFlow, my research at ICDDS 2025, technical skills, or internships.",
        citations: [
          {
            source_id: 'resume-identity',
            title: 'Suyash Singh — Identity & Verified Links',
            section: 'Header / Identity',
            entity: 'Suyash Singh',
            page: 1,
            source: 'Suyash Singh Resume',
            source_type: 'resume',
            snippet:
              'Suyash Singh is a Computer Science Engineering (Data Science) undergraduate at Manipal Institute of Technology (graduating 2027) with a strong foundation in full-stack engineering, distributed systems, AI agent observability, and machine learning pipelines.',
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => (prev.length === 0 ? [welcomeMsg] : prev));

      // 3. Request LiveKit token from backend
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

      // 4. Connect to LiveKit Room if credentials available
      if (tokenData.token && tokenData.url) {
        try {
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
          });

          // Remote Track Subscription (Plays the LiveKit Agent TTS Audio Track if agent is in room)
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

          // Active Speaker Events
          room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
            const isAgentSpeaking = speakers.some((p) => p !== room.localParticipant);
            if (isAgentSpeaking) {
              setState('speaking');
            } else if (state === 'speaking') {
              setState('listening');
            }
          });

          // Data Channel Transcripts & Citations published by LiveKit Agent
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

          await room.connect(tokenData.url, tokenData.token);
          await room.localParticipant.setMicrophoneEnabled(true);
          roomRef.current = room;
        } catch (livekitErr) {
          console.warn('[LiveKit Room Connection Notice]', livekitErr);
        }
      }

      setState('listening');
    } catch (err: any) {
      console.error('[Start Call Error]', err);
      setErrorMessage('Could not initialize voice session. Please try again.');
      setState('error');
      stopAudioAnalysis();
    }
  };

  const endCall = () => {
    interruptPlayback();
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
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
