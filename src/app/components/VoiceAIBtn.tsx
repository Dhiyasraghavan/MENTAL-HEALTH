"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Severity } from "@/lib/types";
import DrArisSession from "./DrArisSession";

interface Props {
  onComplete: (severity: Severity, score: number, recommendations: string[]) => void;
}

export default function VoiceAIBtn({ onComplete }: Props) {
  const [showDrAris, setShowDrAris] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = () => {
    // Check if Google AI API key is configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
      setError("Dr. Aris AI requires Google AI API key. Please configure NEXT_PUBLIC_GOOGLE_AI_API_KEY in .env.local");
      return;
    }

    // Check if face-api.js is loaded
    if (typeof window !== 'undefined' && !(window as any).faceapi) {
      setError("Face detection library is loading. Please wait a moment and try again.");
      setTimeout(() => {
        if ((window as any).faceapi) {
          setError(null);
          setShowDrAris(true);
        }
      }, 2000);
      return;
    }

    setError(null);
    setShowDrAris(true);
  };

  const handleComplete = (severity: Severity, score: number, recommendations: string[]) => {
    setShowDrAris(false);
    onComplete(severity, score, recommendations);
  };

  const handleError = (errMsg: string) => {
    setError(errMsg);
  };

  if (showDrAris) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <DrArisSession onComplete={handleComplete} onError={handleError} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium max-w-md text-center">
          {error}
        </div>
      )}
      
      <div className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px]">
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl bg-white flex items-center justify-center border-4 border-white">
          <button
            onClick={handleStartSession}
            className="z-10 w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl gradient-primary hover:opacity-90"
          >
            <div className="text-4xl mb-2">🗣️</div>
            <div className="font-bold text-lg">Talk to Dr. Aris</div>
            <div className="text-xs opacity-80">AI Psychological Analysis</div>
          </button>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <p className="text-slate-600 text-sm font-medium">
          Start a conversation with Dr. Aris, an AI psychological analyst
        </p>
        <p className="text-slate-400 text-xs">
          Uses advanced voice and facial analysis to understand your emotional well-being
        </p>
      </div>
    </div>
  );
}
