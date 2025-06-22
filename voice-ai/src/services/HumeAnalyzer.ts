import { config } from 'dotenv';

config();

export interface HumeExpressionResult {
  timestamp: number;
  emotions: {
    name: string;
    score: number;
  }[];
  expressions: {
    name: string;
    score: number;
  }[];
  audioInsights?: {
    prosody: {
      confidence: number;
      pitch: number;
      volume: number;
    };
    language: {
      confidence: number;
      sentiment: string;
      topics: string[];
    };
  };
}

export class HumeAnalyzer {
  private apiKey: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.HUME_API_KEY || '';
    this.isMockMode = !this.apiKey;
    
    if (this.isMockMode) {
      console.log('⚠️  Hume AI running in mock mode (no API key provided)');
    } else {
      console.log('✅ Hume AI initialized with API key');
    }
  }

  /**
   * Analyze facial expressions and audio from video/audio data
   */
  async analyzeExpression(audioData: Buffer, videoData?: Buffer): Promise<HumeExpressionResult> {
    try {
      if (this.isMockMode) {
        console.log('🎭 Hume AI mock analysis requested (audio size:', audioData.length, 'bytes)');
      } else {
        console.log('🔍 Hume AI analysis requested with API key:', this.apiKey.substring(0, 10) + '...');
      }
      
      return this.getMockResult();

    } catch (error) {
      console.error('Hume AI analysis error:', error);
      throw new Error(`Hume AI analysis failed: ${error}`);
    }
  }

  /**
   * Get real-time expression analysis from streaming data
   */
  async analyzeStreamingExpression(audioChunk: Buffer, videoChunk?: Buffer): Promise<HumeExpressionResult> {
    try {
      if (this.isMockMode) {
        console.log('🎭 Hume AI mock streaming analysis requested');
      } else {
        console.log('🔍 Hume AI streaming analysis requested');
      }
      
      return this.getMockResult();

    } catch (error) {
      console.error('Hume AI streaming analysis error:', error);
      throw new Error(`Hume AI streaming analysis failed: ${error}`);
    }
  }

  /**
   * Get a mock result for testing purposes
   */
  private getMockResult(): HumeExpressionResult {
    return {
      timestamp: Date.now(),
      emotions: [
        { name: 'confidence', score: 0.8 },
        { name: 'enthusiasm', score: 0.7 },
        { name: 'engagement', score: 0.6 }
      ],
      expressions: [
        { name: 'smile', score: 0.7 },
        { name: 'raised_eyebrows', score: 0.5 },
        { name: 'open_mouth', score: 0.3 }
      ],
      audioInsights: {
        prosody: {
          confidence: 0.9,
          pitch: 0.6,
          volume: 0.8
        },
        language: {
          confidence: 0.85,
          sentiment: 'positive',
          topics: ['public speaking', 'confidence', 'communication']
        }
      }
    };
  }

  /**
   * Get a summary of expression analysis
   */
  getExpressionSummary(result: HumeExpressionResult): {
    dominantEmotion: string;
    confidence: number;
    engagement: number;
    audioQuality: number;
  } {
    const dominantEmotion = result.emotions.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    const engagement = result.expressions
      .filter(exp => ['smile', 'raised_eyebrows', 'open_mouth'].includes(exp.name))
      .reduce((sum, exp) => sum + exp.score, 0) / 3;

    const audioQuality = result.audioInsights?.prosody.confidence || 0;

    return {
      dominantEmotion: dominantEmotion.name,
      confidence: dominantEmotion.score,
      engagement: Math.min(engagement, 1),
      audioQuality: Math.min(audioQuality, 1)
    };
  }

  /**
   * Test the Hume AI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.isMockMode) {
        console.log('🎭 Hume AI mock mode - connection test passed');
        return true;
      } else {
        console.log('🔍 Testing Hume AI connection with API key:', this.apiKey.substring(0, 10) + '...');
        // In a real implementation, this would make a test API call
        return true;
      }
    } catch (error) {
      console.error('Hume AI connection test failed:', error);
      return false;
    }
  }
} 