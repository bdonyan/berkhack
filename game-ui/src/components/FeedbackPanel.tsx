import React from 'react';

interface FeedbackPanelProps {
  speechFeedback: any;
  visualFeedback: any;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  speechFeedback,
  visualFeedback
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">💬</span>
        Real-Time Feedback
      </h3>
      
      <div className="space-y-4">
        {/* Speech Feedback */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-medium text-blue-700 mb-2">🎤 Speech Analysis</h4>
          {speechFeedback ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Transcript:</strong> {speechFeedback.transcript || "Listening..."}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tone:</strong> {speechFeedback.tone?.emotion || "Analyzing..."}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Pace:</strong> {speechFeedback.pace?.wordsPerMinute || 0} WPM
              </p>
              <p className="text-sm text-gray-600">
                <strong>Filler Words:</strong> {speechFeedback.fillerWords?.count || 0}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No speech data available</p>
          )}
        </div>
        
        {/* Visual Feedback */}
        <div className="border-l-4 border-green-500 pl-4">
          <h4 className="font-medium text-green-700 mb-2">📹 Visual Analysis</h4>
          {visualFeedback ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Eye Contact:</strong> {visualFeedback.eyeContact?.percentage || 0}%
              </p>
              <p className="text-sm text-gray-600">
                <strong>Posture:</strong> {visualFeedback.posture?.stance || "Analyzing..."}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Gestures:</strong> {visualFeedback.gestures?.detected?.length || 0} detected
              </p>
              <p className="text-sm text-gray-600">
                <strong>Emotion:</strong> {visualFeedback.facialExpression?.emotion || "Analyzing..."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No visual data available</p>
          )}
        </div>
        
        {/* Suggestions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Suggestions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Maintain eye contact with your audience</li>
            <li>• Use hand gestures to emphasize points</li>
            <li>• Avoid filler words like "um" and "uh"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 