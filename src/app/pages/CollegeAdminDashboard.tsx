"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  BarChart3,
  Heart,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getCollege } from "@/lib/db/colleges";
import { ensureCollegeMetrics, type CollegeMetrics } from "@/lib/db/metrics";
import { getCollegeAssessments, getStudentAssessments, getWeeklyTrends } from "@/lib/db/assessments";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import HealthGauge from "@/app/components/HealthGauge";
import CollegeStats from "@/app/components/CollegeStats";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";
  const [collegeName, setCollegeName] = useState<string>("");
  const [metrics, setMetrics] = useState<CollegeMetrics | null>(null);
  const [loadingCollege, setLoadingCollege] = useState(true);
  interface UserData {
    id: string;
    role: string;
    name: string;
    email?: string;
    phone?: string;
    designation?: string;
    collegeSlug?: string;
    collegeName?: string;
    createdAt?: string;
  }

  interface StudentData {
    id: string;
    role: string;
    name: string;
    regNo?: string | null;
    collegeSlug?: string;
    isAnonymous: boolean;
    createdAt?: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    // Load user data - only redirect if definitely not admin
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/college-admin");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as UserData;
      if (user.role !== "college-admin") {
        // Only redirect if role is explicitly wrong
        if (user.role === "student") {
          router.push("/student");
        } else {
          router.push("/");
        }
        return;
      }
      // Set user data only if role is correct
      setUserData(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/college-admin");
    }
  }, [router]);

  // Load students from Firestore
  useEffect(() => {
    if (!collegeSlug || !userData || userData.role !== "college-admin") return;
    let mounted = true;
    (async () => {
      try {
        setLoadingStudents(true);
        const db = getFirestoreDb();
        const usersQuery = query(
          collection(db, "users"),
          where("collegeSlug", "==", collegeSlug),
          where("role", "==", "student")
        );
        const snapshot = await getDocs(usersQuery);

        const studentsList = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Get latest assessment for each student
            try {
              const assessments = await getStudentAssessments(doc.id, collegeSlug, 1);
              const latestScore = assessments.length > 0 ? assessments[0].score : 0;
              const latestSeverity = assessments.length > 0 ? assessments[0].severity : null;

              // Get total assessment count
              const allAssessments = await getStudentAssessments(doc.id, collegeSlug, 100);

              return {
                id: doc.id,
                name: data.name || "Unknown",
                email: data.email || "",
                isAnonymous: data.isAnonymous || false,
                regNo: data.regNo || null,
                latestScore,
                latestSeverity,
                assessmentCount: allAssessments.length,
              };
            } catch (err) {
              console.error(`Error loading assessments for student ${doc.id}:`, err);
              return {
                id: doc.id,
                name: data.name || "Unknown",
                email: data.email || "",
                isAnonymous: data.isAnonymous || false,
                regNo: data.regNo || null,
                latestScore: 0,
                latestSeverity: null,
                assessmentCount: 0,
              };
            }
          })
        );

        if (!mounted) return;
        setStudents(studentsList);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        if (!mounted) return;
        setLoadingStudents(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collegeSlug, userData]);

  // Load weekly trends
  useEffect(() => {
    if (!collegeSlug || !userData || userData.role !== "college-admin") return;
    let mounted = true;
    (async () => {
      try {
        const trends = await getWeeklyTrends(collegeSlug);
        if (!mounted) return;
        setWeeklyTrends(trends);
      } catch (error) {
        console.error("Error loading trends:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collegeSlug, userData]);

  // Load assessments for selected student
  useEffect(() => {
    if (!selectedStudent || !collegeSlug || !userData || userData.role !== "college-admin") {
      setStudentAssessments([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const assessments = await getStudentAssessments(selectedStudent, collegeSlug, 10);
        if (!mounted) return;
        setStudentAssessments(assessments);
      } catch (error) {
        console.error("Error loading student assessments:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedStudent, collegeSlug, userData]);

  useEffect(() => {
    // Don't load if user is not authenticated or not admin
    if (!userData || userData.role !== "college-admin") {
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoadingCollege(true);
        const c = collegeSlug ? await getCollege(collegeSlug) : null;
        if (!mounted) return;
        if (!c || c.status !== "active") {
          setCollegeName("");
          setMetrics(null);
          setLoadingCollege(false);
          return;
        }
        setCollegeName(c.name);
        const m = await ensureCollegeMetrics(c.slug);
        if (!mounted) return;
        setMetrics(m);
      } catch (error) {
        console.error("Error loading college:", error);
      } finally {
        if (!mounted) return;
        setLoadingCollege(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collegeSlug, userData]);

  // Show loading while checking auth or loading college
  if (!userData || loadingCollege) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Verify user is admin
  if (userData.role !== "college-admin") {
    return null; // Will redirect in useEffect
  }

  if (!collegeName || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-2">Invalid college selected</p>
          <p className="text-slate-500 text-sm">Please check the URL or contact support.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Students",
      value: metrics.studentsTotal.toString(),
      emoji: "👥",
      color: "blue",
      icon: Users,
      bgClass: "bg-blue-50",
      iconClass: "text-blue-600",
    },
    {
      label: "Active Students",
      value: metrics.studentsActive.toString(),
      emoji: "✅",
      color: "emerald",
      icon: UserCheck,
      bgClass: "bg-emerald-50",
      iconClass: "text-emerald-600",
    },
    {
      label: "High Risk Alerts",
      value: metrics.highRiskAlerts.toString(),
      emoji: "⚠️",
      color: "red",
      icon: AlertTriangle,
      bgClass: "bg-red-50",
      iconClass: "text-red-600",
    },
    {
      label: "Avg Response Time",
      value: `${metrics.avgResponseTimeMin}m`,
      emoji: "⚡",
      color: "amber",
      icon: Clock,
      bgClass: "bg-amber-50",
      iconClass: "text-amber-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-effect p-8 rounded-[40px] shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-3xl font-black gradient-aurora-text tracking-tight">
            {collegeName} Admin Dashboard
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Welcome, {userData.name} ({userData.designation}) • SDG 3.4 Aligned
          </p>
        </div>
        <div className="flex items-center gap-4">
          <HealthGauge score={metrics.avgHealthScore} size={110} />
          <div className="text-center">
            <div className="text-2xl font-black gradient-aurora-text">
              {metrics.avgHealthScore}%
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase">
              Health Score
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-effect p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.emoji}</div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* College Stats */}
      <CollegeStats metrics={metrics} />

      {/* Weekly Trends Graph */}
      {weeklyTrends.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-black text-slate-800">Weekly Health Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${value}%`, 'Avg Score']}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                name="Average Health Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student Activity Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-800">Student Activity</h3>
          <button
            onClick={async () => {
              if (!collegeSlug) return;
              setLoadingStudents(true);
              try {
                // Refresh students and metrics
                const db = getFirestoreDb();
                const usersQuery = query(
                  collection(db, "users"),
                  where("collegeSlug", "==", collegeSlug),
                  where("role", "==", "student")
                );
                const snapshot = await getDocs(usersQuery);

                const studentsList = await Promise.all(
                  snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    try {
                      // Get latest assessment
                      const latestAssessments = await getStudentAssessments(doc.id, collegeSlug, 1);
                      const latestScore = latestAssessments.length > 0 ? latestAssessments[0].score : 0;
                      const latestSeverity = latestAssessments.length > 0 ? latestAssessments[0].severity : null;

                      // Get total assessment count
                      const allAssessments = await getStudentAssessments(doc.id, collegeSlug, 100);

                      return {
                        id: doc.id,
                        name: data.name || "Unknown",
                        email: data.email || "",
                        isAnonymous: data.isAnonymous || false,
                        regNo: data.regNo || null,
                        latestScore,
                        latestSeverity,
                        assessmentCount: allAssessments.length,
                      };
                    } catch (err) {
                      console.error(`Error loading assessments for student ${doc.id}:`, err);
                      return {
                        id: doc.id,
                        name: data.name || "Unknown",
                        email: data.email || "",
                        isAnonymous: data.isAnonymous || false,
                        regNo: data.regNo || null,
                        latestScore: 0,
                        latestSeverity: null,
                        assessmentCount: 0,
                      };
                    }
                  })
                );

                setStudents(studentsList);
                const updatedMetrics = await ensureCollegeMetrics(collegeSlug);
                setMetrics(updatedMetrics);
                const trends = await getWeeklyTrends(collegeSlug);
                setWeeklyTrends(trends);

                // If a student is selected, refresh their assessments too
                if (selectedStudent) {
                  const assessments = await getStudentAssessments(selectedStudent, collegeSlug, 10);
                  setStudentAssessments(assessments);
                }
              } catch (error) {
                console.error("Error refreshing data:", error);
              } finally {
                setLoadingStudents(false);
              }
            }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loadingStudents ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              No student activity recorded yet.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Students will appear here once they log in and use the platform.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student, idx) => (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedStudent === student.id
                  ? "bg-blue-50 border-blue-300 shadow-md"
                  : "bg-slate-50 border-slate-200 hover:border-blue-200"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${student.latestSeverity === "High" ? "bg-red-100 text-red-600" :
                    student.latestSeverity === "Medium" ? "bg-orange-100 text-orange-600" :
                      student.latestScore > 0 ? "bg-emerald-100 text-emerald-600" :
                        "bg-blue-100 text-blue-600"
                    }`}>
                    {student.latestScore > 0 ? student.latestScore : "—"}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">
                      {student.isAnonymous ? "Anonymous Student" : student.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {student.isAnonymous ? "Anonymous Mode" : `Reg: ${student.regNo || "N/A"}`}
                      {student.assessmentCount > 0 && (
                        <span className="ml-2">• {student.assessmentCount} assessment{student.assessmentCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {student.latestSeverity && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.latestSeverity === "High" ? "bg-red-100 text-red-700" :
                      student.latestSeverity === "Medium" ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                      {student.latestSeverity}
                    </span>
                  )}
                  {student.isAnonymous ? (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      Anonymous
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      Registered
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Student Assessment History */}
        {selectedStudent && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-lg font-black text-slate-800 mb-4">
              Assessment History
            </h4>
            {studentAssessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="font-medium">No assessments found for this student yet.</p>
                <p className="text-sm mt-2">Assessments will appear here once the student completes tests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${assessment.severity === "High" ? "bg-red-100 text-red-600" :
                        assessment.severity === "Medium" ? "bg-orange-100 text-orange-600" :
                          "bg-emerald-100 text-emerald-600"
                        }`}>
                        {assessment.score}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {assessment.type === "dr-aris" ? "Dr. Aris AI" :
                            assessment.type === "phq9" ? "PHQ-9 Assessment" :
                              "Voice AI"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(assessment.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${assessment.severity === "High" ? "bg-red-100 text-red-700" :
                      assessment.severity === "Medium" ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                      {assessment.severity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 gradient-aurora rounded-3xl text-white text-left shadow-lg hover:shadow-xl transition-all"
        >
          <BarChart3 className="w-8 h-8 mb-3" />
          <div className="font-black text-lg mb-1">View Analytics</div>
          <div className="text-sm opacity-90">Detailed student wellness reports</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl text-white text-left shadow-lg hover:shadow-xl transition-all"
        >
          <AlertTriangle className="w-8 h-8 mb-3" />
          <div className="font-black text-lg mb-1">High Risk Alerts</div>
          <div className="text-sm opacity-90">{metrics.highRiskAlerts} students need attention</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/college-admin/discuss?college=${collegeSlug}`)}
          className="p-6 bg-gradient-to-br from-[#384589] to-[#5A4485] rounded-3xl text-white text-left shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-8 h-8 mb-3" />
          <div className="font-black text-lg mb-1">Start “Discuss”</div>
          <div className="text-sm opacity-90">Launch anonymous group session (6 seats)</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl text-white text-left shadow-lg hover:shadow-xl transition-all"
        >
          <Heart className="w-8 h-8 mb-3" />
          <div className="font-black text-lg mb-1">Wellness Programs</div>
          <div className="text-sm opacity-90">Manage campus mental health initiatives</div>
        </motion.button>
      </div>
    </div>
  );
}

export default function CollegeAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
