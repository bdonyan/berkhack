import { OpenAI } from 'openai';
import { toFile } from 'openai/uploads';
import { SpeechFeedback } from '../../../shared/schemas';
import * as fs from 'fs';
import * as path from 'path';

export class SpeechAnalyzer {
  private openai: OpenAI;
  private sessionBuffers: Map<string, Buffer> = new Map();
  private transcriptsDir: string;
  private fillerWordPatterns = [
    /\b(um|uh|er|ah|hmm|huh)\b/gi,
    /\b(like|you know|i mean|basically|actually|literally)\b/gi,
    /\b(so|well|right|okay|yeah)\b/gi
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Create transcripts directory
    this.transcriptsDir = path.join(__dirname, '../../transcripts');
    if (!fs.existsSync(this.transcriptsDir)) {
      fs.mkdirSync(this.transcriptsDir, { recursive: true });
    }
  }

  async analyzeAudio(audioData: Buffer, sessionId?: string, duration?: number): Promise<SpeechFeedback> {
    if (!this.openai.apiKey) {
      console.warn("OpenAI API key not set. Returning mock feedback.");
      return this.getMockFeedback();
    }
    try {
      // Transcribe audio using OpenAI Whisper
      const transcript = await this.transcribeAudio(audioData);
      
      // Save transcript if sessionId is provided
      if (sessionId) {
        await this.saveTranscript(sessionId, transcript);
      }
      
      // Analyze speech characteristics using a single, holistic AI model call
      const analysis = await this.getHolisticAiAnalysis(transcript, {
        duration,
        wordsPerMinute: this.calculateWpm(transcript, duration),
        pauses: this.countPauses(transcript),
        fillerWords: this.detectFillerWords(transcript),
      });
      
      return analysis;
    } catch (error) {
      console.error('Speech analysis error:', error);
      // Re-throw the original error to preserve details like status code
      throw error;
    }
  }

  async processChunk(audioChunk: Buffer, sessionId: string, isFinal: boolean): Promise<SpeechFeedback | null> {
    try {
      // Add chunk to session buffer
      if (!this.sessionBuffers.has(sessionId)) {
        this.sessionBuffers.set(sessionId, Buffer.alloc(0));
      }
      
      const buffer = this.sessionBuffers.get(sessionId)!;
      this.sessionBuffers.set(sessionId, Buffer.concat([buffer, audioChunk]));

      // Only process if this is the final chunk or we have enough data
      if (!isFinal && buffer.length < 32000) { // 2 seconds at 16kHz
        return null;
      }

      // Get the complete audio buffer
      const completeAudio = this.sessionBuffers.get(sessionId)!;
      
      // Transcribe the audio
      const transcript = await this.transcribeAudio(completeAudio);
      
      // Save transcript if this is final
      if (isFinal) {
        await this.saveTranscript(sessionId, transcript);
        this.sessionBuffers.delete(sessionId);
      }
      
      // Analyze speech characteristics
      const analysis = await this.getHolisticAiAnalysis(transcript, {
        wordsPerMinute: this.calculateWpm(transcript),
        pauses: this.countPauses(transcript),
        fillerWords: this.detectFillerWords(transcript),
      });

      return analysis as any;
    } catch (error) {
      console.error('Chunk processing error:', error);
      return null;
    }
  }

  private async transcribeAudio(audioData: Buffer): Promise<string> {
    if (!this.openai.apiKey) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.");
    }
    
    try {
      console.log('Starting transcription with audio data size:', audioData.length);
      
      const file = await toFile(audioData, 'audio.webm', { type: 'audio/webm' });
      
      // Use OpenAI Whisper API with audio/webm format
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        response_format: 'text',
        language: 'en'
      });

      const transcript = response as string;
      console.log('Transcription successful:', transcript);
      
      // If transcript is empty or very short, it might indicate an issue
      if (!transcript || transcript.trim().length < 5) {
        console.warn('Transcription returned empty or very short result');
        return "This is a mock transcript for development purposes. The actual speech would be transcribed here.";
      }
      
      return transcript;
      
    } catch (error) {
      console.error('Transcription error:', error);
      
      // If transcription fails, return a placeholder instead of throwing
      // This prevents the entire analysis from failing
      console.log('Using fallback transcript due to transcription failure');
      return "This is a mock transcript for development purposes. The actual speech would be transcribed here.";
    }
  }

  private async saveTranscript(sessionId: string, transcript: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `session-${sessionId}-${timestamp}.txt`;
      const filepath = path.join(this.transcriptsDir, filename);
      
      const content = `Session ID: ${sessionId}
Timestamp: ${new Date().toISOString()}
Transcript:
${transcript}
`;
      
      fs.writeFileSync(filepath, content);
      console.log(`Transcript saved: ${filepath}`);
    } catch (error) {
      console.error('Failed to save transcript:', error);
    }
  }

  async getTranscript(sessionId: string): Promise<string | null> {
    try {
      const files = fs.readdirSync(this.transcriptsDir);
      const sessionFile = files.find(file => file.includes(`session-${sessionId}-`));
      
      if (sessionFile) {
        const filepath = path.join(this.transcriptsDir, sessionFile);
        const content = fs.readFileSync(filepath, 'utf-8');
        // Extract just the transcript part
        const transcriptMatch = content.match(/Transcript:\n([\s\S]*)/);
        return transcriptMatch ? transcriptMatch[1].trim() : null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get transcript:', error);
      return null;
    }
  }

  async getAllTranscripts(): Promise<Array<{sessionId: string, timestamp: string, transcript: string}>> {
    try {
      const files = fs.readdirSync(this.transcriptsDir);
      const transcripts = [];
      
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filepath = path.join(this.transcriptsDir, file);
          const content = fs.readFileSync(filepath, 'utf-8');
          
          const sessionMatch = content.match(/Session ID: (.+)/);
          const timestampMatch = content.match(/Timestamp: (.+)/);
          const transcriptMatch = content.match(/Transcript:\n([\s\S]*)/);
          
          if (sessionMatch && timestampMatch && transcriptMatch) {
            transcripts.push({
              sessionId: sessionMatch[1],
              timestamp: timestampMatch[1],
              transcript: transcriptMatch[1].trim()
            });
          }
        }
      }
      
      return transcripts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get all transcripts:', error);
      return [];
    }
  }

  private async getHolisticAiAnalysis(transcript: string, metrics: { 
    duration?: number,
    wordsPerMinute: number,
    pauses: number,
    fillerWords: { count: number, words: string[] }
  }): Promise<SpeechFeedback> {

    const prompt = `
      You are Eloquence.AI, a world-class public speaking coach. Your feedback is sharp, nuanced, and brutally honest but fair.
      Analyze the provided transcript and performance metrics. Return a single, valid JSON object with no markdown formatting.

      The JSON object must have this exact structure:
      {
        "scores": {
          "overall": <integer, 0-100, be extremely critical. 50 is mediocre. >85 is masterful. Profanity or incoherence should score <30.>,
          "pace": <integer, 0-100, based on WPM and pauses. Ideal WPM is 140-160.>,
          "clarity": <integer, 0-100, considering vocabulary, sentence structure, and repetition.>,
          "fillerWords": <integer, 0-100, penalizing traditional fillers and excessive word repetition.>,
          "tone": <integer, 0-100, for the effectiveness of the emotional tone.>
        },
        "toneEmotion": <string, a single word for the dominant emotion, e.g., 'confident', 'nervous', 'engaging'>,
        "feedback": {
          "positive": <array of strings, specific positive feedback.>,
          "improvements": <array of strings, direct, constructive areas for improvement.>,
          "suggestions": <array of strings, concrete next steps for the user.>
        }
      }

      DATA:
      - Transcript: "${transcript}"
      - Metrics:
        - Words per Minute: ${metrics.wordsPerMinute}
        - Pause Count: ${metrics.pauses}
        - Filler Words Detected: ${metrics.fillerWords.words.join(', ') || 'None'}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: "You are a brutally honest but fair public speaking coach providing feedback as a JSON object." },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const result = JSON.parse(this.cleanJsonString(response.choices[0].message.content || '{}'));

      // Construct the SpeechFeedback object from the AI's response
      return {
        timestamp: Date.now(),
        transcript,
        confidence: 0.95, // High confidence as the analysis is now AI-driven
        tone: {
          emotion: result.toneEmotion || 'engaging',
          score: result.scores?.tone || 50,
        },
        pace: {
          wordsPerMinute: metrics.wordsPerMinute,
          pauses: metrics.pauses,
          score: result.scores?.pace || 50,
          rhythm: 'N/A', // These can be deprecated or generated by AI if needed
          consistency: 0,
        },
        fillerWords: {
          count: metrics.fillerWords.count,
          words: metrics.fillerWords.words,
          score: result.scores?.fillerWords || 50,
          detailedAnalysis: { // This can be populated from the new feedback sections
            analysis: result.feedback?.improvements.join(' ') || '',
            impact: '',
            specificWords: metrics.fillerWords.words,
            recommendations: result.feedback?.suggestions || []
          }
        },
        clarity: {
          pronunciation: 0,
          volume: 0,
          articulation: 0,
          overall: result.scores?.clarity || 50,
          detailedAnalysis: { // This can be populated from the new feedback sections
            strengths: result.feedback?.positive || [],
            weaknesses: result.feedback?.improvements || [],
            articulation: '',
            vocabulary: ''
          }
        },
        feedback: result.feedback || { positive: [], improvements: [], suggestions: [] },
        overallScore: result.scores?.overall || 50
      };
    } catch (error) {
      console.error('Holistic AI analysis error:', error);
      // Fallback to mock feedback if AI analysis fails
      return this.getMockFeedback();
    }
  }

  private calculateWpm(transcript: string, duration?: number): number {
    const words = transcript.split(/\s+/).filter(word => word.length > 0).length;
    if (!duration || duration < 1) return 0;
    return Math.round((words / duration) * 60);
  }

  private countPauses(transcript: string): number {
    const pausePatterns = /[.,…?!]/g;
    const matches = transcript.match(pausePatterns);
    return matches ? matches.length : 0;
  }

  private detectFillerWords(transcript: string): { count: number; words: string[] } {
    const detectedWords: string[] = [];
    
    this.fillerWordPatterns.forEach(pattern => {
      const matches = transcript.match(pattern);
      if (matches) {
        detectedWords.push(...matches.map(w => w.toLowerCase()));
      }
    });

    const wordFrequencies = detectedWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      count: detectedWords.length,
      words: Object.keys(wordFrequencies),
    };
  }

  private cleanJsonString(input: string): string {
    return input.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private getMockFeedback(): SpeechFeedback {
    // Implementation of getMockFeedback method
    return {
      timestamp: Date.now(),
      transcript: "This is a mock transcript for development purposes. The actual speech would be transcribed here.",
      confidence: 0.85,
      tone: { emotion: 'confident', score: 75 },
      pace: {
        wordsPerMinute: 0,
        pauses: 0,
        score: 100,
        rhythm: 'consistent',
        consistency: 100
      },
      fillerWords: {
        count: 0,
        words: [],
        score: 100,
        detailedAnalysis: {
          analysis: "No analysis available.",
          impact: "N/A",
          specificWords: [],
          recommendations: []
        }
      },
      clarity: {
        pronunciation: 85,
        volume: 80,
        articulation: 100,
        overall: 85,
        detailedAnalysis: {
          strengths: [],
          weaknesses: [],
          articulation: "N/A",
          vocabulary: "N/A"
        }
      },
      feedback: {
        positive: [],
        improvements: [],
        suggestions: []
      },
      overallScore: 100
    };
  }
} 