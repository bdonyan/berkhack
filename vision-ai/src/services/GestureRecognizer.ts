export class GestureRecognizer {
  async recognizeGestures(imageData: string) {
    // Mock implementation for now
    return {
      score: Math.random() * 100,
      gestures: ['hand_gesture', 'pointing'],
      confidence: 0.7
    };
  }
} 