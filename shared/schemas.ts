// Shared schemas for Eloquence.AI modules
// These define the data structures for communication between Voice AI, Vision AI, and Game UI

export interface SpeechFeedback {
  timestamp: number;
  transcript: string;
  confidence: number;
  tone: {
    emotion: 'confident' | 'nervous' | 'enthusiastic' | 'monotone' | 'engaging';
    score: number; // 0-100
  };
  pace: {
    wordsPerMinute: number;
    pauses: number; // count of pauses
    score: number; // 0-100
    rhythm: string; // 'consistent' | 'varied' | 'unpredictable'
    consistency: number; // 0-100
  };
  fillerWords: {
    count: number;
    words: string[]; // e.g., ["um", "uh", "like", "you know"]
    score: number; // 0-100
    detailedAnalysis?: {
      analysis: string;
      impact: string;
      specificWords: string[];
      recommendations: string[];
    }
  };
  clarity: {
    pronunciation: number; // 0-100
    volume: number; // 0-100
    articulation: number; // 0-100
    overall: number; // 0-100
    detailedAnalysis?: {
      strengths: string[];
      weaknesses: string[];
      articulation: string;
      vocabulary: string;
    }
  };
  feedback: {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  };
  detailedInsights?: string[]; // LLM-generated insights
  overallScore: number; // 0-100
}

export interface VisualFeedback {
  timestamp: number;
  eyeContact: {
    percentage: number; // 0-100
    duration: number; // seconds
    score: number; // 0-100
  };
  facialExpression: {
    emotion: 'confident' | 'nervous' | 'engaged' | 'distracted' | 'neutral';
    confidence: number; // 0-100
    score: number; // 0-100
  };
  posture: {
    stance: 'good' | 'slouched' | 'leaning' | 'rigid';
    score: number; // 0-100
  };
  gestures: {
    detected: string[]; // e.g., ["pointing", "open palms", "crossed arms"]
    appropriateness: number; // 0-100
    frequency: number; // gestures per minute
    score: number; // 0-100
  };
  bodyLanguage: {
    openness: number; // 0-100
    energy: number; // 0-100
    engagement: number; // 0-100
    overall: number; // 0-100
  };
  feedback: {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  };
  overallScore: number; // 0-100
}

export interface PerformanceMetrics {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  speechFeedback: SpeechFeedback[];
  visualFeedback: VisualFeedback[];
  combinedScore: number; // 0-100
  eloChange: number; // Elo rating change
  audienceReaction: {
    engagement: number; // 0-100
    attention: number; // 0-100
    positiveFeedback: number; // 0-100
  };
}

export interface EloRating {
  userId: string;
  currentRating: number;
  previousRating: number;
  totalSessions: number;
  winStreak: number;
  bestScore: number;
  averageScore: number;
  lastUpdated: number;
}

export interface AudienceReaction {
  timestamp: number;
  engagement: number; // 0-100
  attention: number; // 0-100
  positiveFeedback: number; // 0-100
  reactions: {
    applause: number; // 0-100
    laughter: number; // 0-100
    nodding: number; // 0-100
    distraction: number; // 0-100
  };
}

export interface RealTimeFeedback {
  type: 'speech' | 'visual' | 'combined';
  data: SpeechFeedback | VisualFeedback | PerformanceMetrics;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// WebSocket message types for real-time communication
export interface WebSocketMessage {
  type: 'speech_feedback' | 'visual_feedback' | 'performance_update' | 'audience_reaction' | 'elo_update';
  data: SpeechFeedback | VisualFeedback | PerformanceMetrics | AudienceReaction | EloRating;
  timestamp: number;
}

// Configuration for different difficulty levels
export interface DifficultyConfig {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  speechThresholds: {
    minPace: number;
    maxPace: number;
    maxFillerWords: number;
    minClarity: number;
  };
  visualThresholds: {
    minEyeContact: number;
    minPosture: number;
    minGestures: number;
  };
  audienceStrictness: number; // 0-100, higher = more critical audience
  eloKFactor: number; // Higher K-factor = bigger rating changes
}

// Session configuration
export interface SessionConfig {
  duration: number; // seconds
  difficulty: DifficultyConfig;
  feedbackFrequency: number; // seconds between feedback updates
  enableRealTime: boolean;
  enableAudienceReactions: boolean;
  enableEloScoring: boolean;
} 