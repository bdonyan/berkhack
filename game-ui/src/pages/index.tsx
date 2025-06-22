import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Mic, Video, Trophy, BarChart3, Users, Settings, Download, Database } from 'lucide-react';
import { EloScoringSystem } from '../utils/EloScoringSystem';
import { VisualDataGenerator } from '../utils/VisualDataGenerator';
import { AudienceSimulator } from '@/components/AudienceSimulator';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import { SessionControls } from '@/components/SessionControls';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { DetailedAnalysis } from '@/components/DetailedAnalysis';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { useGameStore } from '../stores/gameStore';
import { useMediaStream } from '@/hooks/useMediaStream';
import toast from 'react-hot-toast';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

export default function Home() {
  const {
    isSessionActive,
    speechFeedback,
    visualFeedback,
    audienceReaction,
    currentEloRating,
    sessionHistory,
    settings,
    startSession: startSessionState,
    endSession: endSessionState,
    setSpeechFeedback,
    setVisualFeedback,
    setAudienceReaction,
  } = useGameStore();

  const [voiceSocket, setVoiceSocket] = useState<Socket | null>(null);
  const [visionSocket, setVisionSocket] = useState<Socket | null>(null);
  const { stream, startStream, stopStream, toggleMic, toggleVideo, isMicOn, isVideoOn } = useMediaStream();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [transcriptReady, setTranscriptReady] = useState(false);
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [isEnding, setIsEnding] = useState(false);
  const [visualSkillPrediction, setVisualSkillPrediction] = useState<{ predicted: string; confidence: number } | null>(null);

  const eloSystem = new EloScoringSystem();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Calculate session duration
  const sessionDuration = sessionStartTime > 0 ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

  // Calculate overall score
  const calculateOverallScore = () => {
    const speechScore = speechFeedback?.overallScore || 0;
    const visualScore = visualFeedback?.overallScore || 0;
    return Math.round((speechScore + visualScore) / 2);
  };

  const overallScore = calculateOverallScore();

  // Scroll to dashboard when it becomes visible
  useEffect(() => {
    if (showAnalysisDashboard) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 500);
    }
  }, [showAnalysisDashboard]);

  // Whenever visualFeedback changes, update the prediction
  useEffect(() => {
    if (visualFeedback) {
      setVisualSkillPrediction(VisualDataGenerator.getVisualSkillPrediction(visualFeedback));
    }
  }, [visualFeedback]);

  const handleStartNewSession = () => {
    setShowAnalysisDashboard(false);
    startSession();
  };

  const initializeConnections = () => {
    const vSocket = io(process.env.NEXT_PUBLIC_VOICE_WS_URL || 'ws://localhost:3001');
    const visSocket = io(process.env.NEXT_PUBLIC_VISION_WS_URL || 'ws://localhost:3002');

    vSocket.on('connect', () => console.log('Voice AI connected'));
    visSocket.on('connect', () => console.log('Vision AI connected'));

    vSocket.on('speech_feedback', (data) => setSpeechFeedback(data));
    visSocket.on('visual_feedback', (data) => setVisualFeedback(data));
    
    setVoiceSocket(vSocket);
    setVisionSocket(visSocket);
  };

  const terminateConnections = () => {
    if (voiceSocket) voiceSocket.disconnect();
    if (visionSocket) visionSocket.disconnect();
    setVoiceSocket(null);
    setVisionSocket(null);
  };

  const startSession = async () => {
    const sessionId = new Date().getTime().toString();
    setCurrentSessionId(sessionId);
    setTranscriptReady(false);
    setShowAnalysisDashboard(false);
    setSessionStartTime(Date.now());
    await startStream();
    startSessionState(sessionId);
    initializeConnections();
    toast.success('Session started! Recording...');
  };

  const endSession = async () => {
    if (isEnding) return;
    setIsEnding(true);

    terminateConnections();
    const recordingResult = await stopStream();

    if (recordingResult) {
      const { blob: recordedBlob, duration } = recordingResult;
      const url = URL.createObjectURL(recordedBlob);
      toast.success(
        (t) => (
          <span className="flex items-center">
            Recording saved!
            <a
              href={url}
              download={`eloquence-session-${new Date().toISOString()}.webm`}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </a>
          </span>
        ),
        {
          duration: 10000, // Keep the toast open longer
        }
      );
      try {
        toast.loading('Analyzing your speech...');
        const audioBase64 = await blobToBase64(recordedBlob);
        // Use environment variable or fallback to default port
        const voiceApiUrl = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${voiceApiUrl}/analyze-speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioData: audioBase64,
            sessionId: currentSessionId,
            duration,
          }),
        });
        toast.dismiss();
        if (response.ok) {
          const feedback = await response.json();
          setSpeechFeedback(feedback);
          toast.success('Transcript processed and saved!');
          setTranscriptReady(true);
          // Set mock visual feedback for testing
          setVisualFeedback(VisualDataGenerator.generateVisualFeedback());
          // Show analysis dashboard after processing is complete
          setTimeout(() => {
            setShowAnalysisDashboard(true);
          }, 1000);
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.details || errorData.error || 'Failed to process transcript.';
          toast.error(`Error: ${errorMessage}`);
          // Set mock data even if speech analysis fails
          setSpeechFeedback(VisualDataGenerator.generateSpeechFeedback());
          setVisualFeedback(VisualDataGenerator.generateVisualFeedback());
          // Show dashboard even if there's an error, with available data
          setTimeout(() => {
            setShowAnalysisDashboard(true);
          }, 1000);
        }
      } catch (error) {
        toast.dismiss();
        console.error("Failed to send audio for analysis", error);
        toast.error('Failed to send audio for analysis.');
        // Set mock data even if there's an error
        setSpeechFeedback(VisualDataGenerator.generateSpeechFeedback());
        setVisualFeedback(VisualDataGenerator.generateVisualFeedback());
        // Show dashboard even if there's an error, with available data
        setTimeout(() => {
          setShowAnalysisDashboard(true);
        }, 1000);
      } finally {
        endSessionState();
        setIsEnding(false);
      }
    } else {
      // Set mock data even if no recording was made
      setSpeechFeedback(VisualDataGenerator.generateSpeechFeedback());
      setVisualFeedback(VisualDataGenerator.generateVisualFeedback());
      // Show dashboard even if no recording was made
      setTimeout(() => {
        setShowAnalysisDashboard(true);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Eloquence.AI - Public Speaking Trainer</title>
        <meta name="description" content="Real-time public speaking feedback with AI-powered analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🗣️ Eloquence.AI
          </h1>
          <p className="text-xl text-gray-600">
            Master public speaking with real-time AI feedback
          </p>
        </motion.div>

        {/* Elo Rating Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Elo Rating</h2>
              <p className="text-gray-600">Your public speaking skill level</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">{currentEloRating}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
          
          {/* Rating Badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentEloRating >= 1500 ? 'bg-success-100 text-success-800' :
              currentEloRating >= 1200 ? 'bg-primary-100 text-primary-800' :
              currentEloRating >= 900 ? 'bg-warning-100 text-warning-800' :
              'bg-danger-100 text-danger-800'
            }`}>
              <Trophy className="w-4 h-4 mr-1" />
              {currentEloRating >= 1500 ? 'Expert Speaker' :
               currentEloRating >= 1200 ? 'Advanced Speaker' :
               currentEloRating >= 900 ? 'Intermediate Speaker' :
               'Beginner Speaker'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Session Area */}
          <div className="lg:col-span-2 space-y-6">
            {isSessionActive && (
              <motion.div
                className="bg-black rounded-lg shadow-lg aspect-video flex items-center justify-center text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg" />
              </motion.div>
            )}
            {/* Session Controls */}
            <SessionControls 
              isSessionActive={isSessionActive}
              onStartSession={startSession}
              onEndSession={endSession}
              onToggleMic={toggleMic}
              onToggleVideo={toggleVideo}
              isMicActive={isMicOn}
              isVideoActive={isVideoOn}
              isEnding={isEnding}
            />

            {/* Debug Button - Remove this in production */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setSpeechFeedback(VisualDataGenerator.generateSpeechFeedback());
                  setVisualFeedback(VisualDataGenerator.generateVisualFeedback());
                  setShowAnalysisDashboard(true);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                🧪 Show Dashboard (Debug)
              </button>
            </div>

            {/* Audience Simulator */}
            <AudienceSimulator 
              engagement={audienceReaction?.engagement || 0}
              attention={audienceReaction?.attention || 0}
              positiveFeedback={audienceReaction?.positiveFeedback || 0}
            />

            {/* Real-time Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeedbackPanel speechFeedback={speechFeedback} visualFeedback={visualFeedback} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <PerformanceMetrics />

            {/* Detailed Analysis */}
            <DetailedAnalysis speechFeedback={speechFeedback} />

            {/* Transcript Viewer */}
            <TranscriptViewer 
              sessionId={!isSessionActive && currentSessionId ? currentSessionId : undefined} 
              transcriptReady={transcriptReady}
            />

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{sessionHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-semibold text-success-600">
                    {Math.max(0, ...sessionHistory.map(s => s.score || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold">
                    {sessionHistory.length > 0
                      ? Math.round(sessionHistory.reduce((acc, s) => acc + (s.score || 0), 0) / sessionHistory.length)
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Win Streak</span>
                  <span className="font-semibold text-primary-600">0</span>
                </div>
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked={settings.enableRealTimeFeedback} readOnly />
                  <span className="text-sm text-gray-600">Real-time feedback</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked={settings.enableAudienceReactions} readOnly />
                  <span className="text-sm text-gray-600">Audience reactions</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked={settings.enableEloScoring} readOnly />
                  <span className="text-sm text-gray-600">Elo scoring</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Advanced difficulty</span>
                </label>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Analysis Dashboard */}
      <AnalysisDashboard 
        speechFeedback={speechFeedback}
        visualFeedback={visualFeedback}
        isVisible={showAnalysisDashboard}
        overallScore={overallScore}
        sessionDuration={sessionDuration}
        onStartNewSession={handleStartNewSession}
        onClose={() => setShowAnalysisDashboard(false)}
        visualSkillPrediction={visualSkillPrediction}
      />
    </div>
  );
} 