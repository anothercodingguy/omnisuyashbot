'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent, Track, RemoteParticipant, DataPacket_Kind } from 'livekit-client';
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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDirectModeRef = useRef<boolean>(true);

  // Audio Level Analyser Loop
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (e) {
      console.warn('[Audio Analysis Error]', e);
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
    setAudioLevel(0);
  };

  // Speaks assistant answer via Web Audio Synthesis with dynamic Orb animation
  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.98;

      // Select a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Daniel') || (v.lang === 'en-US' && !v.name.includes('Zira'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferred) utterance.voice = preferred;

      setState('speaking');

      // Create synthetic audio level fluctuations during speech
      const speechInterval = setInterval(() => {
        setAudioLevel(0.3 + Math.random() * 0.5);
      }, 100);

      utterance.onend = () => {
        clearInterval(speechInterval);
        setAudioLevel(0);
        setState((current) => (current === 'speaking' ? 'listening' : current));
        resolve();
      };

      utterance.onerror = () => {
        clearInterval(speechInterval);
        setAudioLevel(0);
        setState((current) => (current === 'speaking' ? 'listening' : current));
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Sends a message to the unified RAG backend
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
      setState('thinking');

      try {
        const historyPayload = messages.slice(-8).map((m) => ({
          role: m.sender,
          content: m.text,
          citedChunkIds: m.citations?.map((c) => c.source_id),
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: historyPayload,
          }),
        });

        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || "I'm having trouble retrieving verified profile data.",
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Speak the answer if user is in an active voice session
        if (state !== 'idle' && state !== 'ended') {
          await speakText(assistantMsg.text);
        } else {
          setState('idle');
        }
      } catch (err: any) {
        console.error('[Chat Error]', err);
        setErrorMessage('Failed to receive grounded answer.');
        setState('error');
      }
    },
    [messages, state, speakText]
  );

  // Setup Web Speech Recognition for Real-time Voice Detection
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
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
        setInterimTranscript(interim);
      }

      if (finalStr && finalStr.trim().length > 0) {
        setInterimTranscript('');
        recognition.stop();
        sendMessage(finalStr.trim()).then(() => {
          try {
            recognition.start();
          } catch (e) {}
        });
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        console.warn('[Speech Recognition Error]', e.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we are still connected and not speaking
      if (roomRef.current || isDirectModeRef.current) {
        try {
          if (state === 'listening') {
            recognition.start();
          }
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
  }, [sendMessage, state]);

  // Connects Call (LiveKit WebRTC or Direct Voice Twin)
  const startCall = async () => {
    try {
      setState('connecting');
      setErrorMessage(null);

      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startAudioAnalysis(stream);

      // 2. Request token from backend
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      // If LiveKit credentials exist, connect to LiveKit Cloud Room
      if (data.token && data.url) {
        isDirectModeRef.current = false;
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        room.on(RoomEvent.Connected, () => {
          setState('listening');
        });

        room.on(RoomEvent.Disconnected, () => {
          setState('ended');
          stopAudioAnalysis();
        });

        // Listen for real-time citations & transcripts over LiveKit Data Channel
        room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
          try {
            const str = new TextDecoder().decode(payload);
            const parsed = JSON.parse(str);
            if (parsed.type === 'transcript_and_citation') {
              setMessages((prev) => [
                ...prev,
                {
                  id: `livekit-${Date.now()}`,
                  sender: 'assistant',
                  text: parsed.answer,
                  citations: parsed.citations,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          } catch (e) {
            console.warn('[LiveKit Data Decode Error]', e);
          }
        });

        await room.connect(data.url, data.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        roomRef.current = room;
      } else {
        // High-Fidelity Direct Voice Mode
        isDirectModeRef.current = true;
        initSpeechRecognition();
        try {
          recognitionRef.current?.start();
        } catch (e) {}

        // Friendly initial greeting
        const greeting =
          "Hi, I’m Suyash’s AI digital twin. Feel free to ask about his projects like PathFlow, research at ICDDS 2025, technical skills, or internships.";

        const welcomeMsg: ChatMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: greeting,
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
        await speakText(greeting);
      }
    } catch (err: any) {
      console.error('[Start Call Error]', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Microphone access is required for voice conversation. Please allow microphone permissions and try again.'
        );
      } else {
        setErrorMessage('Failed to connect to the voice agent. Please try again.');
      }
      setState('error');
      stopAudioAnalysis();
    }
  };

  const endCall = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopAudioAnalysis();
    setState('idle');
    setInterimTranscript('');
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
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
