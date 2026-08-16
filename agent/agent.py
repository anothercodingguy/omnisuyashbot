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
from livekit.plugins import deepgram, openai, silero

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("suyash-voice-agent")

APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

SYSTEM_PROMPT = """
You are the AI digital twin of Suyash Singh. You speak to visitors, recruiters, and engineers about Suyash's engineering work, projects, research, technical stack, and background.

GROUNDING RULES:
1. You may only state factual claims supported by the search_profile tool.
2. If search_profile does not return information for a query (such as personal preferences, salary, favorite movies, family), politely state:
   "I don't have enough verified information in Suyash's profile sources to answer that accurately."
3. Keep answers concise, natural, and conversational for voice (1-3 sentences).
4. Always call search_profile before answering factual inquiries about Suyash.
"""

class SuyashAssistantFunctionContext(llm.FunctionContext):
    def __init__(self, room):
        super().__init__()
        self.room = room

    @llm.ai_callable(description="Search Suyash Singh's verified resume and portfolio knowledge base")
    async def search_profile(self, query: str) -> str:
        logger.info(f"Retrieving profile for: {query}")
        try:
            res = requests.post(
                f"{APP_URL}/api/retrieve",
                json={"query": query},
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                
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
                
                return json.dumps(results)
            return "No verified profile chunks found."
        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return "Error retrieving verified profile context."

async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    fnc_ctx = SuyashAssistantFunctionContext(ctx.room)

    # Initialize Voice Assistant pipeline
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(voice="alloy"),
        fnc_ctx=fnc_ctx,
        system_message=SYSTEM_PROMPT,
    )

    assistant.start(ctx.room)

    # Welcome message
    await assistant.say(
        "Hi! I’m Suyash’s AI digital twin. What would you like to know about his projects, research, or experience?",
        allow_interruptions=True,
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
