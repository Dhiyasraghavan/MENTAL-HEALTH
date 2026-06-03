"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Building2, Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase/client";
import { getUserProfile } from "@/lib/db/users";
import { getCollege } from "@/lib/db/colleges";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import LightPillarLazy from "../components/LightPillarLazy";

interface LoginForm {
  email: string;
  password: string;
}

export default function CollegeAdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

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

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(
        getAuthClient(),
        data.email,
        data.password,
      );
      const profile = await getUserProfile(cred.user.uid);

      if (!profile || profile.role !== "college-admin") {
        setError("This account is not a college admin.");
        return;
      }
      if (!profile.collegeSlug) {
        setError("Your profile is missing college information.");
        return;
      }

      const college = await getCollege(profile.collegeSlug);
      if (!college) {
        setError("College not found. Please contact support.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: profile.id,
          role: profile.role,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          designation: "Admin",
          collegeSlug: profile.collegeSlug,
          collegeName: college.name,
          createdAt: profile.createdAt.toISOString(),
        }),
      );

      router.push(`/college-admin/dashboard?college=${profile.collegeSlug}`);
    } catch (e: any) {
      setError(e?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 rounded-[40px] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 gradient-blue-purple rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Admin Login
          </h1>
          <p className="text-slate-500 text-sm">
            Access your college dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="admin@college.edu"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-black text-white gradient-blue-purple shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {submitting ? "Logging in…" : "Login to Dashboard"}
          </button>

          <p className="text-xs text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/college-admin/register")}
              className="text-blue-600 font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
