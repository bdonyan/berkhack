import React from 'react';

interface AudienceSimulatorProps {
  engagement: number;
  attention: number;
  positiveFeedback: number;
}

export const AudienceSimulator: React.FC<AudienceSimulatorProps> = ({
  engagement,
  attention,
  positiveFeedback
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">👥</span>
        Audience Reaction
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Engagement</span>
            <span className="text-sm font-medium">{engagement}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${engagement}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Attention</span>
            <span className="text-sm font-medium">{attention}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${attention}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Positive Feedback</span>
            <span className="text-sm font-medium">{positiveFeedback}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${positiveFeedback}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {positiveFeedback > 80 ? "🎉 Excellent! The audience is fully engaged!" :
           positiveFeedback > 60 ? "👍 Good job! Keep the energy up!" :
           positiveFeedback > 40 ? "😐 The audience is moderately engaged." :
           "😴 Try to be more engaging and dynamic."}
        </p>
      </div>
    </div>
  );
}; 