export interface PHQ9Question {
  id: number;
  text: string;
  category: string;
}

export const PHQ9_QUESTIONS: PHQ9Question[] = [
  {
    id: 1,
    text: "Little interest or pleasure in doing things?",
    category: "Anhedonia",
  },
  {
    id: 2,
    text: "Feeling down, depressed, or hopeless?",
    category: "Depressed Mood",
  },
  {
    id: 3,
    text: "Trouble falling or staying asleep, or sleeping too much?",
    category: "Sleep Disturbance",
  },
  {
    id: 4,
    text: "Feeling tired or having little energy?",
    category: "Fatigue",
  },
  {
    id: 5,
    text: "Poor appetite or overeating?",
    category: "Appetite Changes",
  },
  {
    id: 6,
    text: "Feeling bad about yourself — or that you are a failure?",
    category: "Self-Esteem",
  },
  {
    id: 7,
    text: "Trouble concentrating on things, such as reading the news?",
    category: "Concentration",
  },
  {
    id: 8,
    text: "Moving or speaking slowly, or being extra fidgety?",
    category: "Psychomotor",
  },
  {
    id: 9,
    text: "Thoughts that you would be better off dead?",
    category: "Suicidal Ideation",
  },
];

export const PHQ9_SCORING = {
  None: { min: 0, max: 4, label: "None/Minimal" },
  Mild: { min: 5, max: 9, label: "Mild Depression" },
  Moderate: { min: 10, max: 14, label: "Moderate Depression" },
  ModerateSevere: { min: 15, max: 19, label: "Moderately Severe" },
  Severe: { min: 20, max: 27, label: "Severe Depression" },
};

export function calculatePHQ9Severity(score: number): {
  severity: "Low" | "Medium" | "High";
  label: string;
  recommendation: string;
} {
  if (score <= 4) {
    return {
      severity: "Low",
      label: PHQ9_SCORING.None.label,
      recommendation: "Maintain healthy routines and regular check-ins.",
    };
  } else if (score <= 9) {
    return {
      severity: "Low",
      label: PHQ9_SCORING.Mild.label,
      recommendation: "Consider self-help resources and monitoring.",
    };
  } else if (score <= 14) {
    return {
      severity: "Medium",
      label: PHQ9_SCORING.Moderate.label,
      recommendation: "Professional counseling recommended.",
    };
  } else if (score <= 19) {
    return {
      severity: "High",
      label: PHQ9_SCORING.ModerateSevere.label,
      recommendation: "Immediate professional intervention required.",
    };
  } else {
    return {
      severity: "High",
      label: PHQ9_SCORING.Severe.label,
      recommendation: "Urgent medical attention and crisis support needed.",
    };
  }
}

