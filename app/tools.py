# app/tools.py
import os
import asyncio
import subprocess
import json
from typing import Dict, Any
import aiofiles
import tempfile
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class WhisperAdapter:
    """Simple wrapper: you can call a local whisperx CLI or a cloud ASR."""
    def __init__(self):
        pass

    async def transcribe(self, audio_path: str) -> str:
        # Example: call whisperx CLI synchronously (replace with async if available)
        # For hackathon keep it simple: call whisper CPP/python binding or whisperx
        # This block expects a CLI 'whisper' or 'whisperx' installed in the environment.
        cmd = ["whisper", audio_path, "--model", "small", "--task", "transcribe", "--language", "en"]
        proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        out, err = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(f"Whisper failed: {err.decode()}")
        # Parse transcript file or stdout depending on tool. For simplicity, assume whisper wrote a .txt
        txt_path = audio_path + ".txt"
        try:
            async with aiofiles.open(txt_path, "r") as f:
                text = await f.read()
            return text
        except:
            return out.decode()  # fallback

class SummarizerAdapter:
    """Summarize using an LLM via OpenAI API (or swap provider)."""
    def __init__(self):
        pass

    async def summarize_transcript(self, transcript: str, job_id: str) -> Dict[str, Any]:
        # Basic chunking example
        chunks = []
        chunk_size = 3000
        for i in range(0, len(transcript), chunk_size):
            chunks.append(transcript[i:i+chunk_size])

        # map step: summarize each chunk
        short_summaries = []
        async with httpx.AsyncClient() as client:
            for c in chunks:
                prompt = f"Summarize the following chunk in 2-3 sentences:\n\n{c}\n\nSummary:"
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",  # replace as needed
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 300
                    },
                    timeout=60
                )
                j = resp.json()
                s = j["choices"][0]["message"]["content"].strip()
                short_summaries.append(s)

        # reduce step: combine chunk summaries into a final summary + highlights
        joined = "\n\n".join(short_summaries)
        final_prompt = (
            "You are an assistant that composes a multi-length summary and highlights. "
            "Given the combined chunk summaries below, produce:\n1) Short summary (1-2 sentences)\n2) Long summary (4-6 sentences)\n3) 3 bullet highlights\n\nCombined summaries:\n" + joined
        )
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 800
                },
                timeout=60
            )
            final = resp.json()
            text = final["choices"][0]["message"]["content"].strip()

        # Naive parse (you can refine)
        return {
            "short": text.split("\n")[0],
            "long": "\n".join(text.split("\n")[1:4]),
            "highlights": [line.strip("- ").strip() for line in text.splitlines() if line.strip().startswith("-")][:3],
            "json": json.dumps({"raw": text, "job_id": job_id})
        }

class StorageAdapter:
    """S3 via MinIO or AWS. For dev we use local filesystem or MinIO."""
    def __init__(self):
        import boto3
        from botocore.client import Config
        self.s3_endpoint = os.getenv("S3_ENDPOINT", "http://minio:9000")
        self.s3_bucket = os.getenv("S3_BUCKET", "toolrouter")
        self.s3_key = os.getenv("S3_KEY", "minioadmin")
        self.s3_secret = os.getenv("S3_SECRET", "minioadmin")
        self.s3 = boto3.resource(
            "s3",
            endpoint_url=self.s3_endpoint,
            aws_access_key_id=self.s3_key,
            aws_secret_access_key=self.s3_secret,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
        # ensure bucket exists (dev)
        try:
            self.s3.create_bucket(Bucket=self.s3_bucket)
        except Exception:
            pass

    async def fetch_youtube_audio(self, youtube_url: str, job_id: str) -> str:
        # Use yt-dlp to fetch best audio. Save to /tmp/<job_id>.mp3
        import subprocess, tempfile, os
        tpath = f"/tmp/{job_id}.mp3"
        cmd = ["yt-dlp", "-x", "--audio-format", "mp3", "-o", tpath, youtube_url]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if proc.returncode != 0:
            raise RuntimeError(f"yt-dlp failed: {proc.stderr.decode()}")
        return tpath

    async def store_text(self, key: str, text: str):
        # store in S3
        obj = self.s3.Object(self.s3_bucket, key)
        obj.put(Body=text.encode("utf-8"))
