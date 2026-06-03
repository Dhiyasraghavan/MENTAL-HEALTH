"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceAIBtn from "@/app/components/VoiceAIBtn";
import PHQ9Chatbot from "@/app/components/PHQ9Chatbot";
import ResultsCard from "@/app/components/ResultsCard";
import { Severity } from "@/lib/types";
import { Briefcase, TrendingDown, Activity } from "lucide-react";

export default function ITDashboard() {
  const router = useRouter();
  const [severity, setSeverity] = useState<Severity>(null);
  const [score, setScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [stressIndex, setStressIndex] = useState<number>(0);
  const [productivity, setProductivity] = useState("Unknown");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/it-employee");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== "it-employee") {
        router.push("/");
      }
    } catch {
      router.push("/it-employee");
    }
  }, [router]);

  const handleVoiceComplete = (
    sev: Severity,
    scr: number,
    recs: string[]
  ) => {
    setSeverity(sev);
    setScore(scr);
    setRecommendations(recs);

    // Update stress index based on severity
    if (sev === "High") {
      setStressIndex(75);
      setProductivity("Low");
    } else if (sev === "Medium") {
      setStressIndex(55);
      setProductivity("Moderate");
    } else {
      setStressIndex(35);
      setProductivity("Normal");
    }
  };

  const handlePHQ9Complete = (sev: Severity, healthScore: number) => {
    setSeverity(sev);
    setScore(healthScore);
    setRecommendations(["Consider workplace wellness programs"]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="bg-white p-8 rounded-[40px] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-800 mb-2">
                Burnout Monitor
              </h1>
              <p className="text-slate-500">
                Integrated with Slack & Camera for Micro-emotion detection
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">IT Employee Portal</span>
            </div>
          </div>
        </header>

        {!severity ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-slate-400">Stress Index</h3>
                  </div>
                  <div className="text-5xl font-black text-orange-500">
                    {stressIndex}/100
                  </div>
                  <div className="mt-4 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                      style={{ width: `${stressIndex}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-400">Productivity Level</h3>
                  </div>
                  <div className="text-5xl font-black text-emerald-500">
                    {productivity}
                  </div>
                  <div className="mt-4 text-sm text-slate-500">
                    Based on AI analysis
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[50px] border-4 border-white shadow-xl flex flex-col items-center">
                <h3 className="text-2xl font-black mb-8 text-center">
                  Voice AI Wellness Check
                </h3>
                <VoiceAIBtn onComplete={handleVoiceComplete} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-6">
                  Workplace Wellness Resources
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">EAP Services</h4>
                    <p className="text-sm text-blue-600">
                      Employee Assistance Program available 24/7
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <h4 className="font-bold text-emerald-800 mb-2">Desk Yoga</h4>
                    <p className="text-sm text-emerald-600">
                      Quick 5-minute exercises for stress relief
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-bold text-purple-800 mb-2">Therapist Connect</h4>
                    <p className="text-sm text-purple-600">
                      Book sessions with licensed professionals
                    </p>
                  </div>
                </div>
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
    </div>
  );
}
