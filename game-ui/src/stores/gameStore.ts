import { create } from 'zustand';
import { SpeechFeedback, VisualFeedback, AudienceReaction } from '../../../shared/schemas';
import { EloScoringSystem } from '@/utils/EloScoringSystem';

const eloSystem = new EloScoringSystem();

// Define complex types locally if not present in shared schemas
interface DetailedAnalysis {
  strengths: string[];
  recommendations: string[];
}

interface Clarity {
  score: number;
  detailedAnalysis: DetailedAnalysis;
}

interface FillerWords {
  count: number;
  detailedAnalysis: DetailedAnalysis;
}

interface SpeechAnalysis {
  transcript: string;
  wpm: number;
  clarity: Clarity;
  fillerWords: FillerWords;
}

interface Session {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  speechFeedback: SpeechFeedback[];
  visualFeedback: VisualFeedback[];
  combinedScore: number;
  transcript: string;
}

interface GameSettings {
  micOn: boolean;
  videoOn: boolean;
  audienceSound: boolean;
}

interface GameState {
  // Session state
  isSessionActive: boolean;
  sessionId: string | null;
  sessionStartTime: number | null;
  
  // Feedback data
  speechFeedback: SpeechFeedback | null;
  visualFeedback: VisualFeedback | null;
  audienceReaction: AudienceReaction | null;
  
  // Performance metrics
  currentEloRating: number;
  sessionHistory: any[];
  
  // XP and streak
  xp: number;
  streak: number;
  lastSessionDate: string | null;
  
  // Settings
  settings: {
    enableRealTimeFeedback: boolean;
    enableAudienceReactions: boolean;
    enableEloScoring: boolean;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  
  // Actions
  startSession: (sessionId: string) => void;
  endSession: () => void;
  setSpeechFeedback: (feedback: SpeechFeedback) => void;
  setVisualFeedback: (feedback: VisualFeedback) => void;
  setAudienceReaction: (reaction: AudienceReaction) => void;
  updateEloRating: (newRating: number) => void;
  addSessionToHistory: (session: any) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  resetSession: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  isSessionActive: false,
  sessionId: null,
  sessionStartTime: null,
  
  speechFeedback: null,
  visualFeedback: null,
  audienceReaction: null,
  
  currentEloRating: 1200,
  sessionHistory: [],
  
  xp: 0,
  streak: 0,
  lastSessionDate: null,
  
  settings: {
    enableRealTimeFeedback: true,
    enableAudienceReactions: true,
    enableEloScoring: true,
    difficultyLevel: 'intermediate',
  },
  
  // Actions
  startSession: (sessionId) => {
    const newSession = {
      sessionId,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      speechFeedback: [],
      visualFeedback: [],
      combinedScore: 0,
      eloChange: 0,
      audienceReaction: { engagement: 0, attention: 0, positiveFeedback: 0 },
    };
    set({ 
      isSessionActive: true, 
      sessionId,
      sessionStartTime: Date.now(),
      sessionHistory: [newSession, ...get().sessionHistory] 
    });
  },
  
  endSession: () => {
    if (!get().isSessionActive) return;
    
    const endTime = Date.now();
    const sessionHistory = get().sessionHistory;
    const currentSession = sessionHistory[0];

    if (currentSession) {
      const duration = (endTime - currentSession.startTime) / 1000;
      currentSession.duration = duration;
      currentSession.endTime = endTime;

      const speechScores = currentSession.speechFeedback.map((f: SpeechFeedback) => f.overallScore);
      const avgSpeechScore = speechScores.length > 0 ? speechScores.reduce((a: number, b: number) => a + b, 0) / speechScores.length : 0;
      
      const visualScores = currentSession.visualFeedback.map((f: VisualFeedback) => f.overallScore);
      const avgVisualScore = visualScores.length > 0 ? visualScores.reduce((a: number, b: number) => a + b, 0) / visualScores.length : 0;

      let combinedScore = avgSpeechScore;
      if (avgSpeechScore > 0 && avgVisualScore > 0) {
        combinedScore = Math.round(avgSpeechScore * 0.7 + avgVisualScore * 0.3);
      } else if (avgVisualScore > 0) {
        combinedScore = avgVisualScore;
      }
      
      currentSession.combinedScore = combinedScore;

      const currentElo = get().currentEloRating;
      const eloChange = Math.round(combinedScore - 50); // Convert 0-100 score to -50 to 50 change
      const newElo = currentElo + eloChange;

      // XP and streak logic
      const today = new Date().toDateString();
      let xp = get().xp;
      let streak = get().streak;
      let lastSessionDate = get().lastSessionDate;
      xp += 10; // +10 XP for completing a session
      if (lastSessionDate !== today) {
        if (lastSessionDate && (new Date(today).getTime() - new Date(lastSessionDate).getTime() > 86400000)) {
          streak = 1; // Missed a day, reset streak
        } else {
          streak += 1;
        }
        lastSessionDate = today;
      }

      set({
        isSessionActive: false,
        sessionId: null,
        sessionStartTime: null,
        sessionHistory: [...sessionHistory],
        currentEloRating: newElo,
        xp,
        streak,
        lastSessionDate,
      });
    }
  },
  
  setSpeechFeedback: (feedback: SpeechFeedback) => {
    set((state) => {
      const sessionHistory = [...state.sessionHistory];
      if (sessionHistory.length > 0) {
        sessionHistory[0].speechFeedback.push(feedback);
      }
      return { speechFeedback: feedback, sessionHistory };
    });
  },
  
  setVisualFeedback: (feedback: VisualFeedback) => {
    set((state) => {
      const sessionHistory = [...state.sessionHistory];
      if (sessionHistory.length > 0) {
        sessionHistory[0].visualFeedback.push(feedback);
      }
      return { visualFeedback: feedback, sessionHistory };
    });
  },
  
  setAudienceReaction: (reaction: AudienceReaction) => set({
    audienceReaction: reaction,
  }),
  
  updateEloRating: (newRating: number) => set({
    currentEloRating: newRating,
  }),
  
  addSessionToHistory: (session: any) => set((state) => ({
    sessionHistory: [...state.sessionHistory, session],
  })),
  
  updateSettings: (newSettings: Partial<GameState['settings']>) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),
  
  resetSession: () => set({
    isSessionActive: false,
    sessionId: null,
    sessionStartTime: null,
    speechFeedback: null,
    visualFeedback: null,
    audienceReaction: null,
  }),
}));

// Selectors for better performance
export const useSessionState = () => useGameStore((state) => ({
  isSessionActive: state.isSessionActive,
  sessionId: state.sessionId,
  sessionStartTime: state.sessionStartTime,
}));

export const useFeedbackData = () => useGameStore((state) => ({
  speechFeedback: state.speechFeedback,
  visualFeedback: state.visualFeedback,
  audienceReaction: state.audienceReaction,
}));

export const usePerformanceMetrics = () => useGameStore((state) => ({
  currentEloRating: state.currentEloRating,
  sessionHistory: state.sessionHistory,
}));

export const useSettings = () => useGameStore((state) => state.settings); 