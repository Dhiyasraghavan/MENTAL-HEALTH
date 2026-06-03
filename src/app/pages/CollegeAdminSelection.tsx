"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, LogIn, UserPlus } from "lucide-react";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import LightPillarLazy from "../components/LightPillarLazy";

export default function CollegeAdminSelection() {
  const router = useRouter();

  // Check if already logged in as admin
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "college-admin") {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    }
  }, [router]);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto w-20 h-20 gradient-blue-purple rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            College Administration Portal
          </h2>
          <p className="text-slate-500 font-medium">
            Monitor student wellness and manage campus mental health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/college-admin/login")}
            className="p-8 border-2 border-blue-200 bg-blue-50 rounded-3xl hover:border-blue-500 hover:bg-blue-100 transition-all font-bold text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Login</h3>
                <p className="text-xs text-blue-600">Existing Admin</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Access your college dashboard
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/college-admin/register")}
            className="p-8 border-2 border-slate-200 rounded-3xl hover:border-blue-500 transition-all font-bold text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <UserPlus className="w-6 h-6 text-slate-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Register</h3>
                <p className="text-xs text-slate-500">New College</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Register your institution</p>
          </motion.button>
        </div>

        <div className="pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            <span className="font-bold">SDG 3.4 Aligned</span> • Secure Admin
            Access
          </p>
        </div>
      </motion.div>
    </div>
  );
}
