import React from 'react';
import { Mic, Video, Square, Play } from 'lucide-react';

interface SessionControlsProps {
  isSessionActive: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  isMicActive: boolean;
  isVideoActive: boolean;
  isEnding?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isSessionActive,
  onStartSession,
  onEndSession,
  onToggleMic,
  onToggleVideo,
  isMicActive,
  isVideoActive,
  isEnding
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🎮</span>
        Session Controls
      </h3>
      
      <div className="space-y-4">
        {/* Main Session Controls */}
        <div className="flex justify-center space-x-4">
          {!isSessionActive ? (
            <button
              onClick={onStartSession}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </button>
          ) : (
            <button
              onClick={onEndSession}
              disabled={isEnding}
              className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
            >
              {isEnding ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  End Session
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Media Controls */}
        {isSessionActive && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={onToggleMic}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isMicActive 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isMicActive ? 'Mic On' : 'Mic Off'}
            </button>
            
            <button
              onClick={onToggleVideo}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isVideoActive 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <Video className="w-4 h-4 mr-2" />
              {isVideoActive ? 'Video On' : 'Video Off'}
            </button>
          </div>
        )}
        
        {/* Status Indicator */}
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isSessionActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isSessionActive ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            {isSessionActive ? 'Session Active' : 'Session Inactive'}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1">
            <li>• Click "Start Session" to begin your speech</li>
            <li>• Enable microphone and camera for full analysis</li>
            <li>• Speak naturally and maintain eye contact</li>
            <li>• Watch real-time feedback and audience reactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 