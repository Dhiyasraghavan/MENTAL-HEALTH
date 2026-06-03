import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { AssessmentResult, Severity } from "@/lib/types";

const assessmentsCol = "assessments";

export interface AssessmentDoc {
  userId: string;
  collegeSlug?: string;
  type: "voice-ai" | "phq9" | "dr-aris" | "combined";
  severity: Severity;
  score: number; // 0-100
  voiceSentiment?: number;
  facialEmotions?: Record<string, number>;
  phq9Score?: number;
  recommendations: string[];
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Save an assessment result to Firestore
 */
export async function saveAssessment(data: {
  userId: string;
  collegeSlug?: string;
  type: "voice-ai" | "phq9" | "dr-aris" | "combined";
  severity: Severity;
  score: number;
  voiceSentiment?: number;
  facialEmotions?: Record<string, number>;
  phq9Score?: number;
  recommendations: string[];
}): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, assessmentsCol);
  
  const docData = {
    ...data,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ref, docData);
  return docRef.id;
}

/**
 * Get all assessments for a specific user
 */
export async function getUserAssessments(
  userId: string,
  limitCount: number = 10
): Promise<AssessmentResult[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, assessmentsCol),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as AssessmentDoc;
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      score: data.score,
      voiceSentiment: data.voiceSentiment,
      facialEmotions: data.facialEmotions,
      phq9Score: data.phq9Score,
      timestamp: data.timestamp.toDate(),
      recommendations: data.recommendations || [],
    };
  });
}

/**
 * Get latest assessment for a user
 */
export async function getLatestUserAssessment(userId: string): Promise<AssessmentResult | null> {
  const assessments = await getUserAssessments(userId, 1);
  return assessments.length > 0 ? assessments[0] : null;
}

/**
 * Get all assessments for a college
 */
export async function getCollegeAssessments(
  collegeSlug: string,
  limitCount: number = 100
): Promise<AssessmentResult[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, assessmentsCol),
    where("collegeSlug", "==", collegeSlug),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as AssessmentDoc;
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      score: data.score,
      voiceSentiment: data.voiceSentiment,
      facialEmotions: data.facialEmotions,
      phq9Score: data.phq9Score,
      timestamp: data.timestamp.toDate(),
      recommendations: data.recommendations || [],
    };
  });
}

/**
 * Get assessments for a specific student in a college
 */
export async function getStudentAssessments(
  userId: string,
  collegeSlug: string,
  limitCount: number = 20
): Promise<AssessmentResult[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, assessmentsCol),
    where("userId", "==", userId),
    where("collegeSlug", "==", collegeSlug),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as AssessmentDoc;
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      score: data.score,
      voiceSentiment: data.voiceSentiment,
      facialEmotions: data.facialEmotions,
      phq9Score: data.phq9Score,
      timestamp: data.timestamp.toDate(),
      recommendations: data.recommendations || [],
    };
  });
}

/**
 * Get unique student IDs who have assessments in a college
 */
export async function getActiveStudentIds(collegeSlug: string): Promise<string[]> {
  const assessments = await getCollegeAssessments(collegeSlug, 1000);
  const uniqueIds = new Set(assessments.map((a) => a.userId));
  return Array.from(uniqueIds);
}

/**
 * Calculate average health score for a college
 */
export async function calculateCollegeAvgHealthScore(collegeSlug: string): Promise<number> {
  const assessments = await getCollegeAssessments(collegeSlug, 1000);
  if (assessments.length === 0) return 0;
  
  const total = assessments.reduce((sum, a) => sum + a.score, 0);
  return Math.round(total / assessments.length);
}

/**
 * Count high risk alerts (severity === "High") for a college
 */
export async function countHighRiskAlerts(collegeSlug: string): Promise<number> {
  const assessments = await getCollegeAssessments(collegeSlug, 1000);
  return assessments.filter((a) => a.severity === "High").length;
}

/**
 * Get weekly trends for a college (last 7 days)
 */
export async function getWeeklyTrends(collegeSlug: string): Promise<Array<{
  date: string;
  activeCount: number;
  avgScore: number;
}>> {
  const assessments = await getCollegeAssessments(collegeSlug, 1000);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Group by date
  const byDate = new Map<string, { scores: number[]; userIds: Set<string> }>();

  assessments.forEach((a) => {
    const date = a.timestamp;
    if (date >= sevenDaysAgo) {
      const dateStr = date.toISOString().split("T")[0];
      if (!byDate.has(dateStr)) {
        byDate.set(dateStr, { scores: [], userIds: new Set() });
      }
      const day = byDate.get(dateStr)!;
      day.scores.push(a.score);
      day.userIds.add(a.userId);
    }
  });

  // Convert to array and calculate averages
  const trends = Array.from(byDate.entries())
    .map(([date, data]) => ({
      date,
      activeCount: data.userIds.size,
      avgScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length)
        : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}
