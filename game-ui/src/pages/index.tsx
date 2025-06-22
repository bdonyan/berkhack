import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/authStore';
import { DailyMissions } from '@/components/DailyMissions';
import { useGameStore } from '../stores/gameStore';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    isSessionActive,
    speechFeedback,
    visualFeedback,
    audienceReaction,
    currentEloRating,
    sessionHistory,
    settings,
    startSession: startSessionState,
    endSession: endSessionState,
    setSpeechFeedback,
    setVisualFeedback,
    setAudienceReaction,
  } = useGameStore();

  const { xp, streak } = useGameStore();
  const incrementXP = useGameStore((state) => () => state.xp = state.xp + 10);
  const incrementStreak = useGameStore((state) => () => state.streak = state.streak + 1);

  // Debug: Log XP and streak to the console
  console.log('XP:', xp, 'Streak:', streak);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🗣️ Eloquence.AI
        </h1>
        <p className="text-xl text-gray-600">
          Master public speaking with real-time AI feedback
        </p>
      </motion.div>

      {/* XP and Streak Tracker */}
      <div className="flex items-center space-x-6 mb-6 justify-center">
        <div className="flex items-center">
          <span className="font-bold text-lg text-yellow-600">{xp} XP</span>
          <div className="ml-2 w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((xp % 100), 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center ml-6">
          <span className="text-2xl mr-1">🔥</span>
          <span className="font-bold">{streak} day streak</span>
        </div>
        {/* Debug buttons for testing XP and streak */}
        <button onClick={incrementXP} className="ml-4 px-2 py-1 bg-blue-200 rounded text-blue-800">+10 XP</button>
        <button onClick={incrementStreak} className="ml-2 px-2 py-1 bg-green-200 rounded text-green-800">+1 Streak</button>
      </div>

      {/* Daily Missions Panel */}
      <DailyMissions />
    </main>
  );
} 