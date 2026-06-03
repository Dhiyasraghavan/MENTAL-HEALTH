"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  User,
  ArrowLeft,
  Activity,
  Users,
  Phone,
} from "lucide-react";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import LightPillarLazy from "@/app/components/LightPillarLazy";

export default function ElderSelection() {
  const router = useRouter();

  // Check if already logged in as elder or guardian
  useEffect(() => {
    const user = getCurrentUser();
    if (user && (user.role === "elder" || user.role === "guardian")) {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    }
  }, [router]);

  const handleGuardianMode = () => {
    // Create guardian session
    const guardianId = crypto.randomUUID();
    const userData = {
      id: `guardian_${guardianId}`,
      role: "guardian" as const,
      name: "Guardian",
      isAnonymous: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/elder/guardian");
  };

  const elderFeatures = [
    { icon: <Activity className="w-4 h-4" />, text: "Health Monitoring" },
    { icon: <Shield className="w-4 h-4" />, text: "Fall Detection" },
    { icon: <Heart className="w-4 h-4" />, text: "Wellness Support" },
  ];

  const guardianFeatures = [
    { icon: <Users className="w-4 h-4" />, text: "Family Connect" },
    { icon: <Phone className="w-4 h-4" />, text: "Emergency Alerts" },
    { icon: <Activity className="w-4 h-4" />, text: "Health Insights" },
  ];

  // ... imports ...

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LightPillarLazy
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all text-slate-600 hover:text-slate-800 z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl w-full max-w-2xl p-10 rounded-[40px] shadow-2xl space-y-8 text-center border border-white/50 relative z-10"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            👵
          </motion.div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">
              Elder Care Portal
            </h2>
            <p className="text-xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
              AI-powered monitoring and support for senior wellness and safety
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/elder/login")}
            className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:border-purple-400 hover:shadow-xl transition-all font-bold text-left group relative overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    Elder Portal
                  </h3>
                  <p className="text-sm text-purple-600 font-semibold">
                    Face Unlock / Manual Login
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-4 leading-relaxed">
                Access your personal wellness dashboard with AI health
                monitoring
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {elderFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/70 rounded-full text-xs font-semibold text-purple-700"
                  >
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuardianMode}
            className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:border-purple-400 hover:shadow-xl transition-all font-bold text-left group relative overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    Guardian Portal
                  </h3>
                  <p className="text-sm text-purple-600 font-semibold">
                    Monitor & Support
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-4 leading-relaxed">
                Monitor your loved one's wellness and receive important alerts
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {guardianFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/70 rounded-full text-xs font-semibold text-purple-700"
                  >
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-8 border-t border-slate-200/50 space-y-4"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <h3 className="text-lg font-black text-slate-800 mb-3">
              Advanced AI Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-semibold">Fall Detection AI</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="font-semibold">Health Monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span className="font-semibold">Emergency Response</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="font-bold">Good Health & Well-being</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold">24/7 Monitoring Active</span>
            </div>
            <span>•</span>
            <span className="font-bold">HIPAA Compliant</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
