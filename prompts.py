MAP_PROMPT = """You are a helpful summarizer. Summarize the following chunk in 2-3 sentences, focusing on key points and actionable insights.

Chunk:
{chunk}
"""

REDUCE_PROMPT = """You are an assistant that composes a multi-length summary and highlights. Given the below chunk summaries, produce:
1) Short summary: 1-2 sentences.
2) Long summary: 4-6 sentences.
3) 3 bullet highlights (concise).
4) Suggested TL;DR (one-liner).

Combined chunk summaries:
{summaries}
"""
