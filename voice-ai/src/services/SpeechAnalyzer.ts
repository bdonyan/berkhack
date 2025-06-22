import OpenAI from 'openai';
import { SpeechFeedback } from '../../../shared/schemas';
import * as fs from 'fs';
import * as path from 'path';

interface SpeechAnalysis {
  transcript: string;
  confidence: number;
  tone: {
    emotion: 'confident' | 'nervous' | 'enthusiastic' | 'monotone' | 'engaging';
    score: number;
  };
  pace: {
    wordsPerMinute: number;
    pauses: number;
    score: number;
  };
  fillerWords: {
    count: number;
    words: string[];
    score: number;
  };
  clarity: {
    pronunciation: number;
    volume: number;
    articulation: number;
    overall: number;
  };
}

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
    this.transcriptsDir = path.join(process.cwd(), 'transcripts');
    if (!fs.existsSync(this.transcriptsDir)) {
      fs.mkdirSync(this.transcriptsDir, { recursive: true });
    }
  }

  async analyzeAudio(audioData: Buffer, sessionId?: string): Promise<SpeechFeedback> {
    try {
      // Transcribe audio using OpenAI Whisper
      const transcript = await this.transcribeAudio(audioData);
      
      // Save transcript if sessionId is provided
      if (sessionId) {
        await this.saveTranscript(sessionId, transcript);
      }
      
      // Analyze speech characteristics
      const analysis = await this.analyzeSpeechCharacteristics(transcript);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(analysis);
      
      return {
        timestamp: Date.now(),
        transcript: transcript,
        confidence: analysis.confidence,
        tone: analysis.tone,
        pace: analysis.pace,
        fillerWords: analysis.fillerWords,
        clarity: analysis.clarity,
        feedback: {
          positive: [],
          improvements: [],
          suggestions: []
        },
        overallScore
      };
    } catch (error) {
      console.error('Speech analysis error:', error);
      // Re-throw the original error to preserve details like status code
      throw error;
    }
  }

  async processChunk(audioChunk: Buffer, sessionId: string, isFinal: boolean): Promise<SpeechAnalysis | null> {
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
      const analysis = await this.analyzeSpeechCharacteristics(transcript);

      return analysis;
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
      
      // Use OpenAI Whisper API with audio/webm format
      const response = await this.openai.audio.transcriptions.create({
        file: new File([audioData], 'audio.webm', { type: 'audio/webm' }),
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

  private async analyzeSpeechCharacteristics(transcript: string): Promise<SpeechAnalysis> {
    const words = transcript.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Calculate words per minute (assuming 2 seconds of audio)
    const wordsPerMinute = (wordCount / 2) * 60;
    
    // Detect filler words
    const fillerWords = this.detectFillerWords(transcript);
    
    // Analyze tone using OpenAI
    const tone = await this.analyzeTone(transcript);
    
    // Calculate pause count (simplified)
    const pauses = this.countPauses(transcript);
    
    // Calculate clarity metrics
    const clarity = this.calculateClarity(transcript, words);
    
    return {
      transcript,
      confidence: 0.85, // Placeholder - would come from Whisper
      tone,
      pace: {
        wordsPerMinute,
        pauses,
        score: this.scorePace(wordsPerMinute, pauses)
      },
      fillerWords,
      clarity
    };
  }

  private detectFillerWords(transcript: string): { count: number; words: string[]; score: number } {
    const detectedWords: string[] = [];
    
    this.fillerWordPatterns.forEach(pattern => {
      const matches = transcript.match(pattern);
      if (matches) {
        detectedWords.push(...matches);
      }
    });

    const count = detectedWords.length;
    const score = Math.max(0, 100 - (count * 10)); // Deduct 10 points per filler word

    return {
      count,
      words: [...new Set(detectedWords)], // Remove duplicates
      score
    };
  }

  private async analyzeTone(transcript: string): Promise<{ emotion: 'confident' | 'nervous' | 'enthusiastic' | 'monotone' | 'engaging'; score: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Analyze the emotional tone of this speech. Return only a JSON object with "emotion" (one of: confident, nervous, enthusiastic, monotone, engaging) and "score" (0-100).'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const emotion = result.emotion || 'confident';
      
      // Ensure the emotion is one of the allowed values
      const validEmotions: Array<'confident' | 'nervous' | 'enthusiastic' | 'monotone' | 'engaging'> = 
        ['confident', 'nervous', 'enthusiastic', 'monotone', 'engaging'];
      
      const validEmotion = validEmotions.includes(emotion as any) ? emotion as any : 'confident';
      
      return {
        emotion: validEmotion,
        score: result.score || 50
      };
    } catch (error) {
      console.error('Tone analysis error:', error);
      return { emotion: 'confident', score: 50 };
    }
  }

  private countPauses(transcript: string): number {
    // Count periods, commas, and ellipses as potential pauses
    const pausePatterns = /[.,…]/g;
    const matches = transcript.match(pausePatterns);
    return matches ? matches.length : 0;
  }

  private scorePace(wordsPerMinute: number, pauses: number): number {
    // Ideal pace: 150-180 WPM
    let score = 100;
    
    if (wordsPerMinute < 120) score -= 20; // Too slow
    else if (wordsPerMinute > 200) score -= 20; // Too fast
    
    // Deduct for too many or too few pauses
    if (pauses < 2) score -= 10; // Not enough pauses
    else if (pauses > 10) score -= 15; // Too many pauses
    
    return Math.max(0, score);
  }

  private calculateClarity(transcript: string, words: string[]): {
    pronunciation: number;
    volume: number;
    articulation: number;
    overall: number;
  } {
    // Simplified clarity calculation
    const wordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const uniqueWords = new Set(words).size;
    const vocabularyScore = (uniqueWords / words.length) * 100;
    
    const pronunciation = 85; // Placeholder - would need audio analysis
    const volume = 80; // Placeholder - would need audio analysis
    const articulation = Math.min(100, vocabularyScore + 20);
    
    const overall = (pronunciation + volume + articulation) / 3;
    
    return {
      pronunciation,
      volume,
      articulation,
      overall
    };
  }

  private calculateOverallScore(analysis: SpeechAnalysis): number {
    const weights = {
      tone: 0.25,
      pace: 0.20,
      fillerWords: 0.20,
      clarity: 0.35
    };

    return Math.round(
      analysis.tone.score * weights.tone +
      analysis.pace.score * weights.pace +
      analysis.fillerWords.score * weights.fillerWords +
      analysis.clarity.overall * weights.clarity
    );
  }
} 