"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HealthGauge from "@/app/components/HealthGauge";
import VoiceAIBtn from "@/app/components/VoiceAIBtn";
import PHQ9Chatbot from "@/app/components/PHQ9Chatbot";
import ResultsCard from "@/app/components/ResultsCard";
import { Severity } from "@/lib/types";
import { Heart, Activity, Phone, Calendar } from "lucide-react";

export default function ElderDashboard() {
  const router = useRouter();
  const [severity, setSeverity] = useState<Severity>(null);
  const [score, setScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string>("Not yet");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/elder/login");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== "elder") {
        router.push("/");
      }
    } catch {
      router.push("/elder/login");
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
    setHealthScore(scr);
    setLastCheckIn(new Date().toLocaleDateString());
  };

  const handlePHQ9Complete = (sev: Severity, healthScore: number) => {
    setSeverity(sev);
    setScore(healthScore);
    setHealthScore(healthScore);
    setRecommendations(["Regular check-ins recommended"]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="bg-white p-8 rounded-[40px] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-800 mb-2">
                Elder Wellness Dashboard
              </h1>
              <p className="text-slate-500">
                Your health monitoring and support center
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">Active Monitoring</span>
            </div>
          </div>
        </header>

        {!severity ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800">Your Health Score</h3>
                  <div className="text-sm text-slate-500">Last check: {lastCheckIn}</div>
                </div>
                <div className="flex items-center justify-center">
                  <HealthGauge score={healthScore} size={200} />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-emerald-600">Good</div>
                    <div className="text-xs text-slate-500">Overall</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">Stable</div>
                    <div className="text-xs text-slate-500">Mood</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-purple-600">Active</div>
                    <div className="text-xs text-slate-500">Status</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[50px] border-4 border-white shadow-xl flex flex-col items-center">
                <h3 className="text-2xl font-black mb-8 text-center">
                  Voice Wellness Check
                </h3>
                <VoiceAIBtn onComplete={handleVoiceComplete} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-blue-800">Emergency</div>
                  </button>
                  <button className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-purple-800">Schedule</div>
                  </button>
                  <button className="p-6 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center">
                    <Heart className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-emerald-800">Health Report</div>
                  </button>
                  <button className="p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-center">
                    <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-orange-800">Medication</div>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black mb-4">Fall Detection AI</h3>
                <p className="text-purple-100 mb-6 text-sm">
                  Your safety is monitored 24/7. Automatic alerts sent to your guardian.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-bold">Active & Monitoring</span>
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
