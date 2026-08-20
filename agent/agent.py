import asyncio
import json
import logging
import os
import requests
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, elevenlabs, openai, silero

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("suyash-voice-agent")

APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

SYSTEM_PROMPT = """
You are the AI digital twin of Suyash Singh. You speak directly as Suyash in the first person ("I", "me", "my projects", "my background", "my research", "my education") to visitors, recruiters, and engineers about your engineering work, projects, research, technical stack, and background.

CONVERSATIONAL BEHAVIOR & RULES:
1. Speak naturally like a smart, passionate, articulate engineer chatting with a colleague or recruiter. Never sound robotic or like a resume reader.
2. When the user says casual conversational greetings, small talk, acknowledgements, or farewells (such as "hello", "hi", "hey", "how are you", "who are you", "thanks", "cool", "bye"):
   - Respond naturally, warmly, and concisely in 1 sentence.
   - For greetings: "Hey! Great to meet you. Feel free to ask about my projects like PathFlow, research, or engineering background."
   - For "how are you doing": "Doing great, thanks for asking! Just hacking on some AI systems. How are you doing?"
   - For "who are you": "I’m Suyash’s AI digital twin! You can ask me about my projects, engineering work, research, and technical background."
   - For thanks / cool / nice: "Glad that helped! Let me know if you want to explore anything else."
   - For farewells: "See you! Have a great day."
   - Do NOT call search_profile for pure conversational messages or greetings.
3. For questions about your work, focus, or projects ("what are you working on", "what are you building", "tell me about yourself"):
   - Always call the search_profile tool to ground your response.
   - Speak in the first person concisely (1-3 sentences), highlighting active systems (PathFlow, Semantic LLM Gateway, machine unlearning research).
4. If search_profile does not return information for an unverified personal question (e.g. favorite football club, salary, personal trivia):
   - State: "I don't have verified information about that, so I don't want to guess. Ask me anything about my work, projects, or background."
"""

class SuyashAssistantFunctionContext(llm.FunctionContext):
    def __init__(self, room):
        super().__init__()
        self.room = room

    @llm.ai_callable(description="Search Suyash Singh's verified resume and portfolio knowledge base")
    async def search_profile(self, query: str) -> str:
        logger.info(f"[RETRIEVAL] Searching verified profile for query: {query}")
        try:
            res = await asyncio.to_thread(
                requests.post,
                f"{APP_URL}/api/retrieve",
                json={"query": query},
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                logger.info(f"[RETRIEVAL] {len(results)} chunks retrieved")
                
                # Publish citation metadata to the LiveKit room data channel
                citations = [
                    {
                        "source_id": r["id"],
                        "title": r["title"],
                        "section": r["section"],
                        "entity": r["entity"],
                        "page": r["page"],
                        "source": r["source"],
                        "snippet": r["content"]
                    }
                    for r in results[:2]
                ]
                
                payload = json.dumps({
                    "type": "transcript_and_citation",
                    "query": query,
                    "citations": citations
                })
                
                await self.room.local_participant.publish_data(payload.encode("utf-8"))
                logger.info("[CITATION] Published citation metadata over data channel")
                
                return json.dumps(results)
            logger.warn(f"[RETRIEVAL] Non-200 status code: {res.status_code}")
            return "No verified profile chunks found."
        except Exception as e:
            logger.error(f"[RETRIEVAL] Retrieval error: {e}")
            return "Error retrieving verified profile context."

async def entrypoint(ctx: JobContext):
    logger.info(f"[VOICE] Agent connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    fnc_ctx = SuyashAssistantFunctionContext(ctx.room)

    # Determine STT Provider
    stt_provider = None
    if os.getenv("DEEPGRAM_API_KEY"):
        logger.info("[STT] Initializing Deepgram STT")
        stt_provider = deepgram.STT()
    elif os.getenv("OPENAI_API_KEY"):
        logger.info("[STT] Initializing OpenAI Whisper STT")
        stt_provider = openai.STT()
    else:
        logger.warn("[STT] No dedicated STT key found, attempting default STT")
        stt_provider = deepgram.STT()

    # Determine LLM Provider (Groq -> OpenAI)
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        logger.info("[LLM] Initializing Groq LLM (llama-3.3-70b-versatile via Groq API)")
        llm_provider = openai.LLM(
            base_url="https://api.groq.com/openai/v1",
            api_key=groq_api_key,
            model="llama-3.3-70b-versatile",
        )
    else:
        logger.info("[LLM] Initializing OpenAI gpt-4o-mini LLM")
        llm_provider = openai.LLM(model="gpt-4o-mini")

    # Determine TTS Provider (ElevenLabs Chris -> OpenAI TTS)
    eleven_key = os.getenv("ELEVENLABS_API_KEY") or os.getenv("XI_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "iP95p4xoKVk53GoZ742B")
    
    if eleven_key:
        logger.info(f"[TTS] Initializing ElevenLabs TTS with Chris voice ({voice_id})")
        tts_provider = elevenlabs.TTS(
            voice=elevenlabs.Voice(
                id=voice_id,
                name="Chris",
                category="premade"
            ),
            model="eleven_turbo_v2_5"
        )
    elif os.getenv("OPENAI_API_KEY"):
        tts_voice = os.getenv("TTS_VOICE", "alloy")
        logger.info(f"[TTS] Initializing OpenAI TTS (model=tts-1, voice={tts_voice})")
        tts_provider = openai.TTS(model="tts-1", voice=tts_voice)
    else:
        logger.info(f"[TTS] Defaulting to OpenAI TTS voice engine")
        tts_provider = openai.TTS(model="tts-1", voice="alloy")

    # Initialize Voice Assistant pipeline
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=stt_provider,
        llm=llm_provider,
        tts=tts_provider,
        fnc_ctx=fnc_ctx,
        system_message=SYSTEM_PROMPT,
    )

    @assistant.on("user_started_speaking")
    def on_user_speaking():
        logger.info("[VOICE] User started speaking (interruption detected)")

    @assistant.on("agent_started_speaking")
    def on_agent_speaking():
        logger.info("[VOICE] Agent started speaking (TTS audio publishing)")

    @assistant.on("agent_stopped_speaking")
    def on_agent_stopped():
        logger.info("[VOICE] Agent finished speaking")

    assistant.start(ctx.room)
    logger.info("[AUDIO] Assistant started in room, audio tracks published and listening")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
