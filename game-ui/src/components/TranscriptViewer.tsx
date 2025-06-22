import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Clock } from 'lucide-react';

interface Transcript {
  sessionId: string;
  timestamp: string;
  transcript: string;
}

interface TranscriptViewerProps {
  sessionId?: string;
  transcriptReady: boolean;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ sessionId, transcriptReady }) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId && transcriptReady) {
      fetchTranscript(sessionId);
    } else {
      fetchAllTranscripts();
    }
  }, [sessionId, transcriptReady]);

  const fetchTranscript = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/transcript/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentTranscript(data.transcript);
      } else {
        console.error("Transcript not found.");
      }
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
    }
    setLoading(false);
  };

  const fetchAllTranscripts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/transcripts');
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data.transcripts);
      }
    } catch (error) {
      console.error('Failed to fetch transcripts:', error);
    }
    setLoading(false);
  };

  const downloadTranscript = (transcript: string, sessionId: string) => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (sessionId && currentTranscript) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Session Transcript
          </h3>
          <button
            onClick={() => downloadTranscript(currentTranscript, sessionId)}
            className="flex items-center px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <p className="text-gray-800 whitespace-pre-wrap">{currentTranscript}</p>
        </div>
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Transcripts
        </h3>
        <p className="text-gray-600 text-center py-8">No transcripts available yet. Start a session to generate transcripts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Recent Transcripts
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transcripts.map((transcript) => (
          <div key={transcript.sessionId} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(transcript.timestamp).toLocaleDateString()}
                <Clock className="w-4 h-4 ml-3 mr-1" />
                {new Date(transcript.timestamp).toLocaleTimeString()}
              </div>
              <button
                onClick={() => downloadTranscript(transcript.transcript, transcript.sessionId)}
                className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <Download className="w-3 h-3 mr-1" />
                Save
              </button>
            </div>
            <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-800 line-clamp-3">
                {transcript.transcript.length > 200 
                  ? `${transcript.transcript.substring(0, 200)}...` 
                  : transcript.transcript}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 