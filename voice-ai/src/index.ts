import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { SpeechAnalyzer } from './services/SpeechAnalyzer';
import { FeedbackGenerator } from './services/FeedbackGenerator';
import { WebSocketManager } from './services/WebSocketManager';
import { SpeechFeedback } from '../../shared/schemas';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3003"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const speechAnalyzer = new SpeechAnalyzer();
const feedbackGenerator = new FeedbackGenerator();
const wsManager = new WebSocketManager(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    module: 'voice-ai',
    timestamp: new Date().toISOString()
  });
});

// Get transcript for a specific session
app.get('/transcript/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const transcript = await speechAnalyzer.getTranscript(sessionId);
    
    if (transcript) {
      res.json({ transcript });
    } else {
      res.status(404).json({ error: 'Transcript not found' });
    }
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({ error: 'Failed to get transcript' });
  }
});

// Get all transcripts
app.get('/transcripts', async (req, res) => {
  try {
    const transcripts = await speechAnalyzer.getAllTranscripts();
    res.json({ transcripts });
  } catch (error) {
    console.error('Get all transcripts error:', error);
    res.status(500).json({ error: 'Failed to get transcripts' });
  }
});

// Speech analysis endpoint
app.post('/analyze-speech', async (req, res) => {
  try {
    const { audioData, sessionId, duration } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Convert base64 data URL to buffer
    const base64String = audioData.split(';base64,').pop();
    if (!base64String) {
      return res.status(400).json({ error: 'Invalid audio data format' });
    }
    const audioBuffer = Buffer.from(base64String, 'base64');

    // Analyze speech
    const analysis = await speechAnalyzer.analyzeAudio(audioBuffer, sessionId, duration);
    
    // Generate feedback
    const feedback = await feedbackGenerator.generateFeedback(analysis);
    
    // Send real-time feedback via WebSocket
    wsManager.broadcastFeedback({
      type: 'speech_feedback',
      data: feedback,
      timestamp: Date.now()
    });

    res.json(feedback);
  } catch (error: any) {
    console.error('Speech analysis error:', error);
    if (error.status) { // This indicates an API error from OpenAI
      return res.status(error.status).json({ 
        error: `Failed to process speech. OpenAI API returned status ${error.status}.`,
        details: error.message 
      });
    }
    res.status(500).json({ error: 'An unexpected error occurred during speech analysis.' });
  }
});

// Real-time speech streaming endpoint
app.post('/stream-speech', async (req, res) => {
  try {
    const { audioChunk, sessionId, isFinal } = req.body;
    
    if (!audioChunk) {
      return res.status(400).json({ error: 'Audio chunk is required' });
    }

    // Process audio chunk
    const analysis = await speechAnalyzer.processChunk(audioChunk, sessionId, isFinal);
    
    if (analysis && isFinal) {
      // Generate feedback for complete utterance
      const feedback = await feedbackGenerator.generateFeedback(analysis);
      
      // Broadcast to connected clients
      wsManager.broadcastFeedback({
        type: 'speech_feedback',
        data: feedback,
        timestamp: Date.now()
      });
    }

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Stream processing error:', error);
    res.status(500).json({ error: 'Stream processing failed' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected to Voice AI:', socket.id);
  
  wsManager.addClient(socket);

  socket.on('start-session', (data) => {
    console.log('Starting speech session:', data);
    wsManager.startSession(socket.id, data);
  });

  socket.on('audio-chunk', async (data) => {
    try {
      const analysis = await speechAnalyzer.processChunk(
        data.audioChunk, 
        data.sessionId, 
        data.isFinal
      );
      
      if (analysis && data.isFinal) {
        const feedback = await feedbackGenerator.generateFeedback(analysis);
        socket.emit('speech-feedback', feedback);
      }
    } catch (error) {
      console.error('WebSocket audio processing error:', error);
      socket.emit('error', { message: 'Audio processing failed' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from Voice AI:', socket.id);
    wsManager.removeClient(socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🎤 Voice AI module running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Voice AI server closed');
    process.exit(0);
  });
}); 