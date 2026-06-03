
export interface AnalysisResult {
  score: number;
  summary: string;
  recommendations: string[];
  emotionalCongruence?: string;
}

export enum AppState {
  WELCOME = 'WELCOME',
  SESSION = 'SESSION',
  RESULT = 'RESULT'
}

export interface TranscriptionTurn {
  role: 'user' | 'model';
  text: string;
}
