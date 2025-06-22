const { VisualDataGenerator } = require('./VisualDataGenerator');

/**
 * Test script for VisualDataGenerator with Machine Learning
 * Demonstrates realistic computer vision data generation and model training
 */
function testVisualDataGenerator() {
  console.log('🧪 Testing VisualDataGenerator with Machine Learning...\n');

  // Test 1: Generate facial landmarks (68-point model)
  console.log('📊 Test 1: Facial Landmarks Generation');
  const landmarks = VisualDataGenerator.generateFacialLandmarks();
  console.log(`Generated ${landmarks.length} facial landmarks`);
  console.log('Sample landmarks:', landmarks.slice(0, 5));
  console.log('');

  // Test 2: Generate eye tracking data
  console.log('📊 Test 2: Eye Tracking Data Generation');
  const eyeTracking = VisualDataGenerator.generateEyeTrackingData();
  console.log('Eye tracking data:', {
    leftEye: eyeTracking.leftEye,
    rightEye: eyeTracking.rightEye,
    eyeContact: eyeTracking.eyeContact
  });
  console.log('');

  // Test 3: Generate gesture data
  console.log('📊 Test 3: Gesture Data Generation');
  const gestureData = VisualDataGenerator.generateGestureData();
  console.log('Gesture data:', {
    hands: gestureData.hands.length,
    gestures: gestureData.gestures,
    confidence: gestureData.confidence
  });
  console.log('');

  // Test 4: Generate posture data
  console.log('📊 Test 4: Posture Data Generation');
  const postureData = VisualDataGenerator.generatePostureData();
  console.log('Posture data:', {
    stance: postureData.stance,
    alignment: postureData.alignment,
    confidence: postureData.confidence
  });
  console.log('');

  // Test 5: Generate emotion data
  console.log('📊 Test 5: Emotion Data Generation');
  const emotionData = VisualDataGenerator.generateEmotionData();
  console.log('Emotion data:', {
    primaryEmotion: emotionData.primaryEmotion,
    confidence: emotionData.confidence,
    secondaryEmotions: emotionData.secondaryEmotions
  });
  console.log('');

  // Test 6: Generate complete visual feedback
  console.log('📊 Test 6: Complete Visual Feedback Generation');
  const visualFeedback = VisualDataGenerator.generateVisualFeedback();
  console.log('Visual feedback:', {
    overallScore: visualFeedback.overallScore,
    eyeContact: visualFeedback.eyeContact?.score,
    facialExpression: visualFeedback.facialExpression?.score,
    posture: visualFeedback.posture?.score,
    gestures: visualFeedback.gestures?.score
  });
  console.log('');

  // Test 7: Generate training dataset
  console.log('📊 Test 7: Training Dataset Generation');
  const trainingDataset = VisualDataGenerator.generateTrainingDataset(100);
  console.log(`Generated ${trainingDataset.length} training samples`);
  console.log('Sample training data:', {
    sessionId: trainingDataset[0].sessionId,
    skillLevel: trainingDataset[0].skillLevel,
    overallScore: trainingDataset[0].overallScore
  });
  console.log('');

  // Test 8: Train and evaluate machine learning model
  console.log('🤖 Test 8: Machine Learning Model Training and Evaluation');
  const modelResults = VisualDataGenerator.trainAndEvaluateModel(80, 20);
  
  console.log('Training Results:', modelResults.trainingResults);
  console.log('Evaluation Results:', {
    accuracy: `${(modelResults.evaluationResults.accuracy * 100).toFixed(2)}%`,
    detailedMetrics: modelResults.evaluationResults.detailedMetrics
  });
  console.log('');

  // Test 9: Test model predictions
  console.log('🔮 Test 9: Model Predictions on New Data');
  const predictions = VisualDataGenerator.testModelPredictions(modelResults.model, 30);
  
  console.log('Prediction Results:');
  console.log(`Total predictions: ${predictions.length}`);
  console.log(`Correct predictions: ${predictions.filter(p => p.correct).length}`);
  console.log(`Accuracy: ${(predictions.filter(p => p.correct).length / predictions.length * 100).toFixed(2)}%`);
  
  // Show sample predictions
  console.log('Sample predictions:');
  predictions.slice(0, 5).forEach(pred => {
    console.log(`  Sample ${pred.sampleId}: Actual=${pred.actualSkillLevel}, Predicted=${pred.predictedSkillLevel}, Confidence=${(pred.confidence * 100).toFixed(1)}%`);
  });
  console.log('');

  // Test 10: Model persistence
  console.log('💾 Test 10: Model Persistence');
  const modelJson = modelResults.modelJson;
  console.log(`Model saved as JSON (${modelJson.length} characters)`);
  
  // Create new model and load saved model
  const newModel = new (VisualDataGenerator as any).NaiveBayesModel();
  newModel.loadModel(modelJson);
  
  // Test prediction with loaded model
  const testSample = VisualDataGenerator.generateVisualFeedback();
  const prediction = newModel.predict(testSample);
  console.log('Prediction with loaded model:', {
    prediction: prediction.prediction,
    confidence: `${(prediction.confidence * 100).toFixed(1)}%`
  });
  console.log('');

  // Test 11: Dataset statistics
  console.log('📈 Test 11: Dataset Statistics');
  const datasetStats = VisualDataGenerator.generateDatasetStatistics(500);
  console.log('Dataset statistics:', {
    totalSessions: datasetStats.totalSessions,
    averageScore: datasetStats.averageScore,
    scoreDistribution: datasetStats.scoreDistribution,
    skillLevelBreakdown: datasetStats.skillLevelBreakdown
  });
  console.log('');

  console.log('✅ All tests completed successfully!');
  console.log('\n🎯 Key Results:');
  console.log(`- Model Accuracy: ${(modelResults.evaluationResults.accuracy * 100).toFixed(2)}%`);
  console.log(`- Training Samples: ${modelResults.trainingResults.trainSize}`);
  console.log(`- Test Samples: ${modelResults.trainingResults.testSize}`);
  console.log(`- Prediction Accuracy: ${(predictions.filter(p => p.correct).length / predictions.length * 100).toFixed(2)}%`);
}

/**
 * Run comprehensive model training demo
 */
function runModelTrainingDemo() {
  console.log('🚀 Starting Comprehensive Model Training Demo...\n');

  // Generate large dataset
  console.log('📊 Phase 1: Generating Large Training Dataset');
  const largeDataset = VisualDataGenerator.generateTrainingDataset(2000);
  console.log(`Generated ${largeDataset.length} samples\n`);

  // Train model with different splits
  console.log('🤖 Phase 2: Training Models with Different Splits');
  const splits = [
    { train: 1600, test: 400, name: '80/20 Split' },
    { train: 1400, test: 600, name: '70/30 Split' },
    { train: 1200, test: 800, name: '60/40 Split' }
  ];

  splits.forEach(split => {
    console.log(`\n📚 ${split.name}:`);
    const results = VisualDataGenerator.trainAndEvaluateModel(split.train, split.test);
    console.log(`  Accuracy: ${(results.evaluationResults.accuracy * 100).toFixed(2)}%`);
    console.log(`  Training samples: ${results.trainingResults.trainSize}`);
    console.log(`  Test samples: ${results.trainingResults.testSize}`);
  });

  // Test model on new data
  console.log('\n🔮 Phase 3: Testing Model on New Data');
  const bestModel = VisualDataGenerator.trainAndEvaluateModel(1600, 400).model;
  const newPredictions = VisualDataGenerator.testModelPredictions(bestModel, 100);
  
  console.log(`Prediction accuracy on new data: ${(newPredictions.filter(p => p.correct).length / newPredictions.length * 100).toFixed(2)}%`);

  // Analyze prediction confidence
  const avgConfidence = newPredictions.reduce((sum, p) => sum + p.confidence, 0) / newPredictions.length;
  console.log(`Average prediction confidence: ${(avgConfidence * 100).toFixed(2)}%`);

  console.log('\n✅ Model Training Demo Completed!');
} 