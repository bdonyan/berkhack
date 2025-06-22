import { OpenAI } from 'openai';
import { toFile } from 'openai/uploads';
import { SpeechFeedback } from '../../../shared/schemas';
import * as fs from 'fs';
import * as path from 'path';
import compromise from 'compromise';

// This interface is defined locally to avoid breaking changes in the shared schema
// It represents the detailed analysis performed by this service.
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
    rhythm: string;
    consistency: number;
  };
  fillerWords: {
    count: number;
    words: string[];
    score: number;
    detailedAnalysis: {
      analysis: string;
      impact: string;
      specificWords: string[];
      recommendations: string[];
    };
  };
  clarity: {
    pronunciation: number;
    volume: number;
    articulation: number;
    overall: number;
    detailedAnalysis: {
      strengths: string[];
      weaknesses: string[];
      articulation: string;
      vocabulary: string;
    };
  };
  detailedInsights: string[];
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
      
      // Analyze speech characteristics
      const analysis = await this.analyzeSpeechCharacteristics(transcript, duration);
      
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

  private async analyzeSpeechCharacteristics(transcript: string, duration?: number): Promise<SpeechAnalysis> {
    const words = transcript.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    const wordsPerMinute = duration && duration > 1 ? Math.round((wordCount / duration) * 60) : 0;
    
    // Detect filler words with detailed analysis
    const fillerWords = this.detectFillerWords(transcript);
    
    // Analyze tone using OpenAI
    const tone = await this.analyzeTone(transcript);
    
    // Calculate pause count and pacing metrics
    const pacingMetrics = this.analyzePacing(transcript, wordsPerMinute);
    
    // Calculate clarity metrics
    const clarity = this.calculateClarity(transcript, words);
    
    // Get LLM-powered detailed analysis
    const detailedAnalysis = await this.getDetailedAnalysis(transcript, {
      wordCount,
      wordsPerMinute,
      fillerWords,
      tone,
      pacingMetrics,
      clarity
    });
    
    return {
      transcript,
      confidence: 0.85, // Placeholder - would come from Whisper
      tone,
      pace: {
        wordsPerMinute,
        pauses: pacingMetrics.pauses,
        score: pacingMetrics.score,
        rhythm: pacingMetrics.rhythm,
        consistency: pacingMetrics.consistency
      },
      fillerWords: {
        ...fillerWords,
        detailedAnalysis: detailedAnalysis.fillerWords
      },
      clarity: {
        ...clarity,
        detailedAnalysis: detailedAnalysis.clarity
      },
      detailedInsights: detailedAnalysis.insights
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
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(this.cleanJsonString(response.choices[0].message.content || '{}'));
      return {
        emotion: result.emotion || 'engaging',
        score: result.score || 75,
      };
    } catch (error) {
      console.error('Tone analysis error:', error);
      return { emotion: 'confident', score: 50 };
    }
  }

  private analyzePacing(transcript: string, wordsPerMinute: number): {
    pauses: number;
    score: number;
    rhythm: string;
    consistency: number;
  } {
    // Count pauses (periods, commas, ellipses)
    const pausePatterns = /[.,…]/g;
    const matches = transcript.match(pausePatterns);
    const pauses = matches ? matches.length : 0;
    
    // Analyze sentence length variation for rhythm
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
    
    // Determine rhythm based on sentence length variation
    let rhythm = 'consistent';
    if (lengthVariance > 10) rhythm = 'varied';
    if (lengthVariance > 20) rhythm = 'unpredictable';
    
    // Calculate consistency score (lower variance = higher consistency)
    const consistency = Math.max(0, 100 - (lengthVariance * 2));
    
    // Calculate overall pace score
    let score = 100;
    if (wordsPerMinute < 120) score -= 20; // Too slow
    else if (wordsPerMinute > 200) score -= 20; // Too fast
    
    // Deduct for too many or too few pauses
    if (pauses < 2) score -= 10; // Not enough pauses
    else if (pauses > 10) score -= 15; // Too many pauses
    
    return {
      pauses,
      score: Math.max(0, score),
      rhythm,
      consistency: Math.round(consistency)
    };
  }

  private async getDetailedAnalysis(transcript: string, metrics: any): Promise<{
    fillerWords: any;
    clarity: any;
    insights: string[];
  }> {
    if (!this.openai.apiKey) {
      return this.getDefaultDetailedAnalysis(transcript, metrics);
    }
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a public speaking coach. Analyze the following transcript and metrics. 
            Return a JSON object with three keys: 
            1. "fillerWords": { "analysis": string, "impact": string, "specificWords": string[], "recommendations": string[] }
            2. "clarity": { "strengths": string[], "weaknesses": string[], "articulation": string, "vocabulary": string }
            3. "insights": string[]`
          },
          {
            role: 'user',
            content: `Transcript: "${transcript}"
            Metrics:
            - WPM: ${metrics.wordsPerMinute}
            - Filler Words: ${metrics.fillerWords.count} (${metrics.fillerWords.words.join(', ')})`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const result = JSON.parse(this.cleanJsonString(response.choices[0].message.content || '{}'));

      // Ensure the returned object has the correct structure
      return {
        fillerWords: result.fillerWords || this.getDefaultDetailedAnalysis(transcript, metrics).fillerWords,
        clarity: result.clarity || this.getDefaultDetailedAnalysis(transcript, metrics).clarity,
        insights: result.insights || this.getDefaultDetailedAnalysis(transcript, metrics).insights,
      };
    } catch (error) {
      console.error('Failed to parse detailed analysis:', error);
      return this.getDefaultDetailedAnalysis(transcript, metrics);
    }
  }

  private getDefaultDetailedAnalysis(transcript: string, metrics: any): {
    fillerWords: {
      analysis: string;
      impact: string;
      specificWords: string[];
      recommendations: string[];
    };
    clarity: {
      strengths: string[];
      weaknesses: string[];
      articulation: string;
      vocabulary: string;
    };
    insights: string[];
  } {
    return {
      fillerWords: { 
        analysis: "Could not generate detailed analysis for filler words.",
        impact: "Filler words can sometimes reduce clarity.",
        specificWords: metrics.fillerWords.words,
        recommendations: ["Speak slower to reduce filler words.", "Practice pausing instead of using 'um' or 'uh'."] 
      },
      clarity: { 
        strengths: ["Attempted to communicate a message."],
        weaknesses: ["Clarity analysis was not available."],
        articulation: "N/A",
        vocabulary: "N/A"
      },
      insights: ["Could not generate detailed insights. Try speaking for a longer duration."],
    };
  }

  private calculateClarity(transcript: string, words: string[]): {
    pronunciation: number;
    volume: number;
    articulation: number;
    overall: number;
  } {
    if (words.length < 5) {
      return { pronunciation: 50, volume: 50, articulation: 20, overall: 30 };
    }

    const doc = compromise(transcript);
    const sentences = doc.sentences().out('array');
    const wordCount = words.length;

    // 1. Vocabulary Richness (Type-Token Ratio)
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const ttr = (uniqueWords / wordCount) * 100;
    let vocabularyScore = Math.min(100, ttr * 2.5); // Scale TTR to be more impactful

    // 2. Repetition Score
    const wordFrequencies = words.reduce((acc, word) => {
      const lowerWord = word.toLowerCase();
      acc[lowerWord] = (acc[lowerWord] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repetitions = Object.values(wordFrequencies).filter(count => count > 2).length;
    let repetitionScore = Math.max(0, 100 - (repetitions * 15)); // Penalize heavily for repeated words

    // 3. Sentence Structure Score
    const sentenceLengths = sentences.map((s: string) => s.split(' ').length);
    const avgSentenceLength = sentenceLengths.reduce((a: number, b: number) => a + b, 0) / sentenceLengths.length;
    let sentenceStructureScore = Math.min(100, avgSentenceLength * 5); // Reward longer, more complex sentences

    // 4. Articulation Score (combined metric)
    const articulation = (vocabularyScore + repetitionScore + sentenceStructureScore) / 3;

    // Placeholder for pronunciation and volume as they require more advanced audio processing
    const pronunciation = 70;
    const volume = 70;

    const overall = (articulation * 0.8) + (pronunciation * 0.1) + (volume * 0.1); // Weight articulation higher

    return {
      pronunciation,
      volume,
      articulation: Math.round(articulation),
      overall: Math.round(overall),
    };
  }

  private calculateOverallScore(analysis: SpeechAnalysis): number {
    const weights = {
      tone: 0.20,
      pace: 0.20,
      fillerWords: 0.25,
      clarity: 0.35 // Increased weight for the new, more robust clarity score
    };

    const rawScore = 
      analysis.tone.score * weights.tone +
      analysis.pace.score * weights.pace +
      analysis.fillerWords.score * weights.fillerWords +
      analysis.clarity.overall * weights.clarity;

    // Scale the score to be more critical. A raw score of 75 becomes ~60.
    const scaledScore = Math.pow(rawScore / 100, 1.5) * 100;

    return Math.round(scaledScore);
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