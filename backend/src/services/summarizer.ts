import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';
import { getDb } from '../database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SummaryResult {
  videoTitle: string;
  summary: string;
  length: string;
  transcript: string;
}

export const summarizeVideo = async (url: string, length: string = 'medium'): Promise<SummaryResult> => {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptItems.map(item => item.text).join(' ');

    // Get video title (simplified - in production, use YouTube API)
    const videoTitle = `YouTube Video ${videoId}`;

    // Generate summary based on length
    const summaryPrompt = getSummaryPrompt(length);
    const summary = await generateSummary(transcript, summaryPrompt);

    // Save to database
    const db = getDb();
    await db.run(
      'INSERT INTO summaries (video_url, video_title, summary, summary_length) VALUES (?, ?, ?, ?)',
      [url, videoTitle, summary, length]
    );

    return {
      videoTitle,
      summary,
      length,
      transcript,
    };
  } catch (error) {
    console.error('Error summarizing video:', error);
    throw error;
  }
};

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const getSummaryPrompt = (length: string): string => {
  const prompts = {
    short: 'Summarize this YouTube video transcript in 2-3 sentences, focusing on the main points.',
    medium: 'Provide a concise summary of this YouTube video transcript in 4-6 sentences, covering key topics and conclusions.',
    long: 'Create a detailed summary of this YouTube video transcript, including main arguments, examples, and key takeaways.',
  };

  return prompts[length as keyof typeof prompts] || prompts.medium;
};

const generateSummary = async (transcript: string, prompt: string): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes YouTube video transcripts.',
      },
      {
        role: 'user',
        content: `${prompt}\n\nTranscript: ${transcript}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || 'Summary generation failed';
};
