"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, Wind } from "lucide-react";

interface Props {
  severity: "Low" | "Medium" | "High";
  score?: number;
  recommendations?: string[];
  onReset: () => void;
}

export default function ResultsCard({
  severity,
  score = 0,
  recommendations = [],
  onReset,
}: Props) {
  const config = {
    Low: {
      color: "emerald",
      title: "Healthy! 🎉",
      desc: "Your stress levels are minimal. Stay consistent with your routine.",
      action: "Try a 2-minute breathing exercise to maintain focus.",
      btn: "Start Breathing",
      btnIcon: <Wind className="w-5 h-5" />,
      emoji: "🌿",
      helpline: null,
    },
    Medium: {
      color: "orange",
      title: "Moderate Stress Detected",
      desc: "You might be feeling a bit overwhelmed lately. Talking can help.",
      action: "Book a priority session with your college counselor.",
      btn: "Schedule Call",
      btnIcon: <Calendar className="w-5 h-5" />,
      emoji: "🧘",
      helpline: null,
    },
    High: {
      color: "red",
      title: "High Distress Level 🚨",
      desc: "We are concerned about your wellbeing. Immediate help is available.",
      action: "An alert has been sent to college management for support.",
      btn: "Contact Helpline: 1800-599-0019",
      btnIcon: <Phone className="w-5 h-5" />,
      emoji: "🆘",
      helpline: "1800-599-0019",
    },
  }[severity];

  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  const buttonColors: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  const handleAction = () => {
    if (severity === "High" && config.helpline) {
      window.open(`tel:${config.helpline.replace(/\D/g, "")}`);
    } else if (severity === "Low") {
      // Play breathing exercise audio
      const audio = new Audio("/breathing/guided-breathing.mp3");
      audio.play().catch(() => {
        alert("Audio file not found. Please try the breathing exercise manually.");
      });
    } else if (severity === "Medium") {
      // Open calendar/scheduling
      window.open("https://calendly.com/college-counselor", "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-10 rounded-[40px] border-4 shadow-2xl text-center space-y-6 ${colors[config.color]}`}
    >
      <div className="text-6xl mb-4">{config.emoji}</div>
      <h2 className="text-3xl font-black">{config.title}</h2>
      <p className="font-medium opacity-80 max-w-md mx-auto">{config.desc}</p>

      {score > 0 && (
        <div className="bg-white/30 px-4 py-2 rounded-xl inline-block">
          <span className="text-sm font-bold">Health Score: {score}%</span>
        </div>
      )}

      <div className="bg-white/50 p-6 rounded-3xl border border-white/20">
        <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">
          Recommendation
        </p>
        <p className="font-bold mb-2">{config.action}</p>
        {recommendations.length > 0 && (
          <ul className="text-left text-sm space-y-1 mt-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleAction}
          className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ${buttonColors[config.color]}`}
        >
          {config.btnIcon}
          {config.btn}
        </button>
        <button
          onClick={onReset}
          className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
        >
          Take Assessment Again
        </button>
      </div>
    </motion.div>
  );
}
