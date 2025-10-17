import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { initializeDatabase } from './database';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
setupRoutes(app);

// WebSocket setup
setupWebSocket(wss);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
