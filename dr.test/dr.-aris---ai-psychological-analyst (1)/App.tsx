
import React, { useState, useCallback } from 'react';
import { AppState, AnalysisResult } from './types';
import SessionView from './components/SessionView';
import ResultView from './components/ResultView';
import WelcomeView from './components/WelcomeView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const startSession = useCallback(() => {
    setState(AppState.SESSION);
  }, []);

  const finishSession = useCallback((result: AnalysisResult) => {
    setAnalysis(result);
    setState(AppState.RESULT);
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setState(AppState.WELCOME);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="py-6 px-8 flex justify-between items-center border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dr. Aris</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Psychological Analyst</p>
          </div>
        </div>
        
        {state !== AppState.WELCOME && (
          <button 
            onClick={reset}
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Restart
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        {state === AppState.WELCOME && <WelcomeView onStart={startSession} />}
        {state === AppState.SESSION && <SessionView onComplete={finishSession} />}
        {state === AppState.RESULT && analysis && (
          <ResultView analysis={analysis} onRestart={reset} />
        )}
      </main>

      <footer className="py-8 px-8 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2024 Dr. Aris Intelligence. Compassionate analysis powered by Gemini 2.5 Live.</p>
      </footer>
    </div>
  );
};

export default App;
