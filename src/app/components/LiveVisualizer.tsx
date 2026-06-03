"use client";

import React from 'react';

interface LiveVisualizerProps {
  isActive: boolean;
  isModelTalking: boolean;
}

const LiveVisualizer: React.FC<LiveVisualizerProps> = ({ isActive, isModelTalking }) => {
  return (
    <div className="flex items-center justify-center space-x-2 h-24">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-300 ${
            isActive 
              ? isModelTalking 
                ? 'bg-indigo-500 animate-bounce' 
                : 'bg-emerald-400 animate-pulse'
              : 'bg-gray-300 h-4'
          }`}
          style={{
            height: isActive ? `${Math.random() * 60 + 20}%` : '16px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: isModelTalking ? '0.6s' : '1.5s'
          }}
        />
      ))}
    </div>
  );
};

export default LiveVisualizer;
