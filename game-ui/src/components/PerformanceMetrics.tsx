import React from 'react';

interface PerformanceMetricsProps {
  eloRating: number;
  sessionHistory: any[];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  eloRating,
  sessionHistory
}) => {
  const recentSessions = sessionHistory.slice(-5);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Performance Metrics
      </h3>
      
      <div className="space-y-4">
        {/* Elo Rating */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <h4 className="text-sm font-medium mb-1">Current Elo Rating</h4>
          <div className="text-3xl font-bold">{eloRating}</div>
          <p className="text-sm opacity-90">
            {eloRating >= 2000 ? "Grandmaster" :
             eloRating >= 1800 ? "Master" :
             eloRating >= 1600 ? "Expert" :
             eloRating >= 1400 ? "Advanced" :
             eloRating >= 1200 ? "Intermediate" : "Beginner"}
          </p>
        </div>
        
        {/* Recent Sessions */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Recent Sessions</h4>
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    Session {sessionHistory.length - recentSessions.length + index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    Score: {session.score || 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sessions yet</p>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sessionHistory.length}
            </div>
            <div className="text-xs text-blue-600">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sessionHistory.length > 0 ? 
                Math.round(sessionHistory.reduce((sum, s) => sum + (s.score || 0), 0) / sessionHistory.length) : 0}
            </div>
            <div className="text-xs text-green-600">Avg Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 