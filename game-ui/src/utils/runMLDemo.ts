const { VisualDataGenerator } = require('./VisualDataGenerator');
const { testVisualDataGenerator, runModelTrainingDemo } = require('./testVisualData');

/**
 * Run the machine learning demo
 */
function runMLDemo() {
  console.log('🎯 Eloquence.AI - Machine Learning Demo');
  console.log('=====================================\n');

  // Test 1: Generate training dataset
  console.log('📊 Test 1: Generating Training Dataset');
  const trainingDataset = VisualDataGenerator.generateTrainingDataset(100);
  console.log(`Generated ${trainingDataset.length} training samples`);
  console.log('Sample training data:', {
    sessionId: trainingDataset[0].sessionId,
    skillLevel: trainingDataset[0].skillLevel,
    overallScore: trainingDataset[0].overallScore
  });
  console.log('');

  // Test 2: Train and evaluate machine learning model
  console.log('🤖 Test 2: Machine Learning Model Training and Evaluation');
  const modelResults = VisualDataGenerator.trainAndEvaluateModel(80, 20);
  
  console.log('Training Results:', modelResults.trainingResults);
  console.log('Evaluation Results:', {
    accuracy: `${(modelResults.evaluationResults.accuracy * 100).toFixed(2)}%`,
    detailedMetrics: modelResults.evaluationResults.detailedMetrics
  });
  console.log('');

  // Test 3: Test model predictions
  console.log('🔮 Test 3: Model Predictions on New Data');
  const predictions = VisualDataGenerator.testModelPredictions(modelResults.model, 30);
  
  console.log('Prediction Results:');
  console.log(`Total predictions: ${predictions.length}`);
  console.log(`Correct predictions: ${predictions.filter((p: any) => p.correct).length}`);
  console.log(`Accuracy: ${(predictions.filter((p: any) => p.correct).length / predictions.length * 100).toFixed(2)}%`);
  
  // Show sample predictions
  console.log('Sample predictions:');
  predictions.slice(0, 5).forEach((pred: any) => {
    console.log(`  Sample ${pred.sampleId}: Actual=${pred.actualSkillLevel}, Predicted=${pred.predictedSkillLevel}, Confidence=${(pred.confidence * 100).toFixed(1)}%`);
  });
  console.log('');

  // Test 4: Model persistence
  console.log('💾 Test 4: Model Persistence');
  const modelJson = modelResults.modelJson;
  console.log(`Model saved as JSON (${modelJson.length} characters)`);
  
  // Create new model and load saved model
  const NaiveBayesModel = (VisualDataGenerator as any).NaiveBayesModel;
  const newModel = new NaiveBayesModel();
  newModel.loadModel(modelJson);
  
  // Test prediction with loaded model
  const testSample = VisualDataGenerator.generateVisualFeedback();
  const prediction = newModel.predict(testSample);
  console.log('Prediction with loaded model:', {
    prediction: prediction.prediction,
    confidence: `${(prediction.confidence * 100).toFixed(1)}%`
  });
  console.log('');

  // Test 5: Comprehensive training demo
  console.log('🚀 Test 5: Comprehensive Training Demo');
  console.log('Training models with different splits...');
  
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
  console.log('\n🔮 Testing Model on New Data');
  const bestModel = VisualDataGenerator.trainAndEvaluateModel(1600, 400).model;
  const newPredictions = VisualDataGenerator.testModelPredictions(bestModel, 100);
  
  console.log(`Prediction accuracy on new data: ${(newPredictions.filter((p: any) => p.correct).length / newPredictions.length * 100).toFixed(2)}%`);

  // Analyze prediction confidence
  const avgConfidence = newPredictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / newPredictions.length;
  console.log(`Average prediction confidence: ${(avgConfidence * 100).toFixed(2)}%`);

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Machine Learning Demo Completed!');
  console.log('The system now demonstrates:');
  console.log('✅ Realistic computer vision data generation');
  console.log('✅ Naive Bayes model training');
  console.log('✅ Model evaluation with accuracy metrics');
  console.log('✅ Prediction testing on new data');
  console.log('✅ Model persistence and loading');
  console.log('✅ Train/test split validation');
}

// Run the demo
runMLDemo(); 