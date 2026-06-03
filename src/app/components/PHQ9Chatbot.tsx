"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHQ9_QUESTIONS, calculatePHQ9Severity } from "@/lib/phq9-questions";
import { Severity } from "@/lib/types";

interface Props {
  onComplete: (severity: Severity, score: number) => void;
}

export default function PHQ9Chatbot({ onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const handleAnswer = (val: number) => {
    const newScore = score + val;
    setScore(newScore);

    if (currentIdx < PHQ9_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate severity using validated scoring
      const result = calculatePHQ9Severity(newScore);
      // Convert PHQ9 score (0-27) to health score (0-100)
      // Lower PHQ9 score = higher health score
      const healthScore = Math.max(0, Math.min(100, Math.round(100 - (newScore / 27) * 100)));
      onComplete(result.severity, healthScore);
    }
  };

  if (!isStarted) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
        <h3 className="text-xl font-bold mb-4">PHQ-9 Clinical Screening</h3>
        <p className="text-slate-500 mb-6 text-sm">
          Take a quick 2-minute validated questionnaire if you prefer not to use Voice AI.
          <br />
          <span className="text-xs text-slate-400">
            Based on NIMHANS/Kaggle validated questions
          </span>
        </p>
        <button
          onClick={() => setIsStarted(true)}
          className="gradient-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  const q = PHQ9_QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / PHQ9_QUESTIONS.length) * 100;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Question {currentIdx + 1} of 9
        </span>
        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-xs font-bold text-blue-600 uppercase mb-1">
              {q.category}
            </p>
            <h4 className="text-xl font-bold text-slate-800 leading-tight">
              {q.text}
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Over the last 2 weeks, how often have you been bothered by this?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { text: "Not at all", val: 0, desc: "0 points" },
              { text: "Several days", val: 1, desc: "1-2 days" },
              { text: "More than half the days", val: 2, desc: "3-7 days" },
              { text: "Nearly every day", val: 3, desc: "8-14 days" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleAnswer(opt.val)}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-slate-700 group"
              >
                <div className="flex items-center justify-between">
                  <span>{opt.text}</span>
                  <span className="text-xs text-slate-400 group-hover:text-blue-600">
                    {opt.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Current Score: {score}</span>
              <span>
                {currentIdx + 1}/{PHQ9_QUESTIONS.length}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
