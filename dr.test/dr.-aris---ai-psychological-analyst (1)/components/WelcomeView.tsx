
import React from 'react';

interface WelcomeViewProps {
  onStart: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 py-12">
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-5xl font-extrabold text-slate-900 leading-tight">
          How are you <span className="text-indigo-600">truly</span> feeling today?
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Dr. Aris is a specialized AI voice companion designed to listen, understand, and provide insights into your psychological well-being through a natural vocal conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {[
          { title: "Voice Interaction", icon: "🎙️", desc: "Speak naturally, as you would to a friend or professional." },
          { title: "Deep Analysis", icon: "🧠", desc: "Contextual understanding of your emotional state." },
          { title: "Personal Insights", icon: "📈", desc: "Receive a well-being score and supportive feedback." }
        ].map((item, i) => (
          <div key={i} className="glass-effect p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="group relative px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Start Consultation
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      
      <p className="text-sm text-slate-400 max-w-lg">
        Please ensure your microphone is enabled. This session is an AI-guided analysis and not a substitute for professional medical advice.
      </p>
    </div>
  );
};

export default WelcomeView;
