export type Severity = "Low" | "Medium" | "High" | null;

export const COLLEGES = [
  "IIT Madras",
  "Anna University",
  "VIT Vellore",
  "SRM Institute",
  "NIT Trichy",
  "Amity University",
  "BITS Pilani",
  "Delhi University",
  "IIT Bombay",
  "IIT Delhi",
];

export interface PHQ9Question {
  id: number;
  text: string;
}

export const PHQ9_QUESTIONS: PHQ9Question[] = [
  { id: 1, text: "Little interest or pleasure in doing things?" },
  { id: 2, text: "Feeling down, depressed, or hopeless?" },
  { id: 3, text: "Trouble falling or staying asleep, or sleeping too much?" },
  { id: 4, text: "Feeling tired or having little energy?" },
  { id: 5, text: "Poor appetite or overeating?" },
  { id: 6, text: "Feeling bad about yourself — or that you are a failure?" },
  { id: 7, text: "Trouble concentrating on things, such as reading the news?" },
  { id: 8, text: "Moving or speaking slowly, or being extra fidgety?" },
  { id: 9, text: "Thoughts that you would be better off dead?" },
];
