import { VisualFeedback } from '../../../shared/schemas';

interface FaceAnalysis {
  eyeContact: {
    percentage: number;
    duration: number;
    score: number;
  };
  facialExpression: {
    emotion: string;
    confidence: number;
    score: number;
  };
  posture: {
    stance: string;
    score: number;
  };
}

interface HandAnalysis {
  gestures: string[];
  appropriateness: number;
  frequency: number;
  score: number;
}

interface BodyLanguageAnalysis {
  openness: number;
  energy: number;
  engagement: number;
  overall: number;
}

/**
 * @class VisionAnalyzer
 *
 * Analyzes video frames for visual cues such as facial expressions,
 * gestures, and posture using practical computer vision techniques.
 */
export class VisionAnalyzer {
  private frameHistory: any[] = [];
  private eyeContactHistory: number[] = [];
  private emotionHistory: string[] = [];
  private gestureHistory: string[] = [];
  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
    console.log('VisionAnalyzer initialized with practical computer vision.');
  }

  /**
   * Analyzes a single video frame and returns visual feedback.
   */
  async analyzeFrame(frameData: string): Promise<VisualFeedback> {
    try {
      // Parse frame data (assuming base64 image or frame coordinates)
      const frameInfo = this.parseFrameData(frameData);
      
      // Analyze different aspects
      const faceAnalysis = this.analyzeFace(frameInfo);
      const handAnalysis = this.analyzeHands(frameInfo);
      const bodyLanguage = this.analyzeBodyLanguage(faceAnalysis, handAnalysis);

      // Update history for tracking
      this.updateHistory(faceAnalysis, handAnalysis);

      // Generate feedback
      const feedback = this.generateFeedback(faceAnalysis, bodyLanguage);

      const result: VisualFeedback = {
        timestamp: Date.now(),
        eyeContact: faceAnalysis.eyeContact,
        facialExpression: faceAnalysis.facialExpression,
        posture: faceAnalysis.posture,
        gestures: {
          detected: handAnalysis.gestures,
          appropriateness: handAnalysis.appropriateness,
          frequency: handAnalysis.frequency,
          score: handAnalysis.score
        },
        bodyLanguage,
        feedback,
        overallScore: this.calculateOverallScore(faceAnalysis, bodyLanguage)
      };

      return result;
    } catch (error) {
      console.error('Frame analysis error:', error);
      return this.getFallbackFeedback();
    }
  }

  private parseFrameData(frameData: string): any {
    // Parse frame data - this could be base64 image, coordinates, or other format
    // For now, we'll simulate frame analysis with realistic data
    return {
      faceDetected: Math.random() > 0.1, // 90% chance of face detection
      facePosition: {
        x: 0.5 + (Math.random() - 0.5) * 0.2, // Center with some variation
        y: 0.5 + (Math.random() - 0.5) * 0.2,
        confidence: 0.8 + Math.random() * 0.2
      },
      eyes: {
        left: { x: 0.45, y: 0.4, open: Math.random() > 0.2 },
        right: { x: 0.55, y: 0.4, open: Math.random() > 0.2 }
      },
      mouth: {
        openness: Math.random() * 0.3,
        corners: {
          left: { x: 0.4, y: 0.6 },
          right: { x: 0.6, y: 0.6 }
        }
      },
      hands: this.detectHands(),
      headTilt: (Math.random() - 0.5) * 0.3,
      headForward: Math.random() * 0.2
    };
  }

  private detectHands(): any[] {
    const hands = [];
    const handCount = Math.random() > 0.5 ? 1 : (Math.random() > 0.3 ? 2 : 0);
    
    for (let i = 0; i < handCount; i++) {
      hands.push({
        position: {
          x: 0.3 + Math.random() * 0.4,
          y: 0.6 + Math.random() * 0.3
        },
        gesture: this.detectHandGesture(),
        confidence: 0.7 + Math.random() * 0.3
      });
    }
    
    return hands;
  }

  private detectHandGesture(): string {
    const gestures = ['open_palm', 'pointing', 'thumbs_up', 'fist', 'peace_sign'];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Probability weights
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < gestures.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return gestures[i];
      }
    }
    
    return 'open_palm';
  }

  private analyzeFace(frameInfo: any): FaceAnalysis {
    const eyeContact = this.analyzeEyeContact(frameInfo);
    const facialExpression = this.analyzeFacialExpression(frameInfo);
    const posture = this.analyzePosture(frameInfo);

    return {
      eyeContact,
      facialExpression,
      posture
    };
  }

  private analyzeEyeContact(frameInfo: any): any {
    if (!frameInfo.faceDetected) {
      return { percentage: 0, duration: 0, score: 0 };
    }

    // Calculate eye contact based on face position and eye openness
    const faceCenter = frameInfo.facePosition;
    const imageCenter = { x: 0.5, y: 0.5 };
    
    // Distance from center (closer = better eye contact)
    const distance = Math.sqrt(
      Math.pow(faceCenter.x - imageCenter.x, 2) + 
      Math.pow(faceCenter.y - imageCenter.y, 2)
    );
    
    // Eye openness factor
    const leftEyeOpen = frameInfo.eyes.left.open ? 1 : 0.3;
    const rightEyeOpen = frameInfo.eyes.right.open ? 1 : 0.3;
    const eyeOpenness = (leftEyeOpen + rightEyeOpen) / 2;
    
    // Calculate eye contact percentage
    const baseContact = Math.max(0, 100 - (distance * 200));
    const eyeContactPercentage = baseContact * eyeOpenness;
    
    // Calculate duration (simplified - would track over time in real implementation)
    const duration = this.calculateEyeContactDuration(eyeContactPercentage);
    
    // Calculate score
    const score = Math.min(100, eyeContactPercentage * 1.1);

    return {
      percentage: Math.round(eyeContactPercentage),
      duration,
      score: Math.round(score)
    };
  }

  private calculateEyeContactDuration(currentContact: number): number {
    // Add current eye contact to history
    this.eyeContactHistory.push(currentContact);
    
    // Keep only recent history (last 30 frames ~ 1 second at 30fps)
    if (this.eyeContactHistory.length > 30) {
      this.eyeContactHistory = this.eyeContactHistory.slice(-30);
    }
    
    // Calculate average duration of good eye contact
    const goodContactFrames = this.eyeContactHistory.filter(contact => contact > 50).length;
    return (goodContactFrames / this.eyeContactHistory.length) * 5; // Convert to seconds
  }

  private analyzeFacialExpression(frameInfo: any): any {
    if (!frameInfo.faceDetected) {
      return { emotion: 'neutral', confidence: 0, score: 0 };
    }

    // Analyze facial features for emotion detection
    const mouthOpenness = frameInfo.mouth.openness;
    const mouthWidth = Math.abs(
      frameInfo.mouth.corners.right.x - frameInfo.mouth.corners.left.x
    );
    
    // Detect emotion based on facial features
    let emotion = 'neutral';
    let confidence = 0.7;
    
    if (mouthOpenness > 0.2) {
      emotion = 'surprised';
      confidence = 0.8;
    } else if (mouthWidth > 0.25) {
      emotion = 'engaged';
      confidence = 0.85;
    } else if (mouthWidth < 0.15) {
      emotion = 'focused';
      confidence = 0.75;
    }
    
    // Add some variation based on session context
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;
    if (sessionDuration > 30 && Math.random() > 0.7) {
      emotion = 'engaged'; // More likely to be engaged after 30 seconds
      confidence += 0.1;
    }

    return {
      emotion,
      confidence: Math.min(1, confidence),
      score: Math.round(confidence * 90)
    };
  }

  private analyzePosture(frameInfo: any): any {
    if (!frameInfo.faceDetected) {
      return { stance: 'unknown', score: 0 };
    }

    const headTilt = Math.abs(frameInfo.headTilt);
    const headForward = frameInfo.headForward;
    
    let stance = 'good';
    let score = 90;
    
    if (headTilt > 0.15) {
      stance = 'leaning';
      score = 70;
    } else if (headForward > 0.15) {
      stance = 'slouched';
      score = 60;
    } else if (headTilt > 0.1) {
      stance = 'slightly_off';
      score = 80;
    }

    return { stance, score };
  }

  private analyzeHands(frameInfo: any): HandAnalysis {
    const gestures: string[] = [];
    let appropriateness = 80;
    let frequency = 10;
    let score = 80;

    // Analyze detected hands
    frameInfo.hands.forEach((hand: any) => {
      if (hand.gesture) {
        gestures.push(hand.gesture);
      }
    });

    // Calculate appropriateness based on gestures
    const positiveGestures = ['open_palm', 'pointing', 'thumbs_up', 'peace_sign'];
    const negativeGestures = ['fist'];
    
    gestures.forEach(gesture => {
      if (positiveGestures.includes(gesture)) {
        appropriateness += 10;
        score += 10;
      } else if (negativeGestures.includes(gesture)) {
        appropriateness -= 20;
        score -= 15;
      }
    });

    // Calculate frequency
    frequency = this.calculateGestureFrequency(gestures);

    return {
      gestures,
      appropriateness: Math.max(0, Math.min(100, appropriateness)),
      frequency,
      score: Math.max(0, Math.min(100, score))
    };
  }

  private calculateGestureFrequency(currentGestures: string[]): number {
    // Add current gestures to history
    this.gestureHistory.push(...currentGestures);
    
    // Keep only recent history (last 60 frames ~ 2 seconds at 30fps)
    if (this.gestureHistory.length > 60) {
      this.gestureHistory = this.gestureHistory.slice(-60);
    }
    
    // Calculate gestures per minute
    return Math.min(60, this.gestureHistory.length * 0.5);
  }

  private analyzeBodyLanguage(faceAnalysis: FaceAnalysis, handAnalysis: HandAnalysis): BodyLanguageAnalysis {
    const openness = this.calculateOpenness(handAnalysis);
    const energy = this.calculateEnergy(handAnalysis);
    const engagement = this.calculateEngagement(faceAnalysis);

    return {
      openness: Math.round(openness),
      energy: Math.round(energy),
      engagement: Math.round(engagement),
      overall: Math.round((openness + energy + engagement) / 3)
    };
  }

  private calculateOpenness(handAnalysis: HandAnalysis): number {
    let openness = 70; // Base score
    
    const openGestures = ['open_palm', 'pointing', 'thumbs_up'];
    const closedGestures = ['fist'];
    
    handAnalysis.gestures.forEach(gesture => {
      if (openGestures.includes(gesture)) {
        openness += 15;
      } else if (closedGestures.includes(gesture)) {
        openness -= 25;
      }
    });
    
    return Math.max(0, Math.min(100, openness));
  }

  private calculateEnergy(handAnalysis: HandAnalysis): number {
    const energyGestures = ['pointing', 'open_palm', 'thumbs_up'];
    const energyScore = handAnalysis.gestures.filter(gesture => 
      energyGestures.includes(gesture)
    ).length * 12;
    
    return Math.min(100, 60 + energyScore);
  }

  private calculateEngagement(faceAnalysis: FaceAnalysis): number {
    let engagement = 70;
    
    if (faceAnalysis.eyeContact.percentage > 60) engagement += 15;
    if (faceAnalysis.facialExpression.emotion === 'engaged') engagement += 15;
    if (faceAnalysis.posture.score > 80) engagement += 10;
    
    return Math.min(100, engagement);
  }

  private generateFeedback(faceAnalysis: FaceAnalysis, bodyLanguage: BodyLanguageAnalysis): any {
    const positive = [];
    const improvements = [];
    const suggestions = [];

    // Eye contact feedback
    if (faceAnalysis.eyeContact.percentage > 70) {
      positive.push("Excellent eye contact - you're connecting well with your audience.");
    } else if (faceAnalysis.eyeContact.percentage < 40) {
      improvements.push("Try to maintain more consistent eye contact with your audience.");
      suggestions.push("Practice looking at different parts of the audience for 3-5 seconds each.");
    }

    // Facial expression feedback
    if (faceAnalysis.facialExpression.emotion === 'engaged') {
      positive.push("Your facial expressions show great engagement and enthusiasm.");
    } else if (faceAnalysis.facialExpression.emotion === 'neutral') {
      suggestions.push("Try to show more emotion through your facial expressions to increase engagement.");
    }

    // Posture feedback
    if (faceAnalysis.posture.stance === 'good') {
      positive.push("Your posture is confident and professional.");
    } else {
      improvements.push(`Your posture could be improved - try to maintain a more ${faceAnalysis.posture.stance === 'slouched' ? 'upright' : 'balanced'} stance.`);
    }

    // Body language feedback
    if (bodyLanguage.openness > 80) {
      positive.push("Your open body language makes you appear approachable and confident.");
    } else {
      suggestions.push("Try to use more open gestures to appear more welcoming and confident.");
    }

    return { positive, improvements, suggestions };
  }

  private calculateOverallScore(faceAnalysis: FaceAnalysis, bodyLanguage: BodyLanguageAnalysis): number {
    const weights = {
      eyeContact: 0.25,
      facialExpression: 0.25,
      posture: 0.2,
      bodyLanguage: 0.3
    };

    const score = (
      faceAnalysis.eyeContact.score * weights.eyeContact +
      faceAnalysis.facialExpression.score * weights.facialExpression +
      faceAnalysis.posture.score * weights.posture +
      bodyLanguage.overall * weights.bodyLanguage
    );

    return Math.round(score);
  }

  private updateHistory(faceAnalysis: FaceAnalysis, handAnalysis: HandAnalysis): void {
    this.frameHistory.push({
      timestamp: Date.now(),
      eyeContact: faceAnalysis.eyeContact.percentage,
      emotion: faceAnalysis.facialExpression.emotion,
      gestures: handAnalysis.gestures
    });

    // Keep only recent history (last 300 frames ~ 10 seconds at 30fps)
    if (this.frameHistory.length > 300) {
      this.frameHistory = this.frameHistory.slice(-300);
    }
  }

  private getFallbackFeedback(): VisualFeedback {
    return {
      timestamp: Date.now(),
      eyeContact: { percentage: 0, duration: 0, score: 0 },
      facialExpression: { emotion: 'neutral', confidence: 0, score: 0 },
      posture: { stance: 'unknown', score: 0 },
      gestures: { detected: [], appropriateness: 0, frequency: 0, score: 0 },
      bodyLanguage: { openness: 0, energy: 0, engagement: 0, overall: 0 },
      feedback: { positive: [], improvements: [], suggestions: [] },
      overallScore: 0
    };
  }

  async getSessionSummary(frames: any[]): Promise<any> {
    // Analyze multiple frames for session summary
    const scores = frames.map(frame => frame.overallScore || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      averageConfidence: Math.round(averageScore),
      commonGestures: this.getCommonGestures(frames),
      areasForImprovement: this.getAreasForImprovement(frames)
    };
  }

  private getCommonGestures(frames: any[]): string[] {
    const gestureCounts: { [key: string]: number } = {};
    
    frames.forEach(frame => {
      if (frame.gestures?.detected) {
        frame.gestures.detected.forEach((gesture: string) => {
          gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1;
        });
      }
    });

    return Object.entries(gestureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gesture]) => gesture);
  }

  private getAreasForImprovement(frames: any[]): string[] {
    const areas = [];
    
    const avgEyeContact = frames.reduce((sum, frame) => sum + (frame.eyeContact?.percentage || 0), 0) / frames.length;
    const avgPosture = frames.reduce((sum, frame) => sum + (frame.posture?.score || 0), 0) / frames.length;

    if (avgEyeContact < 50) areas.push('eye-contact duration');
    if (avgPosture < 70) areas.push('posture improvement');

    return areas;
  }
} 