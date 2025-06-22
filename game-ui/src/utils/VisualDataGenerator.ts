import { VisualFeedback as SharedVisualFeedback } from '../../../shared/schemas';

// Inlined VisualFeedback type for demo purposes
/**
 * @typedef {Object} VisualFeedback
 * @property {number} overallScore
 * @property {{ score: number, details?: string }} [eyeContact]
 * @property {{ score: number, details?: string }} [facialExpression]
 * @property {{ score: number, details?: string }} [posture]
 * @property {{ score: number, details?: string }} [gestures]
 * @property {{ overall: number, details?: string }} [bodyLanguage]
 * @property {string[]} [suggestions]
 * @property {string[]} [improvements]
 * @property {string[]} [positiveFeedback]
 * @property {any} [technicalMetrics]
 */

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

interface FacialLandmark {
  x: number;
  y: number;
  confidence: number;
}

interface EyeTrackingData {
  leftEye: {
    center: { x: number; y: number };
    pupil: { x: number; y: number };
    openness: number;
    gazeDirection: { x: number; y: number; z: number };
  };
  rightEye: {
    center: { x: number; y: number };
    pupil: { x: number; y: number };
    openness: number;
    gazeDirection: { x: number; y: number; z: number };
  };
  eyeContact: {
    isLookingAtCamera: boolean;
    duration: number;
    percentage: number;
  };
}

interface GestureData {
  hands: Array<{
    landmarks: Array<{ x: number; y: number; z: number }>;
    gestures: string[];
    confidence: number;
  }>;
  bodyLanguage: {
    posture: string;
    confidence: number;
    stability: number;
  };
}

interface PostureData {
  spine: { x: number; y: number; z: number };
  shoulders: { left: { x: number; y: number; z: number }; right: { x: number; y: number; z: number } };
  head: { x: number; y: number; z: number };
  stability: number;
  alignment: number;
  stance: 'good' | 'slouched' | 'leaning' | 'rigid';
}

interface EmotionData {
  emotions: { [key: string]: number };
  dominantEmotion: string;
  confidence: number;
  intensity: number;
}

interface VisualFrameData {
  timestamp: number;
  frameId: string;
  imageResolution: { width: number; height: number };
  facialLandmarks: FacialLandmark[];
  eyeTracking: EyeTrackingData;
  gestures: GestureData;
  posture: PostureData;
  emotions: Array<{
    emotion: 'confident' | 'nervous' | 'engaged' | 'distracted' | 'neutral';
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  bodyLanguage: {
    openness: number;
    energy: number;
    engagement: number;
    overall: number;
  };
}

interface VisualAnalysisResult {
  timestamp: number;
  sessionId: string;
  userId: string;
  frameCount: number;
  analysisDuration: number;
  eyeContact: {
    percentage: number;
    duration: number;
    score: number;
    gazeHeatmap: Array<{ x: number; y: number; intensity: number }>;
  };
  facialExpression: {
    emotion: 'confident' | 'nervous' | 'engaged' | 'distracted' | 'neutral';
    confidence: number;
    score: number;
    emotionTimeline: Array<{ timestamp: number; emotion: string; confidence: number }>;
  };
  posture: {
    stance: 'good' | 'slouched' | 'leaning' | 'rigid';
    score: number;
    postureChanges: Array<{ timestamp: number; stance: string }>;
  };
  gestures: {
    detected: string[];
    appropriateness: number;
    frequency: number;
    score: number;
    gestureTimeline: Array<{ timestamp: number; gesture: string; confidence: number }>;
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
  technicalMetrics: {
    frameRate: number;
    detectionConfidence: number;
    processingTime: number;
    qualityScore: number;
  };
}

/**
 * Enhanced Naive Bayes Classifier with Feature Engineering
 */
class EnhancedNaiveBayesModel {
  private classProbabilities: Map<string, number> = new Map();
  private featureProbabilities: Map<string, Map<string, Map<string, number>>> = new Map();
  private classes: string[] = [];
  private features: string[] = [];
  private featureBins: Map<string, number[]> = new Map();

  constructor() {
    this.classes = ['beginner', 'intermediate', 'advanced'];
    this.features = [
      'eyeContactScore', 'eyeContactDuration', 'eyeContactPercentage',
      'facialExpressionScore', 'emotionStability', 'emotionConfidence',
      'postureScore', 'postureStability', 'postureAlignment',
      'gestureScore', 'gestureConfidence', 'gestureVariety',
      'bodyLanguageScore', 'overallStability', 'overallConfidence'
    ];
    
    // Initialize feature bins for discretization
    this.initializeFeatureBins();
  }

  private initializeFeatureBins() {
    // Create more distinct bins for better feature separation
    this.featureBins.set('eyeContactScore', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('eyeContactDuration', [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0]);
    this.featureBins.set('eyeContactPercentage', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('facialExpressionScore', [0, 0.25, 0.5, 0.75, 1.0]);
    this.featureBins.set('emotionStability', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('emotionConfidence', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('postureScore', [0, 0.25, 0.5, 0.75, 1.0]);
    this.featureBins.set('postureStability', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('postureAlignment', [0, 0.25, 0.5, 0.75, 1.0]);
    this.featureBins.set('gestureScore', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('gestureConfidence', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('gestureVariety', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('bodyLanguageScore', [0, 0.25, 0.5, 0.75, 1.0]);
    this.featureBins.set('overallStability', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
    this.featureBins.set('overallConfidence', [0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  }

  private discretizeFeature(featureName: string, value: number): string {
    const bins = this.featureBins.get(featureName);
    if (!bins) return value.toString();
    
    for (let i = 0; i < bins.length - 1; i++) {
      if (value >= bins[i] && value < bins[i + 1]) {
        return `bin_${i}`;
      }
    }
    return `bin_${bins.length - 1}`;
  }

  private extractFeatures(data: any): Map<string, string> {
    const features = new Map<string, string>();
    
    // Eye contact features
    features.set('eyeContactScore', this.discretizeFeature('eyeContactScore', data.eyeContact?.score || 0));
    features.set('eyeContactDuration', this.discretizeFeature('eyeContactDuration', data.eyeContact?.duration || 0));
    features.set('eyeContactPercentage', this.discretizeFeature('eyeContactPercentage', data.eyeContact?.percentage || 0));
    
    // Facial expression features
    features.set('facialExpressionScore', this.discretizeFeature('facialExpressionScore', data.facialExpression?.score || 0));
    features.set('emotionStability', this.discretizeFeature('emotionStability', data.emotionStability || 0));
    features.set('emotionConfidence', this.discretizeFeature('emotionConfidence', data.emotionConfidence || 0));
    
    // Posture features
    features.set('postureScore', this.discretizeFeature('postureScore', data.posture?.score || 0));
    features.set('postureStability', this.discretizeFeature('postureStability', data.postureStability || 0));
    features.set('postureAlignment', this.discretizeFeature('postureAlignment', data.postureAlignment || 0));
    
    // Gesture features
    features.set('gestureScore', this.discretizeFeature('gestureScore', data.gestures?.score || 0));
    features.set('gestureConfidence', this.discretizeFeature('gestureConfidence', data.gestureConfidence || 0));
    features.set('gestureVariety', this.discretizeFeature('gestureVariety', data.gestureVariety || 0));
    
    // Body language features
    features.set('bodyLanguageScore', this.discretizeFeature('bodyLanguageScore', data.bodyLanguage?.overall || 0));
    features.set('overallStability', this.discretizeFeature('overallStability', data.overallStability || 0));
    features.set('overallConfidence', this.discretizeFeature('overallConfidence', data.overallConfidence || 0));
    
    return features;
  }

  /**
   * Train the enhanced model on visual analysis data
   */
  train(trainingData: any[]): void {
    console.log(`🧠 Training Enhanced Naive Bayes model on ${trainingData.length} samples...`);
    
    // Count class occurrences
    const classCounts = new Map<string, number>();
    this.classes.forEach(c => classCounts.set(c, 0));
    
    trainingData.forEach(sample => {
      const className = sample.skillLevel;
      classCounts.set(className, (classCounts.get(className) || 0) + 1);
    });
    
    // Calculate class probabilities with smoothing
    const totalSamples = trainingData.length;
    const alpha = 1; // Laplace smoothing parameter
    this.classes.forEach(className => {
      const count = classCounts.get(className) || 0;
      this.classProbabilities.set(className, (count + alpha) / (totalSamples + alpha * this.classes.length));
    });
    
    // Calculate feature probabilities for each class with better smoothing
    this.features.forEach(feature => {
      this.featureProbabilities.set(feature, new Map());
      
      this.classes.forEach(className => {
        const classSamples = trainingData.filter(sample => sample.skillLevel === className);
        const featureValues = new Map<string, number>();
        
        classSamples.forEach(sample => {
          const extractedFeatures = this.extractFeatures(sample);
          const featureValue = extractedFeatures.get(feature) || 'unknown';
          featureValues.set(featureValue, (featureValues.get(featureValue) || 0) + 1);
        });
        
        // Apply stronger Laplace smoothing to prevent overfitting
        const totalClassSamples = classSamples.length;
        const uniqueValues = Math.max(featureValues.size, 1);
        const smoothingFactor = 0.5; // Reduced smoothing factor
        
        this.featureProbabilities.get(feature)!.set(className, new Map());
        featureValues.forEach((count, value) => {
          const probability = (count + smoothingFactor) / (totalClassSamples + smoothingFactor * uniqueValues);
          this.featureProbabilities.get(feature)!.get(className)!.set(value, probability);
        });
        
        // Add smoothing for unseen values
        const allPossibleValues = this.getAllPossibleValues(feature);
        allPossibleValues.forEach(value => {
          if (!featureValues.has(value)) {
            const probability = smoothingFactor / (totalClassSamples + smoothingFactor * uniqueValues);
            this.featureProbabilities.get(feature)!.get(className)!.set(value, probability);
          }
        });
      });
    });
    
    console.log('✅ Enhanced model training completed!');
    console.log('Class probabilities:', Object.fromEntries(this.classProbabilities));
  }

  /**
   * Get all possible values for a feature based on bins
   */
  private getAllPossibleValues(featureName: string): string[] {
    const bins = this.featureBins.get(featureName);
    if (!bins) return ['unknown'];
    
    const values: string[] = [];
    for (let i = 0; i < bins.length - 1; i++) {
      values.push(`bin_${i}`);
    }
    values.push(`bin_${bins.length - 1}`);
    return values;
  }

  /**
   * Predict skill level with enhanced confidence calculation
   */
  predict(data: any): { predicted: string; confidence: number; probabilities: Map<string, number> } {
    const features = this.extractFeatures(data);
    const classProbabilities = new Map<string, number>();
    
    this.classes.forEach(className => {
      let probability = Math.log(this.classProbabilities.get(className) || 0.001);
      
      this.features.forEach(feature => {
        const featureValue = features.get(feature) || 'unknown';
        const featureProb = this.featureProbabilities.get(feature)?.get(className)?.get(featureValue) || 0.001;
        probability += Math.log(featureProb);
      });
      
      classProbabilities.set(className, probability);
    });
    
    // Find the class with highest probability
    let predictedClass = this.classes[0];
    let maxProbability = classProbabilities.get(predictedClass) || 0;
    
    classProbabilities.forEach((prob, className) => {
      if (prob > maxProbability) {
        maxProbability = prob;
        predictedClass = className;
      }
    });
    
    // Calculate confidence based on probability difference
    const probabilities = new Map<string, number>();
    let totalProb = 0;
    
    classProbabilities.forEach((prob, className) => {
      const expProb = Math.exp(prob);
      probabilities.set(className, expProb);
      totalProb += expProb;
    });
    
    // Normalize probabilities
    probabilities.forEach((prob, className) => {
      probabilities.set(className, prob / totalProb);
    });
    
    const predictedProb = probabilities.get(predictedClass) || 0;
    
    // Calculate confidence based on probability margin
    const sortedProbs = Array.from(probabilities.entries()).sort((a, b) => b[1] - a[1]);
    const margin = sortedProbs.length > 1 ? predictedProb - sortedProbs[1][1] : predictedProb;
    const confidence = Math.min(predictedProb * 100, 95); // Cap at 95% for realism
    
    return {
      predicted: predictedClass,
      confidence: Math.round(confidence * 100) / 100,
      probabilities
    };
  }

  /**
   * Evaluate model performance
   */
  evaluate(testData: any[]): { accuracy: number; precision: Map<string, number>; recall: Map<string, number>; f1Score: Map<string, number> } {
    let correctPredictions = 0;
    const confusionMatrix = new Map<string, Map<string, number>>();
    
    this.classes.forEach(className => {
      confusionMatrix.set(className, new Map());
      this.classes.forEach(predClass => {
        confusionMatrix.get(className)!.set(predClass, 0);
      });
    });
    
    testData.forEach(sample => {
      const actual = sample.skillLevel;
      const prediction = this.predict(sample);
      const predicted = prediction.predicted;
      
      if (actual === predicted) {
        correctPredictions++;
      }
      
      const currentCount = confusionMatrix.get(actual)?.get(predicted) || 0;
      confusionMatrix.get(actual)!.set(predicted, currentCount + 1);
    });
    
    const accuracy = correctPredictions / testData.length;
    
    // Calculate precision, recall, and F1-score for each class
    const precision = new Map<string, number>();
    const recall = new Map<string, number>();
    const f1Score = new Map<string, number>();
    
    this.classes.forEach(className => {
      const tp = confusionMatrix.get(className)?.get(className) || 0;
      const fp = this.classes.reduce((sum, predClass) => {
        return sum + (predClass !== className ? (confusionMatrix.get(predClass)?.get(className) || 0) : 0);
      }, 0);
      const fn = this.classes.reduce((sum, predClass) => {
        return sum + (predClass !== className ? (confusionMatrix.get(className)?.get(predClass) || 0) : 0);
      }, 0);
      
      const prec = tp + fp > 0 ? tp / (tp + fp) : 0;
      const rec = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = prec + rec > 0 ? 2 * (prec * rec) / (prec + rec) : 0;
      
      precision.set(className, Math.round(prec * 1000) / 1000);
      recall.set(className, Math.round(rec * 1000) / 1000);
      f1Score.set(className, Math.round(f1 * 1000) / 1000);
    });
    
    return {
      accuracy: Math.round(accuracy * 1000) / 1000,
      precision,
      recall,
      f1Score
    };
  }
}

class VisualDataGenerator {
  private static readonly EMOTIONS = ['confident', 'nervous', 'engaged', 'distracted', 'neutral'] as const;
  private static readonly STANCES = ['good', 'slouched', 'leaning', 'rigid'] as const;
  private static readonly GESTURES = [
    'open palms', 'pointing', 'thumbs up', 'crossed arms', 'hands in pockets',
    'fidgeting', 'touching face', 'leaning forward', 'stepping back', 'nodding'
  ];
  
  private static readonly POSITIVE_FEEDBACK = [
    'Excellent eye contact maintained throughout the presentation',
    'Confident facial expressions enhanced your message',
    'Good use of hand gestures to emphasize key points',
    'Strong posture conveyed authority and confidence',
    'Natural body language showed genuine engagement',
    'Consistent energy level kept the audience engaged',
    'Appropriate use of space and movement',
    'Clear and purposeful gestures supported your message'
  ];
  
  private static readonly IMPROVEMENTS = [
    'Try to vary your hand gestures more naturally',
    'Consider maintaining eye contact with different audience members',
    'Work on reducing nervous fidgeting behaviors',
    'Practice more open and confident posture',
    'Use more facial expressions to convey emotion',
    'Consider the pace of your movements',
    'Work on maintaining consistent energy throughout',
    'Practice using space more effectively'
  ];
  
  private static readonly SUGGESTIONS = [
    'Practice using more open palm gestures',
    'Work on transitioning between different facial expressions smoothly',
    'Try recording yourself to identify unconscious movements',
    'Practice power poses before presentations',
    'Consider your audience size when planning gestures',
    'Work on breathing exercises to reduce nervous movements',
    'Practice maintaining eye contact with a timer',
    'Study successful speakers\' body language techniques'
  ];

  /**
   * Generate realistic facial landmarks (68-point model)
   */
  static generateFacialLandmarks(): FacialLandmark[] {
    const landmarks: FacialLandmark[] = [];
    
    // Generate 68 facial landmarks with realistic coordinates
    for (let i = 0; i < 68; i++) {
      landmarks.push({
        x: Math.random() * 640, // Simulate 640x480 camera
        y: Math.random() * 480,
        confidence: 0.7 + Math.random() * 0.3
      });
    }
    
    return landmarks;
  }

  /**
   * Generate realistic eye tracking data
   */
  static generateEyeTrackingData(skillLevel: 'beginner' | 'intermediate' | 'advanced'): EyeTrackingData {
    const skillMultiplier = skillLevel === 'beginner' ? 0.6 : skillLevel === 'intermediate' ? 0.8 : 0.95;
    
    const eyeContactPercentage = Math.max(30, Math.min(95, 
      (70 + Math.random() * 20) * skillMultiplier + (Math.random() - 0.5) * 30
    ));
    
    const eyeContactDuration = Math.max(1, Math.min(8, 
      (3 + Math.random() * 3) * skillMultiplier + (Math.random() - 0.5) * 2
    ));

    return {
      leftEye: {
        center: { x: 200 + Math.random() * 50, y: 150 + Math.random() * 30 },
        pupil: { x: 200 + Math.random() * 20, y: 150 + Math.random() * 15 },
        openness: 0.6 + Math.random() * 0.4,
        gazeDirection: { 
          x: (Math.random() - 0.5) * 0.3, 
          y: (Math.random() - 0.5) * 0.3, 
          z: 0.8 + Math.random() * 0.2 
        }
      },
      rightEye: {
        center: { x: 250 + Math.random() * 50, y: 150 + Math.random() * 30 },
        pupil: { x: 250 + Math.random() * 20, y: 150 + Math.random() * 15 },
        openness: 0.6 + Math.random() * 0.4,
        gazeDirection: { 
          x: (Math.random() - 0.5) * 0.3, 
          y: (Math.random() - 0.5) * 0.3, 
          z: 0.8 + Math.random() * 0.2 
        }
      },
      eyeContact: {
        isLookingAtCamera: Math.random() > 0.3,
        duration: eyeContactDuration,
        percentage: eyeContactPercentage
      }
    };
  }

  /**
   * Generate realistic gesture data with hand landmarks
   */
  static generateGestureData(skillLevel: 'beginner' | 'intermediate' | 'advanced'): GestureData {
    const skillMultiplier = skillLevel === 'beginner' ? 0.6 : skillLevel === 'intermediate' ? 0.8 : 0.95;
    
    const gestureCount = Math.max(1, Math.min(3, Math.floor(
      (2 + Math.random() * 1) * skillMultiplier + (Math.random() - 0.5) * 2
    )));

    const hands = [];
    for (let i = 0; i < gestureCount; i++) {
      const landmarks = [];
      // Generate 21 hand landmarks (MediaPipe Hands model)
      for (let j = 0; j < 21; j++) {
        landmarks.push({
          x: Math.random() * 640,
          y: Math.random() * 480,
          z: Math.random() * 100
        });
      }
      
      hands.push({
        landmarks,
        gestures: [this.GESTURES[Math.floor(Math.random() * this.GESTURES.length)]],
        confidence: 0.6 + Math.random() * 0.4,
      });
    }

    return { hands, bodyLanguage: { posture: this.STANCES[Math.floor(Math.random() * this.STANCES.length)], confidence: 0.8 + Math.random() * 0.2, stability: 0.8 + Math.random() * 0.2 } };
  }

  /**
   * Generate realistic posture data
   */
  static generatePostureData(skillLevel: 'beginner' | 'intermediate' | 'advanced'): PostureData {
    const skillMultiplier = skillLevel === 'beginner' ? 0.6 : skillLevel === 'intermediate' ? 0.8 : 0.95;
    
    const stance = this.STANCES[Math.floor(Math.random() * this.STANCES.length)];
    
    return {
      spine: { x: 320 + (Math.random() - 0.5) * 100, y: 240 + (Math.random() - 0.5) * 80, z: 500 + Math.random() * 200 },
      shoulders: {
        left: { x: (0.8 + Math.random() * 0.2) * skillMultiplier, y: 240 + (Math.random() - 0.5) * 80, z: 500 + Math.random() * 200 },
        right: { x: (0.8 + Math.random() * 0.2) * skillMultiplier, y: 240 + (Math.random() - 0.5) * 80, z: 500 + Math.random() * 200 }
      },
      head: { x: 320 + (Math.random() - 0.5) * 100, y: 240 + (Math.random() - 0.5) * 80, z: 500 + Math.random() * 200 },
      stability: 0.8 + Math.random() * 0.2,
      alignment: 0.8 + Math.random() * 0.2,
      stance
    };
  }

  /**
   * Generate a single frame of visual analysis data
   */
  static generateFrameData(
    timestamp: number,
    skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): VisualFrameData {
    return {
      timestamp,
      frameId: `frame-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      imageResolution: { width: 640, height: 480 },
      facialLandmarks: this.generateFacialLandmarks(),
      eyeTracking: this.generateEyeTrackingData(skillLevel),
      gestures: this.generateGestureData(skillLevel),
      posture: this.generatePostureData(skillLevel),
      emotions: [{
        emotion: this.EMOTIONS[Math.floor(Math.random() * this.EMOTIONS.length)],
        confidence: 0.6 + Math.random() * 0.4,
        boundingBox: {
          x: Math.random() * 400,
          y: Math.random() * 300,
          width: 100 + Math.random() * 100,
          height: 100 + Math.random() * 100
        }
      }],
      bodyLanguage: {
        openness: Math.max(40, Math.min(100, 70 + Math.random() * 30)),
        energy: Math.max(40, Math.min(100, 65 + Math.random() * 35)),
        engagement: Math.max(40, Math.min(100, 75 + Math.random() * 25)),
        overall: Math.max(40, Math.min(100, 70 + Math.random() * 30))
      }
    };
  }

  /**
   * Generate a complete session of visual analysis data
   */
  static generateSessionData(
    sessionId: string,
    userId: string,
    duration: number = 300, // 5 minutes in seconds
    frameRate: number = 30, // 30 FPS
    skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): VisualAnalysisResult {
    const startTime = Date.now() - (duration * 1000);
    const frameCount = Math.floor(duration * frameRate);
    const frames: VisualFrameData[] = [];
    
    // Generate frame data for the entire session
    for (let i = 0; i < frameCount; i++) {
      const timestamp = startTime + (i * (1000 / frameRate));
      frames.push(this.generateFrameData(timestamp, skillLevel));
    }

    // Analyze the session data to generate comprehensive results
    const eyeContactData = this.analyzeEyeContact(frames);
    const facialExpressionData = this.analyzeFacialExpressions(frames);
    const postureData = this.analyzePosture(frames);
    const gestureData = this.analyzeGestures(frames);
    const bodyLanguageData = this.analyzeBodyLanguage(frames);

    // Calculate overall score
    const overallScore = Math.round(
      (eyeContactData.score + facialExpressionData.score + postureData.score + gestureData.score + bodyLanguageData.overall) / 5
    );

    return {
      timestamp: Date.now(),
      sessionId,
      userId,
      frameCount,
      analysisDuration: duration,
      eyeContact: eyeContactData,
      facialExpression: facialExpressionData,
      posture: postureData,
      gestures: gestureData,
      bodyLanguage: bodyLanguageData,
      feedback: this.generateFeedback(overallScore, skillLevel),
      overallScore,
      technicalMetrics: {
        frameRate,
        detectionConfidence: 0.85 + Math.random() * 0.15,
        processingTime: duration * 0.1 + Math.random() * 0.5,
        qualityScore: 0.8 + Math.random() * 0.2
      }
    };
  }

  /**
   * Generate realistic visual feedback with skill-based correlations
   */
  static generateVisualFeedback(skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): SharedVisualFeedback {
    // Skill-based multipliers for more realistic correlations
    const skillMultipliers = {
      beginner: { 
        base: 0.2, 
        variance: 0.3, 
        stability: 0.1,
        eyeContact: 0.15,
        facialExpression: 0.2,
        posture: 0.25,
        gestures: 0.1,
        bodyLanguage: 0.2
      },
      intermediate: { 
        base: 0.6, 
        variance: 0.25, 
        stability: 0.6,
        eyeContact: 0.65,
        facialExpression: 0.6,
        posture: 0.7,
        gestures: 0.55,
        bodyLanguage: 0.6
      },
      advanced: { 
        base: 0.9, 
        variance: 0.1, 
        stability: 0.95,
        eyeContact: 0.9,
        facialExpression: 0.85,
        posture: 0.95,
        gestures: 0.8,
        bodyLanguage: 0.9
      }
    };
    
    const multiplier = skillMultipliers[skillLevel];
    
    // Generate correlated features based on skill level with more distinct ranges
    const baseScore = multiplier.base + (Math.random() - 0.5) * multiplier.variance;
    const stability = multiplier.stability + Math.random() * 0.15;
    const confidence = multiplier.base + Math.random() * 0.2;
    
    // Eye contact features (correlated with skill level)
    const eyeContactScore = Math.max(0, Math.min(100, (multiplier.eyeContact + Math.random() * 0.2) * 100));
    const eyeContactDuration = Math.max(0, Math.min(1, multiplier.eyeContact + Math.random() * 0.25));
    const eyeContactPercentage = Math.max(0, Math.min(100, (multiplier.eyeContact + Math.random() * 0.2) * 100));
    
    // Facial expression features (more stable for advanced speakers)
    const facialExpressionScore = Math.max(0, Math.min(100, (multiplier.facialExpression + Math.random() * 0.2) * 100));
    const emotionStability = Math.max(0, Math.min(1, stability + Math.random() * 0.15));
    const emotionConfidence = Math.max(0, Math.min(1, confidence + Math.random() * 0.15));
    
    // Posture features (better alignment for advanced speakers)
    const postureScore = Math.max(0, Math.min(100, (multiplier.posture + Math.random() * 0.15) * 100));
    const postureStability = Math.max(0, Math.min(1, stability + Math.random() * 0.1));
    const postureAlignment = Math.max(0, Math.min(1, multiplier.posture + Math.random() * 0.2));
    
    // Gesture features (more variety and confidence for advanced speakers)
    const gestureScore = Math.max(0, Math.min(100, (multiplier.gestures + Math.random() * 0.25) * 100));
    const gestureConfidence = Math.max(0, Math.min(1, confidence + Math.random() * 0.2));
    const gestureVariety = Math.max(0, Math.min(1, multiplier.gestures + Math.random() * 0.25));
    
    // Body language features (overall coordination)
    const bodyLanguageScore = Math.max(0, Math.min(100, (multiplier.bodyLanguage + Math.random() * 0.15) * 100));
    const overallStability = Math.max(0, Math.min(1, stability + Math.random() * 0.1));
    const overallConfidence = Math.max(0, Math.min(1, confidence + Math.random() * 0.1));
    
    // Calculate overall score with weighted components
    const overallScore = Math.round(
      (eyeContactScore * 0.25 + 
       facialExpressionScore * 0.2 + 
       postureScore * 0.2 + 
       gestureScore * 0.2 + 
       bodyLanguageScore * 0.15)
    );
    
    // Generate suggestions based on skill level
    const suggestions = this.generateSuggestions(skillLevel, {
      eyeContactScore, facialExpressionScore, postureScore, gestureScore, bodyLanguageScore
    });
    
    // Generate improvements based on weaknesses
    const improvements = this.generateImprovements(skillLevel, {
      eyeContactScore, facialExpressionScore, postureScore, gestureScore, bodyLanguageScore
    });
    
    // Generate positive feedback based on strengths
    const positiveFeedback = this.generatePositiveFeedback(skillLevel, {
      eyeContactScore, facialExpressionScore, postureScore, gestureScore, bodyLanguageScore
    });
    
    return {
      timestamp: Date.now(),
      overallScore,
      eyeContact: {
        score: Math.round(eyeContactScore),
        percentage: eyeContactPercentage,
        duration: eyeContactDuration,
      },
      facialExpression: {
        score: Math.round(facialExpressionScore),
        emotion: 'confident',
        confidence: emotionConfidence
      },
      posture: {
        score: Math.round(postureScore),
        stance: 'good',
      },
      gestures: {
        score: Math.round(gestureScore),
        detected: this.getRandomSubset(this.GESTURES, 3),
        appropriateness: gestureConfidence * 100,
        frequency: 5
      },
      bodyLanguage: {
        overall: Math.round(bodyLanguageScore),
        openness: overallConfidence * 100,
        energy: overallConfidence * 100,
        engagement: overallConfidence * 100,
      },
      feedback: {
        positive: positiveFeedback,
        improvements: improvements,
        suggestions: suggestions
      }
    };
  }

  /**
   * Generate skill-appropriate suggestions
   */
  private static generateSuggestions(skillLevel: string, scores: any): string[] {
    const suggestions: string[] = [];
    
    if (skillLevel === 'beginner') {
      if (scores.eyeContactScore < 60) suggestions.push('Practice maintaining eye contact with the audience');
      if (scores.postureScore < 60) suggestions.push('Work on standing straight and maintaining good posture');
      if (scores.gestureScore < 60) suggestions.push('Try using more hand gestures to emphasize key points');
      if (scores.facialExpressionScore < 60) suggestions.push('Practice showing more facial expressions');
      if (scores.bodyLanguageScore < 60) suggestions.push('Focus on overall body coordination and movement');
    } else if (skillLevel === 'intermediate') {
      if (scores.eyeContactScore < 75) suggestions.push('Vary your eye contact across different audience members');
      if (scores.postureScore < 75) suggestions.push('Fine-tune your posture for better audience engagement');
      if (scores.gestureScore < 75) suggestions.push('Refine your gesture timing and variety');
      if (scores.facialExpressionScore < 75) suggestions.push('Enhance emotional expression through facial cues');
      if (scores.bodyLanguageScore < 75) suggestions.push('Improve overall body language coordination');
    } else { // advanced
      if (scores.eyeContactScore < 85) suggestions.push('Master advanced eye contact techniques for larger audiences');
      if (scores.postureScore < 85) suggestions.push('Perfect your posture for maximum impact');
      if (scores.gestureScore < 85) suggestions.push('Develop signature gestures that enhance your message');
      if (scores.facialExpressionScore < 85) suggestions.push('Perfect micro-expressions for emotional impact');
      if (scores.bodyLanguageScore < 85) suggestions.push('Achieve perfect body language synchronization');
    }
    
    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }

  /**
   * Generate skill-appropriate improvements
   */
  private static generateImprovements(skillLevel: string, scores: any): string[] {
    const improvements: string[] = [];
    
    if (skillLevel === 'beginner') {
      improvements.push('Focus on basic eye contact techniques');
      improvements.push('Practice standing with confidence');
      improvements.push('Learn fundamental hand gestures');
    } else if (skillLevel === 'intermediate') {
      improvements.push('Develop more sophisticated eye contact patterns');
      improvements.push('Enhance posture for better audience connection');
      improvements.push('Master gesture timing and variety');
    } else { // advanced
      improvements.push('Perfect advanced eye contact for large audiences');
      improvements.push('Achieve master-level posture and presence');
      improvements.push('Create signature gesture repertoire');
    }
    
    return improvements;
  }

  /**
   * Generate skill-appropriate positive feedback
   */
  private static generatePositiveFeedback(skillLevel: string, scores: any): string[] {
    const positiveFeedback: string[] = [];
    
    if (skillLevel === 'beginner') {
      if (scores.eyeContactScore > 50) positiveFeedback.push('Good effort with eye contact');
      if (scores.postureScore > 50) positiveFeedback.push('Maintained decent posture throughout');
      if (scores.gestureScore > 50) positiveFeedback.push('Used some effective hand gestures');
    } else if (skillLevel === 'intermediate') {
      if (scores.eyeContactScore > 70) positiveFeedback.push('Excellent eye contact engagement');
      if (scores.postureScore > 70) positiveFeedback.push('Strong, confident posture');
      if (scores.gestureScore > 70) positiveFeedback.push('Well-timed and varied gestures');
      if (scores.facialExpressionScore > 70) positiveFeedback.push('Expressive facial communication');
    } else { // advanced
      if (scores.eyeContactScore > 85) positiveFeedback.push('Masterful eye contact control');
      if (scores.postureScore > 85) positiveFeedback.push('Perfect posture and presence');
      if (scores.gestureScore > 85) positiveFeedback.push('Exceptional gesture mastery');
      if (scores.facialExpressionScore > 85) positiveFeedback.push('Sophisticated facial expression control');
      if (scores.bodyLanguageScore > 85) positiveFeedback.push('Outstanding body language coordination');
    }
    
    return positiveFeedback.slice(0, 3); // Limit to top 3 positive feedback
  }

  private static analyzeEyeContact(frames: VisualFrameData[]): any {
    const eyeContactFrames = frames.filter(f => f.eyeTracking.eyeContact.isLookingAtCamera);
    const percentage = (eyeContactFrames.length / frames.length) * 100;
    const averageDuration = frames.reduce((acc, f) => acc + f.eyeTracking.eyeContact.duration, 0) / frames.length;
    
    return {
      percentage: Math.round(percentage),
      duration: Math.round(averageDuration * 10) / 10,
      score: Math.round(Math.min(100, percentage * 1.2)),
      gazeHeatmap: this.generateGazeHeatmap(frames)
    };
  }

  private static analyzeFacialExpressions(frames: VisualFrameData[]): any {
    const emotionCounts: Record<string, number> = {};
    frames.forEach(f => {
      f.emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });
    });
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as any;
    
    const averageConfidence = frames.reduce((acc, f) => 
      acc + f.emotions.reduce((sum, e) => sum + e.confidence, 0) / f.emotions.length, 0
    ) / frames.length;

    return {
      emotion: dominantEmotion,
      confidence: Math.round(averageConfidence * 100) / 100,
      score: Math.round(70 + Math.random() * 20),
      emotionTimeline: frames.map(f => ({
        timestamp: f.timestamp,
        emotion: f.emotions[0]?.emotion || 'neutral',
        confidence: f.emotions[0]?.confidence || 0
      }))
    };
  }

  private static analyzePosture(frames: VisualFrameData[]): any {
    const stanceCounts: Record<string, number> = {};
    frames.forEach(f => {
      stanceCounts[f.posture.stance] = (stanceCounts[f.posture.stance] || 0) + 1;
    });
    
    const dominantStance = Object.entries(stanceCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as any;
    
    const averageSpineAngle = frames.reduce((acc, f) => acc + f.posture.spine.z, 0) / frames.length;
    const score = Math.round(Math.min(100, Math.max(40, averageSpineAngle - 150)));

    return {
      stance: dominantStance,
      score,
      postureChanges: frames.map(f => ({
        timestamp: f.timestamp,
        stance: f.posture.stance
      }))
    };
  }

  private static analyzeGestures(frames: VisualFrameData[]): any {
    const allGestures: string[] = [];
    frames.forEach(f => {
      f.gestures.hands.forEach(h => allGestures.push(h.gestures[0]));
    });
    
    const gestureCounts: Record<string, number> = {};
    allGestures.forEach(g => {
      gestureCounts[g] = (gestureCounts[g] || 0) + 1;
    });
    
    const detected = Object.keys(gestureCounts);
    const frequency = allGestures.length / (frames.length / 30); // gestures per minute
    const appropriateness = Math.min(100, 70 + Math.random() * 30);
    const score = Math.round(Math.min(100, appropriateness * 0.8 + frequency * 2));

    return {
      detected,
      appropriateness: Math.round(appropriateness),
      frequency: Math.round(frequency),
      score,
      gestureTimeline: frames.map(f => ({
        timestamp: f.timestamp,
        gesture: f.gestures.hands[0]?.gestures[0] || 'none',
        confidence: f.gestures.hands[0]?.confidence || 0
      }))
    };
  }

  private static analyzeBodyLanguage(frames: VisualFrameData[]): any {
    const averageOpenness = frames.reduce((acc, f) => acc + f.bodyLanguage.openness, 0) / frames.length;
    const averageEnergy = frames.reduce((acc, f) => acc + f.bodyLanguage.energy, 0) / frames.length;
    const averageEngagement = frames.reduce((acc, f) => acc + f.bodyLanguage.engagement, 0) / frames.length;
    const overall = Math.round((averageOpenness + averageEnergy + averageEngagement) / 3);

    return {
      openness: Math.round(averageOpenness),
      energy: Math.round(averageEnergy),
      engagement: Math.round(averageEngagement),
      overall
    };
  }

  private static generateGazeHeatmap(frames: VisualFrameData[]): Array<{ x: number; y: number; intensity: number }> {
    const heatmap: Array<{ x: number; y: number; intensity: number }> = [];
    
    // Generate a realistic gaze heatmap
    for (let i = 0; i < 20; i++) {
      heatmap.push({
        x: Math.random() * 640,
        y: Math.random() * 480,
        intensity: Math.random()
      });
    }
    
    return heatmap;
  }

  private static generateFeedback(score: number, skillLevel: string): any {
    const positiveCount = Math.max(2, Math.min(5, Math.floor(score / 20)));
    const improvementCount = Math.max(1, Math.min(4, Math.floor((100 - score) / 25)));
    const suggestionCount = Math.max(1, Math.min(4, Math.floor((100 - score) / 30)));

    return {
      positive: this.getRandomSubset(this.POSITIVE_FEEDBACK, positiveCount),
      improvements: this.getRandomSubset(this.IMPROVEMENTS, improvementCount),
      suggestions: this.getRandomSubset(this.SUGGESTIONS, suggestionCount)
    };
  }

  private static getRandomSubset<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray([...array]);
    return shuffled.slice(0, count);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate training dataset with balanced skill levels
   */
  static generateTrainingDataset(size: number = 800): any[] {
    const dataset: any[] = [];
    const skillLevels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    
    // Generate balanced dataset
    for (let i = 0; i < size; i++) {
      const skillLevel = skillLevels[i % 3]; // Ensure balanced distribution
      const visualFeedback = this.generateVisualFeedback(skillLevel);
      
      // Add skill level to the data for training
      const trainingSample = {
        ...visualFeedback,
        skillLevel,
        sessionId: `train-session-${i}`,
        userId: `train-user-${i}`,
        timestamp: Date.now() - Math.random() * 86400000 // Random time in last 24 hours
      };
      
      dataset.push(trainingSample);
    }
    
    return dataset;
  }

  /**
   * Generate test dataset with balanced skill levels
   */
  static generateTestDataset(size: number = 200): any[] {
    const dataset: any[] = [];
    const skillLevels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    
    // Generate more varied test dataset with different patterns
    for (let i = 0; i < size; i++) {
      // Use different distribution for test data to avoid overfitting
      const skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
      const visualFeedback = this.generateVisualFeedback(skillLevel);
      
      // Add some noise to make test data more realistic
      const noisyFeedback = this.addNoiseToFeedback(visualFeedback);
      
      // Add skill level to the data for testing
      const testSample = {
        ...noisyFeedback,
        skillLevel,
        sessionId: `test-session-${i}`,
        userId: `test-user-${i}`,
        timestamp: Date.now() - Math.random() * 86400000 // Random time in last 24 hours
      };
      
      dataset.push(testSample);
    }
    
    return dataset;
  }

  /**
   * Add realistic noise to feedback data
   */
  private static addNoiseToFeedback(feedback: SharedVisualFeedback): SharedVisualFeedback {
    const noiseFactor = 0.1; // 10% noise
    
    const addNoise = (value: number): number => {
      const noise = (Math.random() - 0.5) * noiseFactor * 2;
      return Math.max(0, Math.min(100, value + noise * 100));
    };
    
    return {
      ...feedback,
      overallScore: Math.round(addNoise(feedback.overallScore / 100) * 100),
      eyeContact: {
        percentage: feedback.eyeContact?.percentage ?? 0,
        duration: feedback.eyeContact?.duration ?? 0,
        score: Math.round(addNoise((feedback.eyeContact?.score ?? 0) / 100) * 100),
      },
      facialExpression: {
        emotion: feedback.facialExpression?.emotion ?? 'neutral',
        confidence: feedback.facialExpression?.confidence ?? 0,
        score: Math.round(addNoise((feedback.facialExpression?.score ?? 0) / 100) * 100),
      },
      posture: {
        stance: feedback.posture?.stance ?? 'good',
        score: Math.round(addNoise((feedback.posture?.score ?? 0) / 100) * 100),
      },
      gestures: {
        detected: feedback.gestures?.detected ?? [],
        appropriateness: feedback.gestures?.appropriateness ?? 0,
        frequency: feedback.gestures?.frequency ?? 0,
        score: Math.round(addNoise((feedback.gestures?.score ?? 0) / 100) * 100),
      },
      bodyLanguage: {
        openness: feedback.bodyLanguage?.openness ?? 0,
        energy: feedback.bodyLanguage?.energy ?? 0,
        engagement: feedback.bodyLanguage?.engagement ?? 0,
        overall: Math.round(addNoise((feedback.bodyLanguage?.overall ?? 0) / 100) * 100),
      },
    };
  }

  /**
   * Train and evaluate the enhanced model
   */
  static trainAndEvaluateModel(trainSize: number = 800, testSize: number = 200): {
    model: EnhancedNaiveBayesModel;
    trainingResults: any;
    evaluationResults: any;
  } {
    console.log('🤖 Starting enhanced model training and evaluation...');
    
    // Generate balanced datasets
    const trainingData = this.generateTrainingDataset(trainSize);
    const testData = this.generateTestDataset(testSize);
    
    console.log(`📚 Training set: ${trainingData.length} samples`);
    console.log(`🧪 Test set: ${testData.length} samples`);
    
    // Create and train enhanced model
    const model = new EnhancedNaiveBayesModel();
    model.train(trainingData);
    
    // Evaluate model
    const evaluationResults = model.evaluate(testData);
    
    console.log('🎯 Enhanced model training and evaluation completed!');
    
    return {
      model,
      trainingResults: {
        trainSize,
        testSize,
        totalSamples: trainSize + testSize
      },
      evaluationResults
    };
  }

  /**
   * Test model predictions on new data
   */
  static testModelPredictions(model: EnhancedNaiveBayesModel, numSamples: number = 50): any[] {
    console.log(`🔮 Testing enhanced model predictions on ${numSamples} new samples...`);
    
    const predictions: any[] = [];
    const skillLevels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    
    for (let i = 0; i < numSamples; i++) {
      const actualSkillLevel = skillLevels[i % 3]; // Balanced distribution
      const testSample = this.generateVisualFeedback(actualSkillLevel);
      
      const prediction = model.predict(testSample);
      
      predictions.push({
        sampleId: i,
        actualSkillLevel,
        predictedSkillLevel: prediction.predicted,
        confidence: prediction.confidence,
        correct: prediction.predicted === actualSkillLevel,
        probabilities: Object.fromEntries(prediction.probabilities)
      });
    }
    
    const accuracy = predictions.filter(p => p.correct).length / predictions.length;
    console.log(`✅ Enhanced prediction accuracy: ${(accuracy * 100).toFixed(2)}%`);
    
    return predictions;
  }

  /**
   * Get dataset statistics
   */
  static getDatasetStatistics(dataset: any[]): any {
    const skillLevels = ['beginner', 'intermediate', 'advanced'];
    const stats: any = {};
    
    skillLevels.forEach(level => {
      const levelData = dataset.filter(sample => sample.skillLevel === level);
      stats[level] = {
        count: levelData.length,
        percentage: (levelData.length / dataset.length * 100).toFixed(1),
        avgOverallScore: levelData.length > 0 
          ? Math.round(levelData.reduce((sum: number, sample: any) => sum + sample.overallScore, 0) / levelData.length)
          : 0
      };
    });
    
    return stats;
  }

  /**
   * Compare skill levels
   */
  static compareSkillLevels(dataset: any[]): any {
    const skillLevels = ['beginner', 'intermediate', 'advanced'];
    const comparison: any = {};
    
    skillLevels.forEach(level => {
      const levelData = dataset.filter(sample => sample.skillLevel === level);
      if (levelData.length > 0) {
        comparison[level] = {
          avgEyeContact: Math.round(levelData.reduce((sum: number, sample: any) => sum + (sample.eyeContact?.score || 0), 0) / levelData.length),
          avgFacialExpression: Math.round(levelData.reduce((sum: number, sample: any) => sum + (sample.facialExpression?.score || 0), 0) / levelData.length),
          avgPosture: Math.round(levelData.reduce((sum: number, sample: any) => sum + (sample.posture?.score || 0), 0) / levelData.length),
          avgGestures: Math.round(levelData.reduce((sum: number, sample: any) => sum + (sample.gestures?.score || 0), 0) / levelData.length),
          avgBodyLanguage: Math.round(levelData.reduce((sum: number, sample: any) => sum + (sample.bodyLanguage?.overall || 0), 0) / levelData.length)
        };
      }
    });
    
    return comparison;
  }

  /**
   * Generate a SpeechFeedback object for the dashboard
   */
  static generateSpeechFeedback(skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): any {
    // Skill-based multipliers for speech
    const skillMultipliers = {
      beginner: { base: 0.3, variance: 0.4 },
      intermediate: { base: 0.6, variance: 0.3 },
      advanced: { base: 0.85, variance: 0.15 }
    };
    
    const multiplier = skillMultipliers[skillLevel];
    const baseScore = multiplier.base + (Math.random() - 0.5) * multiplier.variance;
    
    return {
      timestamp: Date.now(),
      transcript: "Hello everyone, today I'm going to talk about the importance of effective communication in the workplace. Good communication is essential for building strong relationships and achieving our goals.",
      confidence: 0.7 + Math.random() * 0.3,
      tone: {
        emotion: 'confident' as const,
        score: Math.round((baseScore + Math.random() * 0.2) * 100)
      },
      pace: {
        wordsPerMinute: 400 + Math.random() * 100,
        pauses: Math.floor(Math.random() * 5),
        score: Math.round((baseScore + Math.random() * 0.2) * 100),
        rhythm: 'consistent',
        consistency: Math.round((baseScore + Math.random() * 0.2) * 100)
      },
      fillerWords: {
        count: Math.floor(Math.random() * 5),
        words: ['um', 'uh', 'like'],
        score: Math.round((baseScore + Math.random() * 0.2) * 100)
      },
      clarity: {
        pronunciation: Math.round((baseScore + Math.random() * 0.2) * 100),
        volume: Math.round((baseScore + Math.random() * 0.2) * 100),
        articulation: Math.round((baseScore + Math.random() * 0.2) * 100),
        overall: Math.round((baseScore + Math.random() * 0.2) * 100)
      },
      feedback: {
        positive: [
          'Clear and articulate speech throughout the presentation',
          'Good pacing with natural rhythm and flow',
          'Confident tone that engaged the audience'
        ],
        improvements: [
          'Reduce filler words like "um" and "uh"',
          'Vary your speaking pace to emphasize key points',
          'Consider using more vocal inflection'
        ],
        suggestions: [
          'Practice breathing exercises to improve pacing',
          'Record yourself speaking to identify filler words',
          'Use pauses strategically to emphasize important points'
        ]
      },
      overallScore: Math.round((baseScore + Math.random() * 0.2) * 100)
    };
  }

  /**
   * Get visual skill prediction using the trained model
   */
  static getVisualSkillPrediction(feedback: SharedVisualFeedback): { predicted: string; confidence: number } {
    if (!_model) {
      console.warn('Model not trained yet, returning default prediction');
      return { predicted: 'intermediate', confidence: 50 };
    }
    const prediction = _model.predict(feedback);
    return {
      predicted: prediction.predicted,
      confidence: prediction.confidence
    };
  }
}

// Train the enhanced model at module load with improved data
const _model = new EnhancedNaiveBayesModel();
const _trainingData = VisualDataGenerator.generateTrainingDataset(800);
_model.train(_trainingData);

console.log('🧠 Enhanced Naive Bayes model trained on 800 samples with improved feature engineering');
console.log('📊 Model ready for predictions with enhanced accuracy');

export { VisualDataGenerator }; 