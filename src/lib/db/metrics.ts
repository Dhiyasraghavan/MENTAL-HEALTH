import { doc, getDoc, serverTimestamp, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import { 
  getActiveStudentIds, 
  calculateCollegeAvgHealthScore, 
  countHighRiskAlerts 
} from "./assessments";
import { getUserProfile } from "./users";

export interface CollegeMetrics {
  studentsActive: number;
  studentsTotal: number;
  avgHealthScore: number; // 0..100
  highRiskAlerts: number;
  avgResponseTimeMin: number;
}

const metricsColPath = "collegeMetrics";

/**
 * Calculate and update college metrics from real assessment data
 */
export async function calculateAndUpdateMetrics(collegeSlug: string): Promise<CollegeMetrics> {
  // Get active students (those with assessments in last 30 days)
  const activeStudentIds = await getActiveStudentIds(collegeSlug);
  
  // Get total registered students for this college
  const db = getFirestoreDb();
  const usersQuery = query(
    collection(db, "users"),
    where("collegeSlug", "==", collegeSlug),
    where("role", "==", "student")
  );
  const usersSnapshot = await getDocs(usersQuery);
  const totalStudents = usersSnapshot.size;

  // Calculate from assessments
  const avgHealthScore = await calculateCollegeAvgHealthScore(collegeSlug);
  const highRiskAlerts = await countHighRiskAlerts(collegeSlug);

  // Active students = unique users with assessments in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter active students (have recent assessments)
  const activeStudents = activeStudentIds.length;

  // Response time: Average time between assessment and any admin action (simplified to 0 for now)
  // In production, this would track actual response times
  const avgResponseTimeMin = 0;

  const metrics: CollegeMetrics = {
    studentsActive: activeStudents,
    studentsTotal: totalStudents,
    avgHealthScore,
    highRiskAlerts,
    avgResponseTimeMin,
  };

  // Save to Firestore
  await setDoc(
    doc(getFirestoreDb(), metricsColPath, collegeSlug),
    { 
      ...metrics, 
      updatedAt: serverTimestamp() 
    },
    { merge: true }
  );

  return metrics;
}

export async function getCollegeMetrics(collegeSlug: string): Promise<CollegeMetrics | null> {
  const ref = doc(getFirestoreDb(), metricsColPath, collegeSlug);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // If no metrics exist, calculate from assessments
    return await calculateAndUpdateMetrics(collegeSlug);
  }
  const data = snap.data() as any;
  return {
    studentsActive: Number(data.studentsActive ?? 0),
    studentsTotal: Number(data.studentsTotal ?? 0),
    avgHealthScore: Number(data.avgHealthScore ?? 0),
    highRiskAlerts: Number(data.highRiskAlerts ?? 0),
    avgResponseTimeMin: Number(data.avgResponseTimeMin ?? 0),
  };
}

export async function ensureCollegeMetrics(collegeSlug: string): Promise<CollegeMetrics> {
  // Always calculate fresh metrics from assessments
  return await calculateAndUpdateMetrics(collegeSlug);
}

