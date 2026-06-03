export type Severity = "Low" | "Medium" | "High" | null;

export type UserRole =
  | "student"
  | "it-employee"
  | "elder"
  | "guardian"
  | "college-admin";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  collegeSlug?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export type CollegeStatus = "pending" | "active" | "disabled";

export interface College {
  slug: string;
  name: string;
  status: CollegeStatus;
  createdAt: Date;
  createdByUserId?: string;
}

export type DiscussSessionStatus = "active" | "ended";

export interface DiscussSessionSeat {
  seatIndex: number; // 0..5
  kind: "psychiatrist" | "member";
  userId?: string; // present if occupied
  displayName?: string; // anonymized display name (e.g. "Member 3")
  joinedAt?: Date;
}

export interface DiscussSession {
  id: string;
  collegeSlug: string;
  status: DiscussSessionStatus;
  createdByUserId: string; // psychiatrist (college admin)
  createdAt: Date;
  activeSpeakerSeatIndex?: number; // 0..5
  seats: DiscussSessionSeat[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  type: "voice-ai" | "phq9" | "combined" | "dr-aris";
  severity: Severity;
  score: number;
  voiceSentiment?: number;
  facialEmotions?: Record<string, number>;
  phq9Score?: number;
  timestamp: Date;
  recommendations: string[];
}

export interface CollegeStats {
  collegeSlug: string;
  activeStudents: number;
  totalStudents: number;
  avgHealthScore: number;
  highRiskAlerts: number;
  avgResponseTime: number;
  weeklyTrends: {
    date: string;
    activeCount: number;
    avgScore: number;
  }[];
}

export interface VoiceAnalysisResult {
  sentiment: number; // -1 to 1
  emotions: {
    happy: number;
    sad: number;
    stressed: number;
    neutral: number;
  };
  speechRate: number;
  pauses: number;
}

export interface FacialAnalysisResult {
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
    neutral: number;
  };
  attention: number;
  engagement: number;
}
