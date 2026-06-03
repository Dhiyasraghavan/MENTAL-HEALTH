import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleGenAI,
  Modality,
  Type,
  FunctionDeclaration,
  LiveServerMessage,
} from "@google/genai";
import { AnalysisResult, TranscriptionTurn } from "../types";
import {
  encode,
  decode,
  decodeAudioData,
  float32ToInt16,
} from "../utils/audio-helpers";
import LiveVisualizer from "./LiveVisualizer";

// Declare faceapi global from script tag
declare const faceapi: any;

interface SessionViewProps {
  onComplete: (result: AnalysisResult) => void;
}

const SessionView: React.FC<SessionViewProps> = ({ onComplete }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionTurn[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentEmotion, setCurrentEmotion] =
    useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptBufferRef = useRef({ user: "", model: "" });
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const TOTAL_QUESTIONS = 25;

  const submitAnalysisFunction: FunctionDeclaration = {
    name: "submitAnalysis",
    parameters: {
      type: Type.OBJECT,
      description:
        "Submit the final deep psychological analysis after 25 questions, incorporating visual emotional data.",
      properties: {
        score: {
          type: Type.NUMBER,
          description:
            "Well-being score (0-100). Deduct points for significant emotional incongruence (e.g., smiling while describing sad events).",
        },
        summary: {
          type: Type.STRING,
          description:
            "Summary of psychological profile and identified problems based on 25 questions.",
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A minimum of 5 actionable solutions.",
        },
        emotionalCongruence: {
          type: Type.STRING,
          description:
            "A detailed analysis of the match between facial expressions and verbal content.",
        },
      },
      required: ["score", "summary", "recommendations", "emotionalCongruence"],
    },
  };

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    sourcesRef.current.clear();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    async function loadModels() {
      const MODEL_URL =
        "https://justadudewhohacks.github.io/face-api.js/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
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
            facingMode: "user",
          },
        });
        streamRef.current = stream;

        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )({ sampleRate: 16000 });
        outputAudioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )({ sampleRate: 24000 });

        const sessionPromise = ai.live.connect({
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are Dr. Aris, a psychological doctor. You see and hear the user.
            
            MANDATORY PROTOCOL:
            1. Conduct a full 25-question diagnostic (ask one by one).
            2. CONGRUENCE CHECK: Observe the user's face. 
               - If the user says they are "sad", "stressed", or "depressed" but their face is HAPPY/SMILING, you MUST confront them.
               - Example: "You say you are feeling low, but I see a smile on your face. This mismatch is a significant clinical marker. Why do you think your expressions don't match your feelings?"
               - MARK THESE DISCREPANCIES AS FALSE/INCONGRUENT.
            3. SCORING: For every major incongruence found, reduce the final 'Vitality Index' score by 10 points.
            4. After Question 25, provide the 'submitAnalysis'.`,
            tools: [{ functionDeclarations: [submitAnalysisFunction] }],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              const source =
                audioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor =
                audioContextRef.current!.createScriptProcessor(4096, 1, 1);

              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Data = float32ToInt16(inputData);
                const pcmBlob = {
                  data: encode(new Uint8Array(int16Data.buffer)),
                  mimeType: "audio/pcm;rate=16000",
                };
                sessionPromise.then((session) => {
                  if (session) session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);

              // Vision & Emotion Loop
              frameIntervalRef.current = window.setInterval(async () => {
                if (
                  videoRef.current &&
                  canvasRef.current &&
                  sessionRef.current &&
                  videoRef.current.readyState >= 2
                ) {
                  const ctx = canvasRef.current.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                    const base64Data = canvasRef.current
                      .toDataURL("image/jpeg", 0.6)
                      .split(",")[1];

                    sessionRef.current.sendRealtimeInput({
                      media: { data: base64Data, mimeType: "image/jpeg" },
                    });

                    try {
                      const detections = await faceapi
                        .detectSingleFace(
                          videoRef.current,
                          new faceapi.TinyFaceDetectorOptions(),
                        )
                        .withFaceExpressions();
                      if (detections) {
                        const sorted = Object.entries(
                          detections.expressions,
                        ).sort((a: any, b: any) => b[1] - a[1]);
                        const emotion = sorted[0][0];
                        setCurrentEmotion(
                          emotion.charAt(0).toUpperCase() + emotion.slice(1),
                        );
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
                transcriptBufferRef.current.model +=
                  message.serverContent.outputTranscription.text;
              } else if (message.serverContent?.inputTranscription) {
                transcriptBufferRef.current.user +=
                  message.serverContent.inputTranscription.text;
              }

              if (message.serverContent?.turnComplete) {
                const userText = transcriptBufferRef.current.user.trim();
                const modelText = transcriptBufferRef.current.model.trim();
                if (userText)
                  setTranscriptions((prev) => [
                    ...prev,
                    { role: "user", text: userText },
                  ]);
                if (modelText) {
                  setTranscriptions((prev) => [
                    ...prev,
                    { role: "model", text: modelText },
                  ]);
                  setQuestionCount((prev) =>
                    Math.min(TOTAL_QUESTIONS, prev + 1),
                  );
                }
                transcriptBufferRef.current = { user: "", model: "" };
              }

              const base64Audio =
                message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                setIsModelTalking(true);
                const buffer = await decodeAudioData(
                  decode(base64Audio),
                  outputAudioContextRef.current,
                  24000,
                  1,
                );
                const source =
                  outputAudioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(outputAudioContextRef.current.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsModelTalking(false);
                };
                source.start(
                  Math.max(
                    nextStartTimeRef.current,
                    outputAudioContextRef.current.currentTime,
                  ),
                );
                nextStartTimeRef.current =
                  Math.max(
                    nextStartTimeRef.current,
                    outputAudioContextRef.current.currentTime,
                  ) + buffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach((s) => {
                  try {
                    s.stop();
                  } catch (e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsModelTalking(false);
              }

              if (message.toolCall && message.toolCall.functionCalls) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === "submitAnalysis") {
                    onComplete(fc.args as unknown as AnalysisResult);
                    cleanup();
                  }
                }
              }
            },
            onerror: (e) => {
              console.error("Session Error:", e);
              setError("The session encountered a communication error.");
            },
          },
        });
        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        console.error("Init Error:", err);
        setError(
          err.message || "Could not start camera. Please check permissions.",
        );
      }
    }
    initSession();
    return cleanup;
  }, [onComplete, cleanup]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50 rounded-3xl border border-rose-200 p-8 shadow-inner text-center">
        <h3 className="text-xl font-bold text-rose-800 mb-2">
          Technical Obstacle
        </h3>
        <p className="text-rose-600 mb-8 max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black"
        >
          Retry Diagnostics
        </button>
      </div>
    );
  }

  const progress = (questionCount / TOTAL_QUESTIONS) * 100;

  return (
    <div className="flex flex-col h-full gap-5 animate-in fade-in duration-700">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Assessment Depth
            </span>
            <span className="text-sm font-black text-indigo-600">
              {questionCount} / {TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Detected Emotion
            </span>
            <span className="text-lg font-black tracking-tight text-slate-700">
              {currentEmotion}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative flex flex-col justify-center items-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[350px]">
          <LiveVisualizer
            isActive={!isConnecting}
            isModelTalking={isModelTalking}
          />
          <div className="absolute bottom-8 px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-[0.2em] shadow-2xl">
            {isModelTalking ? "DR. ARIS SPEAKING" : "WAITING FOR INPUT"}
          </div>
        </div>

        <div className="relative bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[350px] flex items-center justify-center">
          {/* Video element is always present to avoid ref issues during initialization */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] ${isConnecting ? "opacity-0" : "opacity-100"}`}
          />
          <canvas ref={canvasRef} className="hidden" width="320" height="240" />

          {isConnecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900">
              <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">
                Syncing Video Pipeline...
              </p>
            </div>
          )}

          {!isConnecting && (
            <>
              <div className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  Active Diagnostics
                </span>
              </div>
              <div className="absolute bottom-6 left-6 flex flex-col">
                <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">
                  Biometric Feed 01
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-effect rounded-[2rem] p-5 border border-slate-200 shadow-sm max-h-48 overflow-hidden flex flex-col relative">
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {transcriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-4 font-black text-[10px]">
              NO DATA RECEIVED
            </div>
          ) : (
            transcriptions.slice(-5).map((turn, idx) => (
              <div
                key={idx}
                className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-2.5 rounded-2xl text-[13px] border ${
                    turn.role === "user"
                      ? "bg-indigo-600 text-white border-indigo-700"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
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

export default SessionView;
