import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  PhoneCall,
  RotateCcw,
  CheckCircle,
  Wind,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import type { Severity } from "@/lib/types";

interface Props {
  severity: Severity;
  onRetry: () => void;
}

const ResultsSection: React.FC<Props> = React.memo(({ severity, onRetry }) => {
  const config = useMemo(() => {
    switch (severity) {
      case "Low":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-100",
          buttonBg: "bg-green-600 hover:bg-green-700",
          title: "Low Distress Detected",
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          action: "Breathing Exercises",
          sub: "Your emotional state seems stable. A short mindfulness session could help maintain this balance.",
          btnIcon: <Wind className="w-5 h-5" />,
          btnText: "Start Guided Breathing",
        };
      case "Medium":
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          buttonBg: "bg-amber-600 hover:bg-amber-700",
          title: "Moderate Distress Detected",
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          action: "Book College Counselor",
          sub: "It looks like you're carrying some weight. Talking to a professional counselor can offer new perspectives.",
          btnIcon: <Calendar className="w-5 h-5" />,
          btnText: "View Availability",
        };
      case "High":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100",
          buttonBg: "bg-red-600 hover:bg-red-700",
          title: "High Distress Detected",
          icon: <Flame className="w-12 h-12 text-red-500" />,
          action: "Management Alerted",
          sub: "We're concerned about your well-being. Immediate support is available 24/7. Please reach out now.",
          btnIcon: <PhoneCall className="w-5 h-5" />,
          btnText: "Call Emergency Helpline",
        };
      default:
        return null;
    }
  }, [severity]);

  if (!config) return null;

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div
        className={`p-10 rounded-3xl border-2 ${config.bg} ${config.border} flex flex-col items-center text-center space-y-6 shadow-xl`}
      >
        {config.icon}
        <div>
          <h3 className={`text-3xl font-black ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-slate-600 mt-2 max-w-lg">{config.sub}</p>
        </div>

        <div className="w-full h-[2px] bg-slate-200/50" />

        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-center">
          <button
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all ${config.buttonBg}`}
          >
            {config.btnIcon}
            {config.btnText}
          </button>

          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Scan
          </button>
        </div>
      </div>

      {severity === "High" && (
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-red-600 p-4 rounded-xl text-white font-bold flex items-center justify-center gap-3 shadow-lg"
        >
          <PhoneCall className="w-6 h-6" />
          Immediate Assistance: 1800-599-0019
        </motion.div>
      )}
    </motion.section>
  );
});

export default ResultsSection;
