import { Router } from 'express';
import { summarizeVideo } from './services/summarizer';
import { getTelemetryData } from './services/telemetry';

const router = Router();

// Middleware to record telemetry
const recordRequest = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Record telemetry event (you can implement this in telemetry service)
    console.log(`Request: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// YouTube summarization endpoint
router.post('/api/summarize', recordRequest, async (req, res) => {
  try {
    const { url, length = 'medium' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const summary = await summarizeVideo(url, length);
    res.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize video' });
  }
});

// Telemetry endpoint
router.get('/api/telemetry', recordRequest, async (req, res) => {
  try {
    const telemetry = await getTelemetryData();
    res.json(telemetry);
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to fetch telemetry data' });
  }
});

export const setupRoutes = (app: any) => {
  app.use(router);
};
