import React from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";

interface Props {
  isRecording: boolean;
  onClick: () => void;
  timerText: string;
}

const VoiceAIButton: React.FC<Props> = ({
  isRecording,
  onClick,
  timerText,
}) => {
  return (
    <div className="relative z-10">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-[300px] h-[300px] rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-colors duration-500 relative overflow-hidden ${
          isRecording
            ? "bg-red-500/80 backdrop-blur-sm"
            : "gradient-blue-purple"
        }`}
      >
        {isRecording ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/20 p-6 rounded-full mb-4"
            >
              <Square className="w-12 h-12 fill-current" />
            </motion.div>
            <span className="text-3xl font-bold tabular-nums mb-1">
              {timerText}
            </span>
            <span className="text-sm font-medium opacity-80 uppercase tracking-widest">
              Ending Session...
            </span>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <Mic className="w-16 h-16" />
            </motion.div>
            <span className="text-2xl font-bold mb-1">Talk to Me</span>
            <span className="text-sm opacity-80">(5 mins session)</span>
          </>
        )}

        {/* Pulse Animations */}
        {!isRecording && (
          <motion.div
            animate={{ scale: [1, 1.4, 1.6], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-blue-400 rounded-full z-[-1]"
          />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceAIButton;
