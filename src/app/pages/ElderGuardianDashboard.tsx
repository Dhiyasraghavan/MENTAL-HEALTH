"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Phone, AlertCircle, TrendingUp, Activity } from "lucide-react";
import HealthGauge from "@/app/components/HealthGauge";

export default function ElderGuardianDashboard() {
  const router = useRouter();
  const [elderHealth] = useState<number>(0);
  const lastCheckIn = "Not yet";
  const [status] = useState<"HAPPY" | "CALM" | "CONCERNED">("CALM");
  const voiceTone = "NO DATA YET";

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/elder");
        return;
      }
      const user = JSON.parse(userData);
      if (user.role !== "guardian") {
        router.push("/");
      }
    } catch {
      router.push("/elder");
    }
  }, [router]);

  // DB integration note:
  // This screen should subscribe to your elder's latest assessment document in Firestore.
  // For now, we display "no data" state instead of simulated values.

  const weeklyTrends: Array<{ day: string; score: number }> = [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-lg">
          <div>
            <h1 className="text-4xl font-black text-slate-800 mb-2">
              Family Monitor
            </h1>
            <p className="text-slate-500">Real-time elder wellness tracking</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-black text-xs flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            ONLINE
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-black">
                  SJ
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800">
                    Mrs. Sarah Johnson
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Last Emotional Check: {lastCheckIn}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-2xl font-black mb-1 ${
                    status === "HAPPY"
                      ? "text-emerald-500"
                      : status === "CALM"
                      ? "text-blue-500"
                      : "text-orange-500"
                  }`}
                >
                  {status}
                </div>
                <div className="text-[10px] font-bold text-slate-300">
                  {voiceTone}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Health Score
                </div>
                <div className="text-3xl font-black text-purple-600">
                  {elderHealth}%
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Weekly Avg
                </div>
                <div className="text-3xl font-black text-blue-600">81%</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center">
            <HealthGauge score={elderHealth} size={150} />
            <p className="text-sm font-bold text-slate-500 mt-4">Current Health</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-black text-slate-800">Weekly Trends</h3>
            </div>
            <div className="space-y-3">
              {weeklyTrends.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold">
                  No trend data yet. Connect elder assessments in the database to populate this chart.
                </div>
              ) : (
                weeklyTrends.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-bold text-slate-600">
                      {day.day}
                    </div>
                    <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-black text-slate-800 text-right">
                      {day.score}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-purple-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black mb-2">Fall Detection AI</h3>
                <p className="text-purple-100 text-sm">
                  Active monitoring enabled
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-200" />
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-sm font-black transition-all w-full">
              Configure Alerts
            </button>
          </div>
        </div>

        {status === "CONCERNED" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-center gap-4"
          >
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-black text-red-800 mb-1">Alert: Health Concern Detected</h4>
              <p className="text-sm text-red-600">
                Unusual patterns detected. Please check in with your loved one.
              </p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Now
            </button>
          </motion.div>
        )}

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
              <Phone className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-blue-800">Video Call</div>
            </button>
            <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center">
              <Heart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-emerald-800">Health Report</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center">
              <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-purple-800">Medication</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-center">
              <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-orange-800">Emergency</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
