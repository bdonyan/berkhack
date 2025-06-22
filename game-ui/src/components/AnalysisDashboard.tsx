import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Hand, 
  Smile, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Award, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Users,
  Clock,
  Zap,
  Mic,
  Video
} from 'lucide-react';

// Define interfaces locally since we can't import from shared
interface SpeechFeedback {
  timestamp: number;
  transcript: string;
  confidence: number;
  tone: {
    emotion: 'confident' | 'nervous' | 'enthusiastic' | 'monotone' | 'engaging';
    score: number;
  };
  pace: {
    wordsPerMinute: number;
    pauses: number;
    score: number;
    rhythm: string;
    consistency: number;
  };
  fillerWords: {
    count: number;
    words: string[];
    score: number;
  };
  clarity: {
    pronunciation: number;
    volume: number;
    articulation: number;
    overall: number;
  };
  feedback: {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  };
  overallScore: number;
}

interface VisualFeedback {
  timestamp: number;
  eyeContact: {
    percentage: number;
    duration: number;
    score: number;
  };
  facialExpression: {
    emotion: 'confident' | 'nervous' | 'engaged' | 'distracted' | 'neutral';
    confidence: number;
    score: number;
  };
  posture: {
    stance: 'good' | 'slouched' | 'leaning' | 'rigid';
    score: number;
  };
  gestures: {
    detected: string[];
    appropriateness: number;
    frequency: number;
    score: number;
  };
  bodyLanguage: {
    openness: number;
    energy: number;
    engagement: number;
    overall: number;
  };
  feedback: {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  };
  overallScore: number;
}

interface AnalysisDashboardProps {
  speechFeedback: SpeechFeedback | null;
  visualFeedback: VisualFeedback | null;
  isVisible: boolean;
  overallScore: number;
  sessionDuration: number;
  onStartNewSession?: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  speechFeedback,
  visualFeedback,
  isVisible,
  overallScore,
  sessionDuration,
  onStartNewSession
}) => {
  if (!isVisible) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', icon: Award, color: 'text-green-600' };
    if (score >= 80) return { level: 'Good', icon: TrendingUp, color: 'text-blue-600' };
    if (score >= 70) return { level: 'Fair', icon: Target, color: 'text-yellow-600' };
    return { level: 'Needs Improvement', icon: AlertCircle, color: 'text-red-600' };
  };

  const performanceLevel = getPerformanceLevel(overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Session Analysis Complete</h2>
              <p className="text-blue-100">Comprehensive feedback and improvement suggestions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{overallScore}</div>
              <div className="text-blue-100">Overall Score</div>
            </div>
            {onStartNewSession && (
              <button
                onClick={onStartNewSession}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(sessionDuration / 60)}m {sessionDuration % 60}s
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <performanceLevel.icon className={`w-5 h-5 ${performanceLevel.color}`} />
              <span className="text-sm text-gray-600">Performance</span>
            </div>
            <div className={`text-2xl font-bold ${performanceLevel.color}`}>
              {performanceLevel.level}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Energy</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {visualFeedback?.bodyLanguage?.energy || 0}%
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {visualFeedback?.bodyLanguage?.engagement || 0}%
            </div>
          </div>
        </div>

        {/* Detailed Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Speech Analysis */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Mic className="w-6 h-6 mr-2 text-blue-600" />
              Speech Analysis
            </h3>

            {speechFeedback && (
              <>
                {/* Tone Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Tone & Emotion</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(speechFeedback.tone.score)} ${getScoreColor(speechFeedback.tone.score)}`}>
                      {speechFeedback.tone.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emotion detected:</span>
                      <span className="font-medium capitalize">{speechFeedback.tone.emotion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence level:</span>
                      <span className="font-medium">{Math.round(speechFeedback.tone.score)}%</span>
                    </div>
                  </div>
                </div>

                {/* Pace Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Speaking Pace</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(speechFeedback.pace.score)} ${getScoreColor(speechFeedback.pace.score)}`}>
                      {speechFeedback.pace.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Words per minute:</span>
                      <span className="font-medium">{speechFeedback.pace.wordsPerMinute}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pauses detected:</span>
                      <span className="font-medium">{speechFeedback.pace.pauses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rhythm:</span>
                      <span className="font-medium capitalize">{speechFeedback.pace.rhythm}</span>
                    </div>
                  </div>
                </div>

                {/* Clarity Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Clarity & Articulation</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(speechFeedback.clarity.overall)} ${getScoreColor(speechFeedback.clarity.overall)}`}>
                      {speechFeedback.clarity.overall}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pronunciation:</span>
                      <span className="font-medium">{speechFeedback.clarity.pronunciation}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Volume:</span>
                      <span className="font-medium">{speechFeedback.clarity.volume}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Articulation:</span>
                      <span className="font-medium">{speechFeedback.clarity.articulation}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Visual Analysis */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Video className="w-6 h-6 mr-2 text-green-600" />
              Visual Analysis
            </h3>

            {visualFeedback && (
              <>
                {/* Eye Contact */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Eye Contact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(visualFeedback.eyeContact.score)} ${getScoreColor(visualFeedback.eyeContact.score)}`}>
                      {visualFeedback.eyeContact.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contact percentage:</span>
                      <span className="font-medium">{visualFeedback.eyeContact.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average duration:</span>
                      <span className="font-medium">{visualFeedback.eyeContact.duration.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                {/* Facial Expressions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Smile className="w-4 h-4 mr-1" />
                      Facial Expression
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(visualFeedback.facialExpression.score)} ${getScoreColor(visualFeedback.facialExpression.score)}`}>
                      {visualFeedback.facialExpression.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Primary emotion:</span>
                      <span className="font-medium capitalize">{visualFeedback.facialExpression.emotion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="font-medium">{Math.round(visualFeedback.facialExpression.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Gestures */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Hand className="w-4 h-4 mr-1" />
                      Hand Gestures
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(visualFeedback.gestures.score)} ${getScoreColor(visualFeedback.gestures.score)}`}>
                      {visualFeedback.gestures.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gestures detected:</span>
                      <span className="font-medium">{visualFeedback.gestures.detected.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Frequency:</span>
                      <span className="font-medium">{visualFeedback.gestures.frequency}/min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Appropriateness:</span>
                      <span className="font-medium">{visualFeedback.gestures.appropriateness}%</span>
                    </div>
                    {visualFeedback.gestures.detected.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Detected gestures:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {visualFeedback.gestures.detected.map((gesture: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {gesture}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Posture */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Posture</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(visualFeedback.posture.score)} ${getScoreColor(visualFeedback.posture.score)}`}>
                      {visualFeedback.posture.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stance:</span>
                      <span className="font-medium capitalize">{visualFeedback.posture.stance}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-600" />
            Improvement Suggestions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speech Improvements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Speech Improvements</h4>
              {speechFeedback?.feedback?.improvements?.map((improvement: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </div>
              ))}
              {speechFeedback?.feedback?.suggestions?.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>

            {/* Visual Improvements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Visual Improvements</h4>
              {visualFeedback?.feedback?.improvements?.map((improvement: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </div>
              ))}
              {visualFeedback?.feedback?.suggestions?.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Positive Feedback */}
        {(speechFeedback?.feedback?.positive?.length || visualFeedback?.feedback?.positive?.length) && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              What You Did Well
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {speechFeedback?.feedback?.positive?.map((positive: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{positive}</span>
                </div>
              ))}
              {visualFeedback?.feedback?.positive?.map((positive: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{positive}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 