import { create } from 'zustand';
import { SpeechFeedback, VisualFeedback, AudienceReaction } from '../../../shared/schemas';

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
  
  settings: {
    enableRealTimeFeedback: true,
    enableAudienceReactions: true,
    enableEloScoring: true,
    difficultyLevel: 'intermediate',
  },
  
  // Actions
  startSession: (sessionId: string) => set({
    isSessionActive: true,
    sessionId,
    sessionStartTime: Date.now(),
    speechFeedback: null,
    visualFeedback: null,
    audienceReaction: null,
  }),
  
  endSession: () => set({
    isSessionActive: false,
    sessionId: null,
    sessionStartTime: null,
  }),
  
  setSpeechFeedback: (feedback: SpeechFeedback) => set({
    speechFeedback: feedback,
  }),
  
  setVisualFeedback: (feedback: VisualFeedback) => set({
    visualFeedback: feedback,
  }),
  
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