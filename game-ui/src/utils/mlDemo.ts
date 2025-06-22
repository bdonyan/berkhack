// Self-contained ML demo for Eloquence.AI
// Run with: npx ts-node src/utils/mlDemo.ts

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

class NaiveBayesModel {
  private classProbabilities: Map<string, number> = new Map();
  private featureProbabilities: Map<string, Map<string, Map<string, number>>> = new Map();
  private classes: string[] = [];
  private features: string[] = [];

  constructor() {
    this.classes = ['beginner', 'intermediate', 'advanced'];
    this.features = ['eyeContact', 'facialExpression', 'posture', 'gestures', 'bodyLanguage'];
  }

  train(trainingData: any[]): void {
    const classCounts = new Map<string, number>();
    trainingData.forEach(sample => {
      const skillLevel = sample.skillLevel || 'intermediate';
      classCounts.set(skillLevel, (classCounts.get(skillLevel) || 0) + 1);
    });
    this.classes.forEach(className => {
      const count = classCounts.get(className) || 0;
      this.classProbabilities.set(className, count / trainingData.length);
    });
    this.features.forEach(feature => {
      this.featureProbabilities.set(feature, new Map());
      this.classes.forEach(className => {
        const classSamples = trainingData.filter(sample => (sample.skillLevel || 'intermediate') === className);
        const featureValues = new Map<string, number>();
        classSamples.forEach(sample => {
          const value = this.extractFeatureValue(sample, feature);
          featureValues.set(value, (featureValues.get(value) || 0) + 1);
        });
        const total = classSamples.length;
        const probabilities = new Map<string, number>();
        featureValues.forEach((count, value) => {
          probabilities.set(value, count / total);
        });
        this.featureProbabilities.get(feature)!.set(className, probabilities);
      });
    });
  }

  predict(sample: any): { prediction: string; confidence: number; probabilities: Map<string, number> } {
    const classScores = new Map<string, number>();
    this.classes.forEach(className => {
      let score = Math.log(this.classProbabilities.get(className) || 0.001);
      this.features.forEach(feature => {
        const value = this.extractFeatureValue(sample, feature);
        const featureProbs = this.featureProbabilities.get(feature)?.get(className);
        const prob = featureProbs?.get(value) || 0.001;
        score += Math.log(prob);
      });
      classScores.set(className, score);
    });
    let bestClass = this.classes[0];
    let bestScore = classScores.get(bestClass) || -Infinity;
    classScores.forEach((score, className) => {
      if (score > bestScore) {
        bestScore = score;
        bestClass = className;
      }
    });
    const totalScore = Math.log(Array.from(classScores.values()).reduce((sum, score) => sum + Math.exp(score), 0));
    const probabilities = new Map<string, number>();
    classScores.forEach((score, className) => {
      probabilities.set(className, Math.exp(score - totalScore));
    });
    const confidence = probabilities.get(bestClass) || 0;
    return { prediction: bestClass, confidence, probabilities };
  }

  private extractFeatureValue(sample: any, feature: string): string {
    switch (feature) {
      case 'eyeContact':
        const eyeContactScore = sample.eyeContact?.score || 0;
        if (eyeContactScore >= 80) return 'excellent';
        if (eyeContactScore >= 60) return 'good';
        return 'poor';
      case 'facialExpression':
        const emotionScore = sample.facialExpression?.score || 0;
        if (emotionScore >= 80) return 'confident';
        if (emotionScore >= 60) return 'neutral';
        return 'nervous';
      case 'posture':
        const postureScore = sample.posture?.score || 0;
        if (postureScore >= 80) return 'good';
        if (postureScore >= 60) return 'fair';
        return 'poor';
      case 'gestures':
        const gestureScore = sample.gestures?.score || 0;
        if (gestureScore >= 80) return 'appropriate';
        if (gestureScore >= 60) return 'moderate';
        return 'inappropriate';
      case 'bodyLanguage':
        const bodyScore = sample.bodyLanguage?.overall || 0;
        if (bodyScore >= 80) return 'open';
        if (bodyScore >= 60) return 'neutral';
        return 'closed';
      default:
        return 'unknown';
    }
  }

  evaluate(testData: any[]): { accuracy: number; confusionMatrix: Map<string, Map<string, number>>; detailedMetrics: any } {
    let correctPredictions = 0;
    const confusionMatrix = new Map<string, Map<string, number>>();
    this.classes.forEach(actual => {
      confusionMatrix.set(actual, new Map());
      this.classes.forEach(predicted => {
        confusionMatrix.get(actual)!.set(predicted, 0);
      });
    });
    testData.forEach(sample => {
      const actual = sample.skillLevel || 'intermediate';
      const prediction = this.predict(sample);
      if (prediction.prediction === actual) {
        correctPredictions++;
      }
      const currentCount = confusionMatrix.get(actual)?.get(prediction.prediction) || 0;
      confusionMatrix.get(actual)!.set(prediction.prediction, currentCount + 1);
    });
    const accuracy = correctPredictions / testData.length;
    const detailedMetrics = this.calculateDetailedMetrics(confusionMatrix);
    return { accuracy, confusionMatrix, detailedMetrics };
  }

  private calculateDetailedMetrics(confusionMatrix: Map<string, Map<string, number>>): any {
    const metrics: any = {};
    this.classes.forEach(className => {
      const tp = confusionMatrix.get(className)?.get(className) || 0;
      const fp = Array.from(confusionMatrix.values()).reduce((sum, row) => sum + (row.get(className) || 0), 0) - tp;
      const fn = Array.from(confusionMatrix.get(className)?.values() || []).reduce((sum, count) => sum + count, 0) - tp;
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
      metrics[className] = { precision, recall, f1Score, support: tp + fn };
    });
    return metrics;
  }
}

class VisualDataGenerator {
  static generateVisualFeedback(skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') {
    // Generate fake scores based on skill level
    const base = skillLevel === 'beginner' ? 50 : skillLevel === 'intermediate' ? 70 : 90;
    return {
      overallScore: base + Math.round(Math.random() * 10 - 5),
      eyeContact: { score: base + Math.round(Math.random() * 10 - 5) },
      facialExpression: { score: base + Math.round(Math.random() * 10 - 5) },
      posture: { score: base + Math.round(Math.random() * 10 - 5) },
      gestures: { score: base + Math.round(Math.random() * 10 - 5) },
      bodyLanguage: { overall: base + Math.round(Math.random() * 10 - 5) },
      suggestions: ['Practice more open gestures', 'Maintain eye contact'],
      improvements: ['Reduce fidgeting', 'Smile more'],
      positiveFeedback: ['Great posture', 'Confident expression'],
      technicalMetrics: { frameRate: 30, detectionConfidence: 0.95 }
    };
  }

  static generateTrainingDataset(size: number = 1000): any[] {
    const dataset: any[] = [];
    const skillLevels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    for (let i = 0; i < size; i++) {
      const skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
      const feedback = this.generateVisualFeedback(skillLevel);
      dataset.push({ ...feedback, skillLevel });
    }
    return dataset;
  }

  static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

function main() {
  console.log('🎯 Eloquence.AI - Machine Learning Demo');
  console.log('=====================================');

  // Generate dataset
  const dataset = VisualDataGenerator.generateTrainingDataset(1000);
  const shuffled = VisualDataGenerator.shuffleArray([...dataset]);
  const trainSize = 800;
  const testSize = 200;
  const trainingData = shuffled.slice(0, trainSize);
  const testData = shuffled.slice(trainSize, trainSize + testSize);

  // Train model
  const model = new NaiveBayesModel();
  model.train(trainingData);
  console.log('✅ Model trained on', trainingData.length, 'samples');

  // Evaluate model
  const evalResults = model.evaluate(testData);
  console.log('📊 Model accuracy:', (evalResults.accuracy * 100).toFixed(2) + '%');
  console.log('Detailed metrics:', evalResults.detailedMetrics);

  // Test predictions
  let correct = 0;
  for (let i = 0; i < 20; i++) {
    const sample = VisualDataGenerator.generateVisualFeedback();
    const skillLevel = ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'advanced';
    const testSample = { ...sample, skillLevel };
    const prediction = model.predict(testSample);
    if (prediction.prediction === skillLevel) correct++;
    console.log(`Sample ${i + 1}: Actual=${skillLevel}, Predicted=${prediction.prediction}, Confidence=${(prediction.confidence * 100).toFixed(1)}%`);
  }
  console.log('Prediction accuracy on 20 random samples:', (correct / 20 * 100).toFixed(2) + '%');

  console.log('🎉 Demo complete!');
}

main(); 