"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration, LiveServerMessage } from '@google/genai';
import { Severity } from '@/lib/types';
import { encode, decode, decodeAudioData, float32ToInt16 } from '@/lib/utils/audio-helpers';
import LiveVisualizer from './LiveVisualizer';

// Declare faceapi global from script tag
declare const faceapi: any;

interface DrArisSessionProps {
  onComplete: (severity: Severity, score: number, recommendations: string[]) => void;
  onError?: (error: string) => void;
}

interface TranscriptionTurn {
  role: 'user' | 'model';
  text: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  recommendations: string[];
  emotionalCongruence?: string;
}

const DrArisSession: React.FC<DrArisSessionProps> = ({ onComplete, onError }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionTurn[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [isEndingEarly, setIsEndingEarly] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptBufferRef = useRef({ user: '', model: '' });
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const TOTAL_QUESTIONS = 10;

  const submitAnalysisFunction: FunctionDeclaration = {
    name: 'submitAnalysis',
    parameters: {
      type: Type.OBJECT,
      description: 'Submit the final deep psychological analysis after 10 questions, incorporating visual emotional data.',
      properties: {
        score: { type: Type.NUMBER, description: 'Well-being score (0-100). Deduct points for significant emotional incongruence (e.g., smiling while describing sad events).' },
        summary: { type: Type.STRING, description: 'Summary of psychological profile and identified problems based on 10 questions.' },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A minimum of 5 actionable solutions.'
        },
        emotionalCongruence: { type: Type.STRING, description: 'A detailed analysis of the match between facial expressions and verbal content.' }
      },
      required: ['score', 'summary', 'recommendations', 'emotionalCongruence'],
    },
  };

  const convertScoreToSeverity = (score: number): Severity => {
    if (score >= 70) return "Low";
    if (score >= 40) return "Medium";
    return "High";
  };

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors
      }
    });
    sourcesRef.current.clear();
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore errors
      }
    }
    if (outputAudioContextRef.current) {
      try {
        outputAudioContextRef.current.close();
      } catch (e) {
        // Ignore errors
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Separate effect to handle video stream attachment
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [isConnecting]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      const errMsg = "Google AI API key not configured. Please add NEXT_PUBLIC_GOOGLE_AI_API_KEY to .env.local";
      setError(errMsg);
      if (onError) onError(errMsg);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    async function loadModels() {
      if (typeof window === 'undefined' || !(window as any).faceapi) {
        throw new Error("face-api.js not loaded. Please ensure the script is included in layout.");
      }
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
      } catch (e) {
        console.error("Model load failed", e);
        throw new Error("Failed to load facial recognition models.");
      }
    }

    async function initSession() {
      try {
        await loadModels();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        streamRef.current = stream;

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are Dr. Aris, a psychological doctor. You see and hear the user.
            
            MANDATORY PROTOCOL:
            1. Conduct a full 10-question diagnostic (ask one by one).
            2. CONGRUENCE CHECK: Observe the user's face. 
               - If the user says they are "sad", "stressed", or "depressed" but their face is HAPPY/SMILING, you MUST confront them.
               - Example: "You say you are feeling low, but I see a smile on your face. This mismatch is a significant clinical marker. Why do you think your expressions don't match your feelings?"
               - MARK THESE DISCREPANCIES AS FALSE/INCONGRUENT.
            3. SCORING: For every major incongruence found, reduce the final 'Vitality Index' score by 10 points.
            4. After Question 10, provide the 'submitAnalysis'.`,
            tools: [{ functionDeclarations: [submitAnalysisFunction] }],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              const source = audioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

              scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Data = float32ToInt16(inputData);
                const pcmBlob = { data: encode(new Uint8Array(int16Data.buffer)), mimeType: 'audio/pcm;rate=16000' };
                sessionPromise.then(session => {
                  if (session) session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);

              // Vision & Emotion Loop
              frameIntervalRef.current = window.setInterval(async () => {
                if (videoRef.current && canvasRef.current && sessionRef.current && videoRef.current.readyState >= 2) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                    const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];

                    sessionRef.current.sendRealtimeInput({
                      media: { data: base64Data, mimeType: 'image/jpeg' }
                    });

                    try {
                      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                      if (detections) {
                        const sorted = Object.entries(detections.expressions).sort((a: any, b: any) => b[1] - a[1]);
                        const emotion = sorted[0][0] as string;
                        setCurrentEmotion(emotion.charAt(0).toUpperCase() + emotion.slice(1));
                      } else {
                        setCurrentEmotion("Not Detected");
                      }
                    } catch (e) {
                      console.warn("Emotion detection glitch", e);
                    }
                  }
                }
              }, 1000);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.outputTranscription) {
                transcriptBufferRef.current.model += message.serverContent.outputTranscription.text;
              } else if (message.serverContent?.inputTranscription) {
                transcriptBufferRef.current.user += message.serverContent.inputTranscription.text;
              }

              if (message.serverContent?.turnComplete) {
                const userText = transcriptBufferRef.current.user.trim();
                const modelText = transcriptBufferRef.current.model.trim();
                if (userText) setTranscriptions(prev => [...prev, { role: 'user', text: userText }]);
                if (modelText) {
                  setTranscriptions(prev => [...prev, { role: 'model', text: modelText }]);
                  setQuestionCount(prev => Math.min(TOTAL_QUESTIONS, prev + 1));
                }
                transcriptBufferRef.current = { user: '', model: '' };
              }

              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                setIsModelTalking(true);
                const buffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(outputAudioContextRef.current.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsModelTalking(false);
                };
                source.start(Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime));
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime) + buffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsModelTalking(false);
              }

              if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls || []) {
                  if (fc.name === 'submitAnalysis') {
                    const result = fc.args as unknown as AnalysisResult;
                    const severity = convertScoreToSeverity(result.score);
                    setIsEndingEarly(false);
                    onComplete(severity, result.score, result.recommendations);
                    cleanup();
                  }
                }
              }
              
              // If ending early and we get a response, check if it contains analysis request
              if (isEndingEarly && message.serverContent?.modelTurn?.parts) {
                // The AI should respond and call submitAnalysis
                // This is handled by the toolCall above
              }
            },
            onerror: (e) => {
              console.error("Session Error:", e);
              const errMsg = "The session encountered a communication error.";
              setError(errMsg);
              if (onError) onError(errMsg);
            },
          }
        });
        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        console.error("Init Error:", err);
        const errMsg = err.message || "Could not start camera. Please check permissions.";
        setError(errMsg);
        if (onError) onError(errMsg);
      }
    }
    initSession();
    return cleanup;
  }, [onComplete, onError, cleanup]);

  const handleEndEarly = () => {
    if (sessionRef.current && !isConnecting && !isEndingEarly && questionCount < TOTAL_QUESTIONS) {
      setIsEndingEarly(true);
      try {
        // Send text message to end the session and request final analysis
        const endMessage = "STOP THE ASSESSMENT NOW. Based on our conversation so far, please immediately provide your final psychological analysis by calling the submitAnalysis function with your current assessment of my mental health status, score, and recommendations.";
        
        // Try to send text via sendRealtimeInput
        if (sessionRef.current && typeof sessionRef.current.sendRealtimeInput === 'function') {
          // Send as text input
          sessionRef.current.sendRealtimeInput({
            text: endMessage
          });
        } else if (sessionRef.current && typeof (sessionRef.current as any).send === 'function') {
          // Alternative: try send method if available
          (sessionRef.current as any).send([{ text: endMessage }]);
        } else {
          console.warn("No method available to send text message");
          setIsEndingEarly(false);
          return;
        }
        
        // Force question count to trigger completion logic
        setQuestionCount(TOTAL_QUESTIONS);
        
        // Add to transcriptions
        setTranscriptions(prev => [...prev, { role: 'user', text: 'Ending assessment early...' }]);
      } catch (err) {
        console.error("Error ending session early:", err);
        setIsEndingEarly(false);
        setError("Could not end session. Please wait for completion.");
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50 rounded-3xl border border-rose-200 p-8 shadow-inner text-center">
        <h3 className="text-xl font-bold text-rose-800 mb-2">Technical Obstacle</h3>
        <p className="text-rose-600 mb-8 max-w-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black">Retry Diagnostics</button>
      </div>
    );
  }

  const progress = (questionCount / TOTAL_QUESTIONS) * 100;

  return (
    <div className="flex flex-col h-full gap-5 animate-in fade-in duration-700">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Progress Section */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assessment Depth</span>
              <span className="text-sm font-black text-indigo-600">{questionCount} / {TOTAL_QUESTIONS}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden relative">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Emotion & End Button Section */}
          <div className="flex items-center gap-3 flex-shrink-0 justify-end xl:justify-start">
            <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 h-[46px]">
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Emotion</span>
                <span className="text-sm font-black tracking-tight text-slate-700 leading-tight">{currentEmotion}</span>
              </div>
            </div>

            <button
              onClick={handleEndEarly}
              disabled={isConnecting || questionCount >= TOTAL_QUESTIONS || isEndingEarly}
              className="h-[46px] px-6 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm active:scale-95 flex items-center justify-center min-w-[140px]"
            >
              {isEndingEarly ? "Ending..." : "End Assessment"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative flex flex-col justify-center items-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[350px]">
          <LiveVisualizer isActive={!isConnecting} isModelTalking={isModelTalking} />
          <div className="absolute bottom-8 px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-[0.2em] shadow-2xl">
            {isModelTalking ? "DR. ARIS SPEAKING" : "WAITING FOR INPUT"}
          </div>
        </div>

        <div className="relative bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[350px] flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] ${isConnecting ? 'opacity-0' : 'opacity-100'}`}
          />
          <canvas ref={canvasRef} className="hidden" width="320" height="240" />

          {isConnecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900">
              <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Syncing Video Pipeline...</p>
            </div>
          )}

          {!isConnecting && (
            <>
              <div className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Diagnostics</span>
              </div>
              <div className="absolute bottom-6 left-6 flex flex-col">
                <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">Biometric Feed 01</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-effect rounded-[2rem] p-5 border border-slate-200 shadow-sm max-h-48 overflow-hidden flex flex-col relative">
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {transcriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-4 font-black text-[10px]">NO DATA RECEIVED</div>
          ) : (
            transcriptions.slice(-5).map((turn, idx) => (
              <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-2.5 rounded-2xl text-[13px] border ${turn.role === 'user' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                  {turn.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DrArisSession;
