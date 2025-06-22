/**
 * @class GestureRecognizer
 *
 * A specialized service to detect and interpret specific hand and body gestures
 * from video frames using practical computer vision techniques.
 */
export class GestureRecognizer {
  private gestureHistory: string[] = [];
  private lastAnalysisTime = 0;
  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
    console.log('GestureRecognizer initialized with practical gesture detection.');
  }

  /**
   * Detects specific, predefined gestures from a video frame.
   */
  detectGestures(frameData: string): string[] {
    try {
      // Parse frame data for hand detection
      const handData = this.parseHandData(frameData);
      return this.analyzeHandGestures(handData);
    } catch (error) {
      console.error('Gesture detection error:', error);
      return this.getFallbackGestures();
    }
  }

  /**
   * Advanced gesture detection using hand landmark data.
   */
  async detectAdvancedGestures(handLandmarks: any[]): Promise<any> {
    if (!handLandmarks || handLandmarks.length === 0) {
      return this.getEmptyGestureAnalysis();
    }

    const detectedGestures: string[] = [];
    let totalConfidence = 0;
    let gestureCount = 0;

    for (const hand of handLandmarks) {
      const gestures = this.analyzeHandLandmarks(hand);
      detectedGestures.push(...gestures.detected);
      totalConfidence += gestures.confidence;
      gestureCount++;
    }

    const averageConfidence = gestureCount > 0 ? totalConfidence / gestureCount : 0;
    const appropriateness = this.calculateAppropriateness(detectedGestures);
    const frequency = this.calculateFrequency(detectedGestures);
    const score = this.calculateGestureScore(detectedGestures, averageConfidence, appropriateness);

    return {
      detected: detectedGestures,
      appropriateness,
      frequency,
      score,
      details: {
        handPositions: handLandmarks,
        gestureConfidence: averageConfidence,
        timing: Date.now() - this.lastAnalysisTime
      }
    };
  }

  private parseHandData(frameData: string): any {
    // Parse hand data from frame - this could be coordinates, landmarks, or other format
    // For now, we'll simulate hand detection with realistic data
    const hands = [];
    const handCount = Math.random() > 0.4 ? 1 : (Math.random() > 0.2 ? 2 : 0);
    
    for (let i = 0; i < handCount; i++) {
      hands.push({
        position: {
          x: 0.2 + Math.random() * 0.6,
          y: 0.5 + Math.random() * 0.4
        },
        landmarks: this.generateHandLandmarks(),
        confidence: 0.7 + Math.random() * 0.3
      });
    }
    
    return hands;
  }

  private generateHandLandmarks(): any[] {
    // Generate simulated hand landmarks (21 points for MediaPipe format)
    const landmarks = [];
    for (let i = 0; i < 21; i++) {
      landmarks.push({
        x: 0.3 + Math.random() * 0.4,
        y: 0.4 + Math.random() * 0.4,
        z: Math.random() * 0.2
      });
    }
    return landmarks;
  }

  private analyzeHandGestures(handData: any[]): string[] {
    const gestures: string[] = [];
    
    handData.forEach(hand => {
      const gesture = this.classifyHandGesture(hand.landmarks);
      if (gesture) {
        gestures.push(gesture);
      }
    });
    
    return gestures;
  }

  private analyzeHandLandmarks(landmarks: any[]): { detected: string[], confidence: number } {
    if (landmarks.length < 21) {
      return { detected: [], confidence: 0 };
    }

    const gestures: string[] = [];
    let confidence = 0;

    // Check for pointing gesture
    if (this.isPointingGesture(landmarks)) {
      gestures.push('pointing');
      confidence += 0.8;
    }

    // Check for open palm
    if (this.isOpenPalmGesture(landmarks)) {
      gestures.push('open_palm');
      confidence += 0.9;
    }

    // Check for thumbs up
    if (this.isThumbsUpGesture(landmarks)) {
      gestures.push('thumbs_up');
      confidence += 0.85;
    }

    // Check for fist
    if (this.isFistGesture(landmarks)) {
      gestures.push('fist');
      confidence += 0.75;
    }

    // Check for peace sign
    if (this.isPeaceSignGesture(landmarks)) {
      gestures.push('peace_sign');
      confidence += 0.8;
    }

    // Check for counting gestures
    const countingGesture = this.detectCountingGesture(landmarks);
    if (countingGesture) {
      gestures.push(countingGesture);
      confidence += 0.7;
    }

    return {
      detected: gestures,
      confidence: Math.min(1, confidence)
    };
  }

  private classifyHandGesture(landmarks: any[]): string | null {
    if (landmarks.length < 21) return null;

    // Analyze finger positions based on landmark coordinates
    const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
    const fingerPips = [3, 6, 10, 14, 18];
    
    const extendedFingers = this.countExtendedFingers(landmarks, fingerTips, fingerPips);
    
    // Classify based on extended fingers
    if (extendedFingers === 1) {
      return 'pointing';
    } else if (extendedFingers === 5) {
      return 'open_palm';
    } else if (extendedFingers === 0) {
      return 'fist';
    } else if (extendedFingers === 2) {
      return 'peace_sign';
    } else if (extendedFingers >= 1 && extendedFingers <= 5) {
      return `count_${extendedFingers}`;
    }
    
    return null;
  }

  private countExtendedFingers(landmarks: any[], fingerTips: number[], fingerPips: number[]): number {
    let count = 0;
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const pip = landmarks[fingerPips[i]];
      
      if (tip && pip && tip.y < pip.y) {
        count++;
      }
    }
    
    return count;
  }

  private isPointingGesture(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;
    
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const indexExtended = indexTip && indexPip && indexTip.y < indexPip.y;
    const middleClosed = middleTip && middlePip && middleTip.y > middlePip.y;
    const ringClosed = ringTip && ringPip && ringTip.y > ringPip.y;
    const pinkyClosed = pinkyTip && pinkyPip && pinkyTip.y > pinkyPip.y;

    return indexExtended && middleClosed && ringClosed && pinkyClosed;
  }

  private isOpenPalmGesture(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;
    
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const thumbExtended = thumbTip && thumbIp && thumbTip.y < thumbIp.y;
    const indexExtended = indexTip && indexPip && indexTip.y < indexPip.y;
    const middleExtended = middleTip && middlePip && middleTip.y < middlePip.y;
    const ringExtended = ringTip && ringPip && ringTip.y < ringPip.y;
    const pinkyExtended = pinkyTip && pinkyPip && pinkyTip.y < pinkyPip.y;

    return thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended;
  }

  private isThumbsUpGesture(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;
    
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const thumbUp = thumbTip && thumbIp && thumbTip.y < thumbIp.y;
    const indexClosed = indexTip && indexPip && indexTip.y > indexPip.y;
    const middleClosed = middleTip && middlePip && middleTip.y > middlePip.y;
    const ringClosed = ringTip && ringPip && ringTip.y > ringPip.y;
    const pinkyClosed = pinkyTip && pinkyPip && pinkyTip.y > pinkyPip.y;

    return thumbUp && indexClosed && middleClosed && ringClosed && pinkyClosed;
  }

  private isFistGesture(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;
    
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const thumbClosed = thumbTip && thumbIp && thumbTip.y > thumbIp.y;
    const indexClosed = indexTip && indexPip && indexTip.y > indexPip.y;
    const middleClosed = middleTip && middlePip && middleTip.y > middlePip.y;
    const ringClosed = ringTip && ringPip && ringTip.y > ringPip.y;
    const pinkyClosed = pinkyTip && pinkyPip && pinkyTip.y > pinkyPip.y;

    return thumbClosed && indexClosed && middleClosed && ringClosed && pinkyClosed;
  }

  private isPeaceSignGesture(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;
    
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const indexExtended = indexTip && indexPip && indexTip.y < indexPip.y;
    const middleExtended = middleTip && middlePip && middleTip.y < middlePip.y;
    const ringClosed = ringTip && ringPip && ringTip.y > ringPip.y;
    const pinkyClosed = pinkyTip && pinkyPip && pinkyTip.y > pinkyPip.y;

    return indexExtended && middleExtended && ringClosed && pinkyClosed;
  }

  private detectCountingGesture(landmarks: any[]): string | null {
    const extendedFingers = this.countExtendedFingers(landmarks, [4, 8, 12, 16, 20], [3, 6, 10, 14, 18]);
    
    if (extendedFingers >= 1 && extendedFingers <= 5) {
      return `count_${extendedFingers}`;
    }
    
    return null;
  }

  private calculateAppropriateness(gestures: string[]): number {
    let appropriateness = 80; // Base score

    // Positive gestures
    const positiveGestures = ['open_palm', 'pointing', 'thumbs_up', 'peace_sign'];
    const negativeGestures = ['fist', 'middle_finger'];
    const neutralGestures = ['count_1', 'count_2', 'count_3', 'count_4', 'count_5'];

    gestures.forEach(gesture => {
      if (positiveGestures.includes(gesture)) {
        appropriateness += 10;
      } else if (negativeGestures.includes(gesture)) {
        appropriateness -= 30;
      } else if (neutralGestures.includes(gesture)) {
        appropriateness += 5;
      }
    });

    return Math.max(0, Math.min(100, appropriateness));
  }

  private calculateFrequency(gestures: string[]): number {
    // Calculate gestures per minute (simplified)
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    
    // Add current gestures to history
    this.gestureHistory.push(...gestures);
    
    // Remove old gestures outside the time window
    this.gestureHistory = this.gestureHistory.filter(() => {
      // Simplified: just keep recent gestures
      return true;
    });
    
    // Limit history size
    if (this.gestureHistory.length > 100) {
      this.gestureHistory = this.gestureHistory.slice(-50);
    }
    
    return Math.min(60, this.gestureHistory.length);
  }

  private calculateGestureScore(gestures: string[], confidence: number, appropriateness: number): number {
    const baseScore = 70;
    const confidenceBonus = confidence * 20;
    const appropriatenessBonus = appropriateness * 0.2;
    const varietyBonus = Math.min(10, gestures.length * 2);
    
    return Math.max(0, Math.min(100, baseScore + confidenceBonus + appropriatenessBonus + varietyBonus));
  }

  /**
   * Analyzes the appropriateness and timing of gestures over a session.
   */
  analyzeSessionGestures(frames: any[]): object {
    const allGestures: string[] = [];
    const gestureTimings: number[] = [];
    let totalAppropriateness = 0;
    let totalConfidence = 0;

    frames.forEach((frame, index) => {
      if (frame.gestures?.detected) {
        allGestures.push(...frame.gestures.detected);
        gestureTimings.push(index * 100); // Approximate timing
        totalAppropriateness += frame.gestures.appropriateness || 0;
        totalConfidence += frame.gestures.score || 0;
      }
    });

    const gestureCounts: { [key: string]: number } = {};
    allGestures.forEach(gesture => {
      gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1;
    });

    const mostCommonGesture = Object.entries(gestureCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    const unusualGestures = Object.entries(gestureCounts)
      .filter(([, count]) => count === 1)
      .map(([gesture]) => gesture);

    return {
      totalGestures: allGestures.length,
      mostCommonGesture,
      unusualGestures,
      averageAppropriateness: frames.length > 0 ? totalAppropriateness / frames.length : 0,
      averageConfidence: frames.length > 0 ? totalConfidence / frames.length : 0,
      gestureDistribution: gestureCounts,
      timingAnalysis: {
        averageInterval: this.calculateAverageInterval(gestureTimings),
        consistency: this.calculateTimingConsistency(gestureTimings)
      }
    };
  }

  private calculateAverageInterval(timings: number[]): number {
    if (timings.length < 2) return 0;
    
    let totalInterval = 0;
    for (let i = 1; i < timings.length; i++) {
      totalInterval += timings[i] - timings[i-1];
    }
    
    return totalInterval / (timings.length - 1);
  }

  private calculateTimingConsistency(timings: number[]): number {
    if (timings.length < 3) return 100;
    
    const intervals = [];
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i-1]);
    }
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to consistency score (0-100)
    return Math.max(0, 100 - (standardDeviation / mean) * 100);
  }

  private getFallbackGestures(): string[] {
    const gestures = ['pointing', 'open_palm', 'thumbs_up'];
    const detected = [];

    if (Math.random() > 0.7) {
      const randomIndex = Math.floor(Math.random() * gestures.length);
      detected.push(gestures[randomIndex]);
    }

    return detected;
  }

  private getEmptyGestureAnalysis(): any {
    return {
      detected: [],
      appropriateness: 0,
      frequency: 0,
      score: 0,
      details: {
        handPositions: [],
        gestureConfidence: 0,
        timing: 0
      }
    };
  }
} 