# app/main.py
import os
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from pydantic import BaseModel
import httpx
import uuid
import logging

# ToolAdapter stubs
from .tools import WhisperAdapter, SummarizerAdapter, StorageAdapter

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")  # set in env
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

app = FastAPI()
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)

whisper = WhisperAdapter()         # transcription
summarizer = SummarizerAdapter()   # LLM summarizer
storage = StorageAdapter()         # S3/MinIO adapter

class TelegramUpdate(BaseModel):
    update_id: int
    message: dict | None = None
    # Accept other fields as needed

@app.post("/webhook/telegram")
async def telegram_webhook(update: TelegramUpdate, background_tasks: BackgroundTasks):
    msg = update.message
    if not msg:
        return {"ok": True}
    chat_id = msg["chat"]["id"]
    text = msg.get("text", "")
    # If user pastes a YouTube URL, trigger summarization
    if "youtube.com" in text or "youtu.be" in text or text.strip().startswith("/summarize"):
        # Extract URL robustly (omitted for brevity — simple split)
        youtube_url = text.strip().split()[-1]
        job_id = str(uuid.uuid4())
        # ack quickly
        await send_telegram_message(chat_id, f"Queued summarization job `{job_id}` — starting transcription...")
        # run background pipeline
        background_tasks.add_task(run_summarize_pipeline, chat_id, youtube_url, job_id)
        return {"ok": True}
    # fallback echo
    await send_telegram_message(chat_id, "Send a YouTube link or use /summarize <url>.")
    return {"ok": True}

async def run_summarize_pipeline(chat_id: int, youtube_url: str, job_id: str):
    try:
        # 1) get captions or audio -> audio_path
        await send_telegram_message(chat_id, f"[{job_id}] Fetching captions/audio...")
        audio_path = await storage.fetch_youtube_audio(youtube_url, job_id)

        # 2) ASR -> transcript text
        await send_telegram_message(chat_id, f"[{job_id}] Transcribing (Whisper)...")
        transcript = await whisper.transcribe(audio_path)

        # store transcript
        transcript_key = f"transcripts/{job_id}.txt"
        await storage.store_text(transcript_key, transcript)

        # 3) Summarize (map-reduce / chunk)
        await send_telegram_message(chat_id, f"[{job_id}] Summarizing...")
        out = await summarizer.summarize_transcript(transcript, job_id=job_id)

        # 4) Save outputs and send to user
        await storage.store_text(f"summaries/{job_id}.json", out["json"])
        payload_text = f"Summary (short):\n{out['short']}\n\nHighlights:\n" + "\n".join([f"- {h}" for h in out["highlights"]])
        await send_telegram_message(chat_id, payload_text)
    except Exception as e:
        logger.exception("pipeline failed")
        await send_telegram_message(chat_id, f"Job failed: {e}")

async def send_telegram_message(chat_id: int, text: str):
    async with httpx.AsyncClient() as client:
        await client.post(f"{TELEGRAM_API}/sendMessage", json={"chat_id": chat_id, "text": text})
