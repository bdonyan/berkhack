import React from 'react';
import { SpeechFeedback } from '../../../shared/schemas';
import { TrendingUp, TrendingDown, Target, Lightbulb, Mic, Clock, FileText, BookOpen } from 'lucide-react';

interface DetailedAnalysisProps {
  speechFeedback: SpeechFeedback | null;
}

export const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ speechFeedback }) => {
  if (!speechFeedback) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Detailed Analysis
        </h3>
        <p className="text-gray-600 text-center py-8">Start a session to see detailed speech analysis.</p>
      </div>
    );
  }

  const { pace, fillerWords, clarity, detailedInsights } = speechFeedback;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2" />
        Detailed Analysis
      </h3>

      <div className="space-y-6">
        {/* Pacing Analysis */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Pacing Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-sm text-gray-600">Words per Minute:</span>
              <div className="font-semibold text-lg">{pace.wordsPerMinute} WPM</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Rhythm:</span>
              <div className="font-semibold capitalize">{pace.rhythm}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Pauses:</span>
              <div className="font-semibold">{pace.pauses}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Consistency:</span>
              <div className="font-semibold">{pace.consistency}/100</div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Pace Score:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  pace.score >= 80 ? 'bg-green-500' : 
                  pace.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${pace.score}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold">{pace.score}/100</span>
          </div>
        </div>

        {/* Filler Words Analysis */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Mic className="w-4 h-4 mr-2" />
            Filler Words Analysis
          </h4>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Filler Words Found:</span>
              <span className="font-semibold">{fillerWords.count}</span>
            </div>
            {fillerWords.words.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {fillerWords.words.map((word, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    "{word}"
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Filler Word Score:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    fillerWords.score >= 80 ? 'bg-green-500' : 
                    fillerWords.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fillerWords.score}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold">{fillerWords.score}/100</span>
            </div>
          </div>
          
          {fillerWords.detailedAnalysis && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-2">{fillerWords.detailedAnalysis.analysis}</p>
              <p className="text-sm text-gray-600 mb-3">{fillerWords.detailedAnalysis.impact}</p>
              {fillerWords.detailedAnalysis.recommendations && fillerWords.detailedAnalysis.recommendations.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Recommendations:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {fillerWords.detailedAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clarity Analysis */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Clarity Analysis
          </h4>
          <div className="mb-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Clarity Score:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    clarity.overall >= 80 ? 'bg-green-500' : 
                    clarity.overall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${clarity.overall}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold">{clarity.overall}/100</span>
            </div>
          </div>

          {clarity.detailedAnalysis ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-4">
              <p className="text-sm text-gray-700 italic">"{clarity.detailedAnalysis.articulation}"</p>
              
              {clarity.detailedAnalysis.strengths && clarity.detailedAnalysis.strengths.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">Strengths:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {clarity.detailedAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {clarity.detailedAnalysis.weaknesses && clarity.detailedAnalysis.weaknesses.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-red-700 mb-2">Areas for Improvement:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {clarity.detailedAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <TrendingDown className="w-3 h-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No detailed clarity analysis available.</p>
          )}
        </div>

        {/* AI-Generated Insights */}
        {detailedInsights && detailedInsights.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Insights
            </h4>
            <div className="space-y-3">
              {detailedInsights.map((insight, index) => (
                <div key={index} className="flex items-start">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 