import React from 'react';
import { useGameStore } from '../stores/gameStore';

const PerformanceMetrics: React.FC = () => {
  const { sessionHistory, currentEloRating } = useGameStore(state => ({
    sessionHistory: state.sessionHistory,
    currentEloRating: state.currentEloRating,
  }));

  const completedSessions = sessionHistory.filter(s => s.endTime > 0);
  const lastSession = completedSessions.length > 0 ? completedSessions[0] : null;
  
  const avgScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.combinedScore, 0) / completedSessions.length)
    : 0;

  const totalDuration = completedSessions.reduce((acc, s) => acc + s.duration, 0);
  const avgDuration = completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0;
  
  return (
    <div className="grid grid-cols-2 gap-4 text-white">
      <div className="col-span-2 text-center p-3 bg-blue-500 rounded-lg">
        <div className="text-3xl font-bold">{currentEloRating}</div>
        <div className="text-sm">Elo Rating</div>
      </div>
      <div className="text-center p-3 bg-gray-700 rounded-lg">
        <div className="text-2xl font-bold">{completedSessions.length}</div>
        <div className="text-xs">Sessions</div>
      </div>
      <div className="text-center p-3 bg-indigo-500 rounded-lg">
        <div className="text-2xl font-bold">{avgDuration}s</div>
        <div className="text-xs">Avg. Time</div>
      </div>
      <div className="text-center p-3 bg-green-500 rounded-lg">
        <div className="text-2xl font-bold">{lastSession?.combinedScore || 0}</div>
        <div className="text-xs">Last Score</div>
      </div>
      <div className="text-center p-3 bg-yellow-500 rounded-lg">
        <div className="text-2xl font-bold">{avgScore}</div>
        <div className="text-xs">Avg. Score</div>
      </div>
    </div>
  );
};

export default PerformanceMetrics; 