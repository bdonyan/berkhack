import React from 'react';
import { SpeechFeedback } from '../../../shared/schemas';
import { TrendingUp, TrendingDown, Target, Lightbulb, Mic, Clock, FileText } from 'lucide-react';

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

  const { pace, fillerWords, clarity, detailedInsights, tone } = speechFeedback;

  const renderMetric = (label: string, value: any, unit = "") => (
    <div>
      <span className="text-sm text-gray-600">{label}:</span>
      <div className="font-semibold text-lg">{value ?? 'N/A'}{unit}</div>
    </div>
  );

  const renderScore = (label: string, score: number | undefined) => (
    <div className="flex items-center">
      <span className="text-sm text-gray-600 mr-2">{label}:</span>
      {score !== undefined ? (
        <>
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                score >= 80 ? 'bg-green-500' : 
                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold">{score}/100</span>
        </>
      ) : (
        <span className="text-sm font-semibold text-gray-500">Not available</span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2" />
        Detailed Analysis
      </h3>

      <div className="space-y-6">
        {/* Pacing Analysis */}
        {pace && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pacing Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              {renderMetric("Words per Minute", pace.wordsPerMinute, " WPM")}
              {renderMetric("Rhythm", pace.rhythm && pace.rhythm.charAt(0).toUpperCase() + pace.rhythm.slice(1))}
              {renderMetric("Pauses", pace.pauses)}
              {renderMetric("Consistency", pace.consistency, "/100")}
            </div>
            {renderScore("Pace Score", pace.score)}
          </div>
        )}

        {/* Filler Words Analysis */}
        {fillerWords && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Mic className="w-4 h-4 mr-2" />
              Filler Words Analysis
            </h4>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Filler Words Found:</span>
                <span className="font-semibold">{fillerWords.count ?? 'N/A'}</span>
              </div>
              {fillerWords.words && fillerWords.words.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {fillerWords.words.map((word, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      "{word}"
                    </span>
                  ))}
                </div>
              )}
              {renderScore("Filler Word Score", fillerWords.score)}
            </div>
            
            {fillerWords.detailedAnalysis && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 mb-2">{fillerWords.detailedAnalysis.analysis}</p>
                <p className="text-sm text-gray-600 mb-3">{fillerWords.detailedAnalysis.impact}</p>
                {fillerWords.detailedAnalysis.recommendations.length > 0 && (
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
        )}

        {/* Clarity Analysis */}
        {clarity && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Clarity Analysis
            </h4>
            {clarity.detailedAnalysis ? (
              <>
                {renderScore("AI Clarity Score", clarity.detailedAnalysis.score)}
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <h5 className="text-sm font-semibold text-red-700 mb-2">Areas to Improve:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {clarity.detailedAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <TrendingDown className="w-3 h-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {clarity.detailedAnalysis.recommendations && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-semibold text-blue-700 mb-2">Recommendations:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {clarity.detailedAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Detailed clarity analysis not available.</p>
            )}
          </div>
        )}

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