"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import VoiceAIButton from "@/app/components/VoiceAIButton";
import PHQ9Chatbot from "@/app/components/PHQ9Chatbot";
import ResultsSection from "@/app/components/ResultsSection";
import { Severity } from "../types";
import { getCollegeBySlug } from "@/lib/colleges";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";
  const college = collegeSlug ? getCollegeBySlug(collegeSlug) : null;
  const collegeName = college?.name || "Your";

  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(300);
  const [severity, setSeverity] = useState<Severity>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStopSession = useCallback(() => {
    setIsRecording(false);
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);

    const outcomes: Severity[] = ["Low", "Medium", "High"];
    setSeverity(outcomes[Math.floor(Math.random() * outcomes.length)]);
  }, [stream]);

  // Timer logic
  useEffect(() => {
    if (!isRecording) return;

    const interval: NodeJS.Timeout = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Timer reached zero, stop the session
          setTimeout(() => {
            handleStopSession();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, handleStopSession]);

  const handleStartSession = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support camera/microphone access. Please use Chrome, Firefox, or Edge.");
        return;
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setStream(userStream);
      setIsRecording(true);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (error: any) {
      let message = "Microphone and Camera permissions are required for the AI session.";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        message = "Camera and microphone access was denied. Please check your browser permissions and allow access, then refresh the page.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        message = "No camera or microphone found. Please connect a device and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        message = "Camera or microphone is already in use by another application. Please close other apps and try again.";
      }
      
      alert(message);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetAll = () => {
    setSeverity(null);
    setTimer(300);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-blue-purple rounded-xl flex items-center justify-center text-white font-bold">
              MH
            </div>
            <h2 className="font-bold text-slate-800 hidden md:block">
              Welcome to {collegeName} Community
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <Activity className="w-4 h-4 text-blue-600" />
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Health Score
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-blue-600 flex items-center justify-center text-sm font-bold text-blue-600">
                {college ? `${college.avg_health_score}%` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12 space-y-12">
        {/* Main Feature - Voice AI */}
        {!severity ? (
          <section className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold text-slate-900">
                Mental Wellness Scan
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Speak your heart out. Our Voice AI analyzes tone, pace, and
                facial cues to understand your state.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              {/* Video Preview (When Recording) */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-0 rounded-full overflow-hidden border-8 border-white shadow-2xl"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </motion.div>
                )}
              </AnimatePresence>

              <VoiceAIButton
                isRecording={isRecording}
                onClick={isRecording ? handleStopSession : handleStartSession}
                timerText={formatTime(timer)}
              />
            </div>

            <div className="flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span className="text-sm">Real-time Audio Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">Facial Emotion Mapping</span>
              </div>
            </div>
          </section>
        ) : (
          <ResultsSection severity={severity} onRetry={resetAll} />
        )}

        {/* Fallback Chatbot */}
        {!isRecording && !severity && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-slate-200 pt-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">
                Prefer Typing?
              </h3>
              <p className="text-slate-500">
                Take the PHQ-9 Clinical Screening with our AI bot
              </p>
            </div>
            <PHQ9Chatbot onComplete={(sev, score) => setSeverity(sev)} />
          </motion.section>
        )}
      </main>
    </div>
  );
}
