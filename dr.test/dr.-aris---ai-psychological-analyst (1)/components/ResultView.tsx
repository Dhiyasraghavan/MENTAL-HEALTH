
import React from 'react';
import { AnalysisResult } from '../types';

interface ResultViewProps {
  analysis: AnalysisResult;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ analysis, onRestart }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-indigo-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'bg-indigo-50 border-indigo-100';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-rose-50 border-rose-100';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-10 py-6">
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          25-Point Video/Voice Diagnostic Complete
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">Psychological Synthesis</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          Based on 25 multi-modal context points, Dr. Aris has synthesized your emotional and verbal profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-4 rounded-[2rem] p-10 border flex flex-col items-center justify-center text-center shadow-2xl ${getScoreBg(analysis.score)}`}>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Vitality Index</h3>
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-white/40" />
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 * (1 - analysis.score / 100)} className={`${getScoreColor(analysis.score)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Percentile</span>
            </div>
          </div>
          <div className="mt-10 space-y-1">
            <p className="font-black text-xl text-slate-800 tracking-tight">
              {analysis.score >= 80 ? 'High Resilience' : analysis.score >= 60 ? 'Stable' : 'Adjustment Needed'}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Psychometric Tier</p>
          </div>
        </div>

        <div className="lg:col-span-8 glass-effect rounded-[2rem] p-10 border border-slate-200 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
               <h3 className="text-xs font-black uppercase tracking-widest">Problem Identification</h3>
            </div>
            <p className="text-xl text-slate-800 leading-[1.6] font-semibold italic">"{analysis.summary}"</p>
            {analysis.emotionalCongruence && (
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Visual Congruence Analysis</p>
                  <p className="text-sm text-slate-600">{analysis.emotionalCongruence}</p>
               </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-12 glass-effect rounded-[2.5rem] p-12 border border-slate-200 shadow-2xl space-y-10">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">💡</span>
            Prescriptive Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                <p className="text-slate-700 font-semibold leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10 pb-10">
        <button onClick={onRestart} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Restart Assessment
        </button>
      </div>
    </div>
  );
};

export default ResultView;
