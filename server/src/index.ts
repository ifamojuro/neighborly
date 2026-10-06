import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import issuesRouter from './routes/issues.js';
import eventsRouter from './routes/events.js';
import personaRouter from './routes/persona.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/issues', issuesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/persona', personaRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize WebSockets
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Neighborly Server] API & WebSocket server running on http://localhost:${PORT}`);
});
