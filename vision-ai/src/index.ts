import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { VisionAnalyzer } from './services/VisionAnalyzer';
import { GestureRecognizer } from './services/GestureRecognizer';
import { WebSocketManager } from './services/WebSocketManager';
import { VisualFeedback } from '../../shared/schemas';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3003"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const visionAnalyzer = new VisionAnalyzer();
const gestureRecognizer = new GestureRecognizer();
const wsManager = new WebSocketManager(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    module: 'vision-ai',
    timestamp: new Date().toISOString()
  });
});

// Frame analysis endpoint
app.post('/analyze-frame', async (req, res) => {
  try {
    const { imageData, sessionId } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Analyze facial expressions and body language
    const feedback = await visionAnalyzer.analyzeFrame(imageData);
    
    // Recognize gestures
    const gestures = gestureRecognizer.detectGestures(imageData);
    feedback.gestures.detected = gestures;

    // Send real-time feedback via WebSocket
    wsManager.broadcastVisualFeedback(feedback);

    res.json(feedback);
  } catch (error) {
    console.error('Frame analysis error:', error);
    res.status(500).json({ error: 'Frame analysis failed' });
  }
});

// Real-time video stream endpoint
app.post('/stream-video', async (req, res) => {
  try {
    const { frameData, sessionId, isKeyFrame } = req.body;
    
    if (!frameData) {
      return res.status(400).json({ error: 'Frame data is required' });
    }

    // Process frame (only analyze key frames for performance)
    if (isKeyFrame) {
      const feedback = await visionAnalyzer.analyzeFrame(frameData);
      const gestures = gestureRecognizer.detectGestures(frameData);
      feedback.gestures.detected = gestures;

      // Broadcast to connected clients
      wsManager.broadcastVisualFeedback(feedback);

      res.json({ success: true, feedback });
    } else {
      res.json({ success: true, skipped: true });
    }
  } catch (error) {
    console.error('Video stream processing error:', error);
    res.status(500).json({ error: 'Video stream processing failed' });
  }
});

// WebSocket connection logic is now managed by WebSocketManager
// No need for a separate io.on('connection', ...) block here

// Start server
server.listen(PORT, () => {
  console.log(`📹 Vision AI module running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Vision AI server closed');
    process.exit(0);
  });
}); 