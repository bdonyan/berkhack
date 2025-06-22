import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const missions = [
  {
    id: 1,
    text: 'Speak for 60 seconds with <3 filler words',
    key: 'fillerWords',
  },
  {
    id: 2,
    text: 'Maintain eye contact >70%',
    key: 'eyeContact',
  },
  {
    id: 3,
    text: 'Use 5 gestures',
    key: 'gestures',
  },
];

// For now, use props or Zustand for completion state. Here, just show incomplete for demo.
export const DailyMissions: React.FC<{ completed?: Record<string, boolean> }> = ({ completed = {} }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🔥</span> Daily Missions
      </h3>
      <ul className="space-y-3">
        {missions.map((mission) => (
          <li key={mission.id} className="flex items-center">
            {completed[mission.key] ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 mr-2" />
            )}
            <span className={completed[mission.key] ? 'line-through text-gray-400' : ''}>{mission.text}</span>
            {completed[mission.key] && <span className="ml-2 text-xs text-green-600 font-semibold">+20 XP</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}; 