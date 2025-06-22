import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  Mic, 
  TrendingUp, 
  Award, 
  Clock, 
  Play,
  BarChart3,
  Target,
  Zap,
  X
} from 'lucide-react';

interface SpeechFeedback {
  overallScore: number;
  clarity?: { 
    pronunciation: number; 
    volume: number; 
    articulation: number; 
    overall: number; 
    detailedAnalysis?: { 
      strengths: string[]; 
      weaknesses: string[]; 
      articulation: string; 
      vocabulary: string; 
    } 
  };
  pace?: { score: number; details?: string };
  volume?: { score: number; details?: string };
  tone?: { score: number; details?: string };
  suggestions?: string[];
  improvements?: string[];
  positiveFeedback?: string[];
}

interface VisualFeedback {
  overallScore: number;
  eyeContact?: { score: number; details?: string };
  facialExpression?: { score: number; details?: string };
  posture?: { score: number; details?: string };
  gestures?: { score: number; details?: string };
  bodyLanguage?: { overall: number; details?: string };
  suggestions?: string[];
  improvements?: string[];
  positiveFeedback?: string[];
  technicalMetrics?: any;
}

interface AnalysisDashboardProps {
  speechFeedback: SpeechFeedback | null;
  visualFeedback: VisualFeedback | null;
  isVisible: boolean;
  overallScore: number;
  sessionDuration: number;
  onStartNewSession?: () => void;
  onClose?: () => void;
  visualSkillPrediction?: { predicted: string; confidence: number } | null;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  speechFeedback,
  visualFeedback,
  isVisible,
  overallScore,
  sessionDuration,
  onStartNewSession,
  onClose,
  visualSkillPrediction
}) => {
  if (!isVisible) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced': return 'text-purple-600 bg-purple-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'beginner': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          aria-label="Close dashboard"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-primary-600" />
                AI Analysis Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive feedback on your public speaking performance
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">{overallScore}</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* ML Model Prediction Section */}
          {visualSkillPrediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
            >
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">🤖 ML Model Prediction</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Predicted Skill Level</span>
                    <Target className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(visualSkillPrediction.predicted)}`}>
                    {visualSkillPrediction.predicted.charAt(0).toUpperCase() + visualSkillPrediction.predicted.slice(1)}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Confidence</span>
                    <Zap className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${visualSkillPrediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(visualSkillPrediction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>🎯 <strong>ML Model Analysis:</strong> Based on your visual presentation data, our trained Naive Bayes model predicts your skill level with {Math.round(visualSkillPrediction.confidence * 100)}% confidence.</p>
              </div>
            </motion.div>
          )}

          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Session Duration</p>
                  <p className="text-2xl font-bold text-blue-900">{formatDuration(sessionDuration)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Performance</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </motion.div>
          </div>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Speech Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center mb-6">
                <Mic className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Speech Analysis</h3>
              </div>

              {speechFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Score</span>
                    <span className={`font-bold ${getScoreColor(speechFeedback.overallScore)}`}>
                      {speechFeedback.overallScore}/100
                    </span>
                  </div>

                  {speechFeedback.clarity && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Clarity</span>
                        <span className={`text-sm font-bold ${getScoreColor(speechFeedback.clarity.overall)}`}>
                          {speechFeedback.clarity.overall}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(speechFeedback.clarity.overall)}`}
                          style={{ width: `${speechFeedback.clarity.overall}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {speechFeedback.pace && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Pace</span>
                        <span className={`text-sm font-bold ${getScoreColor(speechFeedback.pace.score)}`}>
                          {speechFeedback.pace.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(speechFeedback.pace.score)}`}
                          style={{ width: `${speechFeedback.pace.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {speechFeedback.suggestions && speechFeedback.suggestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {speechFeedback.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Mic className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No speech data available</p>
                </div>
              )}
            </motion.div>

            {/* Visual Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center mb-6">
                <Eye className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Visual Analysis</h3>
              </div>

              {visualFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Score</span>
                    <span className={`font-bold ${getScoreColor(visualFeedback.overallScore)}`}>
                      {visualFeedback.overallScore}/100
                    </span>
                  </div>

                  {visualFeedback.eyeContact && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Eye Contact</span>
                        <span className={`text-sm font-bold ${getScoreColor(visualFeedback.eyeContact.score)}`}>
                          {visualFeedback.eyeContact.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(visualFeedback.eyeContact.score)}`}
                          style={{ width: `${visualFeedback.eyeContact.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {visualFeedback.posture && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Posture</span>
                        <span className={`text-sm font-bold ${getScoreColor(visualFeedback.posture.score)}`}>
                          {visualFeedback.posture.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(visualFeedback.posture.score)}`}
                          style={{ width: `${visualFeedback.posture.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {visualFeedback.gestures && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Gestures</span>
                        <span className={`text-sm font-bold ${getScoreColor(visualFeedback.gestures.score)}`}>
                          {visualFeedback.gestures.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(visualFeedback.gestures.score)}`}
                          style={{ width: `${visualFeedback.gestures.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {visualFeedback.suggestions && visualFeedback.suggestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {visualFeedback.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No visual data available</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onStartNewSession}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Play className="w-5 h-5 mr-2" />
              Start New Session
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Export Report
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 