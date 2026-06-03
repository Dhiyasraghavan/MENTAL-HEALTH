"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HealthGauge from "@/app/components/HealthGauge";
import VoiceAIBtn from "@/app/components/VoiceAIBtn";
import PHQ9Chatbot from "@/app/components/PHQ9Chatbot";
import ResultsCard from "@/app/components/ResultsCard";
import CollegeStats from "@/app/components/CollegeStats";
import { Severity } from "@/lib/types";
import { getCollege } from "@/lib/db/colleges";
import { ensureCollegeMetrics, type CollegeMetrics } from "@/lib/db/metrics";
import { saveAssessment, getLatestUserAssessment, getUserAssessments } from "@/lib/db/assessments";
import { MessageCircle, TrendingUp, Calendar } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";
  const [collegeName, setCollegeName] = useState<string>("");
  const [metrics, setMetrics] = useState<CollegeMetrics | null>(null);
  const [loadingCollege, setLoadingCollege] = useState(true);
  const [severity, setSeverity] = useState<Severity>(null);
  const [score, setScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [pastAssessments, setPastAssessments] = useState<any[]>([]);
  const [latestScore, setLatestScore] = useState<number>(0);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/student");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== "student") {
        router.push("/");
        return;
      }
      setUserId(user.id || "");
    } catch {
      router.push("/student");
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCollege(true);
        const c = collegeSlug ? await getCollege(collegeSlug) : null;
        if (!mounted) return;
        if (!c || c.status !== "active") {
          setCollegeName("");
          setMetrics(null);
          return;
        }
        setCollegeName(c.name);
        setMetrics(await ensureCollegeMetrics(c.slug));
      } finally {
        if (!mounted) return;
        setLoadingCollege(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collegeSlug]);

  // Load past assessments
  useEffect(() => {
    if (!userId || !collegeSlug) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingHistory(true);
        const assessments = await getUserAssessments(userId, 5);
        if (!mounted) return;
        setPastAssessments(assessments);
        if (assessments.length > 0) {
          setLatestScore(assessments[0].score);
        }
      } catch (error) {
        console.error("Error loading assessments:", error);
      } finally {
        if (!mounted) return;
        setLoadingHistory(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, collegeSlug]);

  const handleVoiceComplete = async (
    sev: Severity,
    scr: number,
    recs: string[]
  ) => {
    setSeverity(sev);
    setScore(scr);
    setRecommendations(recs);

    // Save assessment to Firestore
    if (userId && collegeSlug) {
      try {
        await saveAssessment({
          userId,
          collegeSlug,
          type: "dr-aris", // Dr. Aris AI
          severity: sev,
          score: scr,
          recommendations: recs,
        });
        
        // Update metrics
        await ensureCollegeMetrics(collegeSlug);
        
        // Reload past assessments
        const assessments = await getUserAssessments(userId, 5);
        setPastAssessments(assessments);
        setLatestScore(scr);
      } catch (error) {
        console.error("Error saving assessment:", error);
      }
    }
  };

  const handlePHQ9Complete = async (sev: Severity, healthScore: number) => {
    // Calculate PHQ9 raw score from health score (reverse of conversion)
    // healthScore = 100 - (phq9Score / 27) * 100
    // phq9Score = (100 - healthScore) / 100 * 27
    const phq9RawScore = Math.round(((100 - healthScore) / 100) * 27);
    
    setSeverity(sev);
    setScore(healthScore);
    setRecommendations(["Continue monitoring your mental health"]);

    // Save assessment to Firestore
    if (userId && collegeSlug) {
      try {
        await saveAssessment({
          userId,
          collegeSlug,
          type: "phq9",
          severity: sev,
          score: healthScore,
          phq9Score: phq9RawScore,
          recommendations: ["Continue monitoring your mental health"],
        });
        
        // Update metrics
        await ensureCollegeMetrics(collegeSlug);
        
        // Reload past assessments
        const assessments = await getUserAssessments(userId, 5);
        setPastAssessments(assessments);
        setLatestScore(healthScore);
      } catch (error) {
        console.error("Error saving assessment:", error);
      }
    }
  };

  if (loadingCollege) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collegeName || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Invalid college selected</p>
      </div>
    );
  }

  const stats = [
    { label: "Active Students", value: metrics.studentsActive.toString(), emoji: "👥" },
    { label: "Response Time", value: `${metrics.avgResponseTimeMin}m`, emoji: "⚡" },
    { label: "High Risk Alerts", value: metrics.highRiskAlerts.toString(), emoji: "⚠️" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Welcome, {collegeName} Community
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Real-time Health Monitoring Active • SDG 3.4 Aligned
          </p>
          {latestScore > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-600">
                Your Latest Score: <span className="font-black text-blue-600">{latestScore}%</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <HealthGauge score={latestScore || metrics.avgHealthScore} size={110} />
          {latestScore > 0 && (
            <div className="text-center">
              <div className="text-xs text-slate-500 font-bold uppercase">Your Score</div>
            </div>
          )}
        </div>
      </header>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-[40px] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xl font-black">Discuss (Anonymous Group Session)</div>
            <div className="text-sm text-white/80 font-bold">
              Join when the psychiatrist starts a session
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/student/discuss?college=${collegeSlug}`)}
          className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-black hover:bg-white/90 active:scale-95 transition"
        >
          Open Discuss
        </button>
      </div>

      {!severity ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[50px] border-4 border-white shadow-xl flex flex-col items-center">
            <h3 className="text-2xl font-black mb-8 text-center">
              Emotional Scan
            </h3>
            <VoiceAIBtn onComplete={handleVoiceComplete} />
          </div>

          <div className="space-y-8">
            <CollegeStats metrics={metrics} />

            {/* Past Assessments History */}
            {pastAssessments.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Your Assessment History
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    Last {pastAssessments.length} assessments
                  </span>
                </div>
                <div className="space-y-3">
                  {pastAssessments.slice(0, 3).map((assessment, idx) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          assessment.severity === "High" ? "bg-red-100 text-red-600" :
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
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assessment.severity === "High" ? "bg-red-100 text-red-700" :
                        assessment.severity === "Medium" ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {assessment.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center"
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <div className="text-xl font-black">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <PHQ9Chatbot onComplete={handlePHQ9Complete} />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <ResultsCard
            severity={severity}
            score={score}
            recommendations={recommendations}
            onReset={() => {
              setSeverity(null);
              setScore(0);
              setRecommendations([]);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
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
