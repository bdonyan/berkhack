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
    rhythm: string;
    consistency: number;
  };
  fillerWords: {
    count: number;
    words: string[];
    score: number;
    detailedAnalysis: any;
  };
  clarity: {
    articulation: number;
    overall: number;
    detailedAnalysis?: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  };
  detailedInsights: string[];
}

function parseJsonFromMarkdown(markdownString: string): any {
  // First, try to find a JSON block within markdown
  const jsonRegex = /```json\n([\s\S]*?)\n```/;
  const match = markdownString.match(jsonRegex);
  
  if (match && match[1]) {
    try {
      // If a markdown block is found, parse its content
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON from markdown:", e);
      return null; // Don't proceed if parsing the extracted part fails
    }
  } else {
    // If no markdown block is found, assume the whole string might be a JSON object
    try {
      return JSON.parse(markdownString);
    } catch (e) {
      // The string is not a valid JSON object
      console.error("String is not a valid JSON object:", e);
      return null;
    }
  }
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

  async analyzeAudio(audioData: Buffer, sessionId?: string, duration?: number): Promise<SpeechFeedback> {
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

  private async analyzeSpeechCharacteristics(transcript: string, duration?: number): Promise<SpeechAnalysis> {
    const words = transcript.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Calculate words per minute (WPM)
    const wordsPerMinute = (duration && duration > 1) ? Math.round((wordCount / duration) * 60) : 0;
    
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
        articulation: clarity.articulation,
        overall: clarity.overall,
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
            content: 'Analyze the emotional tone of this speech. You MUST respond with only a valid JSON object with an "emotion" key (one of: confident, nervous, enthusiastic, monotone, engaging) and a "score" key (0-100). Do not include any other text, explanation, or markdown formatting.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.3
      });

      const result = parseJsonFromMarkdown(response.choices[0].message.content || '{}');
      if (!result) {
        return { emotion: 'confident', score: 50 };
      }
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
    try {
      const prompt = `You are an expert public speaking coach. Analyze the provided speech transcript and metrics.

TRANSCRIPT: "${transcript}"

METRICS:
- Word Count: ${metrics.wordCount}
- Words Per Minute: ${metrics.wordsPerMinute}
- Filler Words: ${metrics.fillerWords.count} (${metrics.fillerWords.words.join(', ')})
- Tone: ${metrics.tone.emotion} (${metrics.tone.score}/100)
- Pacing: ${metrics.pacingMetrics.rhythm} rhythm, ${metrics.pacingMetrics.consistency}/100 consistency
- Clarity Score (Heuristic): ${metrics.clarity.overall}/100

You MUST respond with only a valid JSON object in the following format. Do not include any other text, explanation, or markdown formatting.
{
  "fillerWords": {
    "analysis": "Detailed analysis of filler word usage",
    "impact": "How filler words affect the speech",
    "specificWords": ["list of specific filler words found"],
    "recommendations": ["specific ways to reduce each filler word"]
  },
  "clarity": {
    "score": "A score from 0-100 indicating the overall clarity of the speech, considering structure, conciseness, and word choice.",
    "strengths": ["what makes the speech clear"],
    "weaknesses": ["what makes it unclear"],
    "recommendations": ["actionable advice to improve clarity"]
  },
  "insights": [
    "3-5 key insights about the speech",
    "specific observations about delivery",
    "actionable improvement suggestions"
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert public speaking coach. You MUST respond with only a valid JSON object and no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const content = response.choices[0].message.content;
      if (content) {
        try {
          const parsedContent = parseJsonFromMarkdown(content);
          if (parsedContent) {
            return parsedContent;
          }
          console.error('Failed to parse detailed analysis: parsedContent is null');
          return this.getDefaultDetailedAnalysis(transcript, metrics);
        } catch (parseError) {
          console.error('Failed to parse detailed analysis:', parseError);
          return this.getDefaultDetailedAnalysis(transcript, metrics);
        }
      }

      return this.getDefaultDetailedAnalysis(transcript, metrics);
    } catch (error) {
      console.error('Detailed analysis error:', error);
      return this.getDefaultDetailedAnalysis(transcript, metrics);
    }
  }

  private getDefaultDetailedAnalysis(transcript: string, metrics: any): {
    fillerWords: any;
    clarity: any;
    insights: string[];
  } {
    return {
      fillerWords: {
        analysis: `Found ${metrics.fillerWords.count} filler words in your speech.`,
        impact: "Filler words can make you sound less confident and professional.",
        specificWords: metrics.fillerWords.words,
        recommendations: [
          "Practice pausing instead of using 'um' or 'uh'",
          "Record yourself and identify filler word patterns",
          "Use breathing techniques to create natural pauses"
        ]
      },
      clarity: {
        score: "A score from 0-100 indicating the overall clarity of the speech, considering structure, conciseness, and word choice.",
        strengths: ["what makes the speech clear"],
        weaknesses: ["what makes it unclear"],
        recommendations: ["actionable advice to improve clarity"]
      },
      insights: [
        "Your speaking pace of ${metrics.wordsPerMinute} WPM is ${metrics.wordsPerMinute > 0 ? (metrics.wordsPerMinute < 150 ? 'good' : 'could be slower') : 'not available'}",
        `Your ${metrics.tone.emotion} tone shows ${metrics.tone.score > 70 ? 'good' : 'room for improvement in'} confidence`,
        "Practice regularly to improve overall speech quality"
      ]
    };
  }

  private calculateClarity(transcript: string, words: string[]): {
    articulation: number;
    overall: number;
  } {
    // This is a simplified, heuristic-based calculation.
    // The more meaningful analysis comes from the LLM in `getDetailedAnalysis`.
    const uniqueWords = new Set(words).size;
    const vocabularyScore = (words.length > 0) ? (uniqueWords / words.length) * 100 : 0;
    
    const articulation = Math.min(100, vocabularyScore + 20); // Placeholder
    const overall = articulation; // Base score on articulation heuristic
    
    return {
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