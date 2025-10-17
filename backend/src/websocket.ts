import { WebSocketServer, WebSocket } from 'ws';
import { getTelemetryData } from './services/telemetry';

const clients: Set<WebSocket> = new Set();

export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    clients.add(ws);

    // Send initial telemetry data
    sendTelemetryToClient(ws);

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast telemetry updates every 10 seconds (faster for demo)
  setInterval(() => {
    broadcastTelemetry();
  }, 10000);
};

const sendTelemetryToClient = async (ws: WebSocket) => {
  try {
    const telemetry = await getTelemetryData();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'telemetry',
        data: telemetry,
      }));
    }
  } catch (error) {
    console.error('Error sending telemetry:', error);
  }
};

const broadcastTelemetry = async () => {
  try {
    const telemetry = await getTelemetryData();
    const message = JSON.stringify({
      type: 'telemetry',
      data: telemetry,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error('Error broadcasting telemetry:', error);
  }
};
