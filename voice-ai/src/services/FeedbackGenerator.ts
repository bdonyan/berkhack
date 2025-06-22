import Anthropic from '@anthropic-ai/sdk';
import { SpeechFeedback } from '../../../shared/schemas';

export class FeedbackGenerator {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateFeedback(analysis: any): Promise<SpeechFeedback> {
    try {
      // Generate feedback using Claude for more empathetic responses
      const feedback = await this.generateClaudeFeedback(analysis);
      
      return {
        ...analysis,
        feedback,
        overallScore: analysis.overallScore || this.calculateOverallScore(analysis)
      };
    } catch (error) {
      console.error('Feedback generation error:', error);
      return {
        ...analysis,
        feedback: {
          positive: ['Good effort on your speech!'],
          improvements: ['Try to speak more clearly and confidently.'],
          suggestions: ['Practice your speech multiple times before presenting.']
        },
        overallScore: analysis.overallScore || 70
      };
    }
  }

  private async generateClaudeFeedback(analysis: any): Promise<{
    positive: string[];
    improvements: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `You are an empathetic public speaking coach analyzing a speech. 
      
Speech Analysis:
- Transcript: "${analysis.transcript}"
- Tone: ${analysis.tone?.emotion} (score: ${analysis.tone?.score}/100)
- Pace: ${analysis.pace?.wordsPerMinute} WPM, ${analysis.pace?.rhythm} rhythm, ${analysis.pace?.consistency}/100 consistency (score: ${analysis.pace?.score}/100)
- Filler Words: ${analysis.fillerWords?.count} detected (${analysis.fillerWords?.words.join(', ')}) (score: ${analysis.fillerWords?.score}/100)
- Clarity: ${analysis.clarity?.overall}/100 (pronunciation: ${analysis.clarity?.pronunciation}, articulation: ${analysis.clarity?.articulation})

${analysis.fillerWords?.detailedAnalysis ? `
Filler Word Analysis: ${analysis.fillerWords.detailedAnalysis.analysis}
Impact: ${analysis.fillerWords.detailedAnalysis.impact}
` : ''}

${analysis.clarity?.detailedAnalysis ? `
Clarity Strengths: ${analysis.clarity.detailedAnalysis.strengths.join(', ')}
Clarity Weaknesses: ${analysis.clarity.detailedAnalysis.weaknesses.join(', ')}
` : ''}

${analysis.detailedInsights ? `
Key Insights: ${analysis.detailedInsights.join('; ')}
` : ''}

Generate constructive feedback in JSON format:
{
  "positive": ["2-3 specific things they did well, based on the detailed analysis"],
  "improvements": ["2-3 specific areas to improve, with concrete examples"],
  "suggestions": ["2-3 actionable suggestions for next time, incorporating the detailed insights"]
}

Be encouraging but honest. Focus on specific, actionable advice based on the detailed analysis provided.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError);
          return this.getDefaultFeedback(analysis);
        }
      }

      return this.getDefaultFeedback(analysis);
    } catch (error) {
      console.error('Claude feedback generation error:', error);
      return this.getDefaultFeedback(analysis);
    }
  }

  private getDefaultFeedback(analysis: any): {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  } {
    const feedback: {
      positive: string[];
      improvements: string[];
      suggestions: string[];
    } = {
      positive: [],
      improvements: [],
      suggestions: []
    };

    // Generate basic feedback based on scores
    if (analysis.tone?.score > 70) {
      feedback.positive.push('Great emotional tone and confidence!');
    } else {
      feedback.improvements.push('Work on projecting more confidence in your voice.');
      feedback.suggestions.push('Practice power poses before speaking to boost confidence.');
    }

    if (analysis.pace?.score > 70) {
      feedback.positive.push('Excellent speaking pace and rhythm.');
    } else {
      feedback.improvements.push('Your speaking pace could be more consistent.');
      feedback.suggestions.push('Practice with a metronome to improve timing.');
    }

    if (analysis.fillerWords?.score > 70) {
      feedback.positive.push('Clean speech with minimal filler words.');
    } else {
      feedback.improvements.push('Reduce the use of filler words like "um" and "uh".');
      feedback.suggestions.push('Practice pausing instead of using filler words.');
    }

    if (analysis.clarity?.overall > 70) {
      feedback.positive.push('Clear and well-articulated speech.');
    } else {
      feedback.improvements.push('Focus on clearer pronunciation and articulation.');
      feedback.suggestions.push('Practice tongue twisters to improve articulation.');
    }

    // Ensure we have at least some feedback
    if (feedback.positive.length === 0) {
      feedback.positive.push('Good effort on your speech!');
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push('Keep practicing to improve your public speaking skills.');
    }
    if (feedback.suggestions.length === 0) {
      feedback.suggestions.push('Record yourself speaking and review for improvement.');
    }

    return feedback;
  }

  private calculateOverallScore(analysis: any): number {
    const weights = {
      tone: 0.25,
      pace: 0.20,
      fillerWords: 0.20,
      clarity: 0.35
    };

    return Math.round(
      (analysis.tone?.score || 50) * weights.tone +
      (analysis.pace?.score || 50) * weights.pace +
      (analysis.fillerWords?.score || 50) * weights.fillerWords +
      (analysis.clarity?.overall || 50) * weights.clarity
    );
  }
} 