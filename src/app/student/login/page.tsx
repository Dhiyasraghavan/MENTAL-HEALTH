"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { School, User, Lock, Eye, EyeOff } from "lucide-react";
import { getCollege } from "@/lib/db/colleges";
import { upsertUserProfile } from "@/lib/db/users";
import LightPillar from "@/app/components/LightPillar";

interface LoginForm {
  name: string;
  regNo: string;
  isAnonymous: boolean;
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";
  const [collegeName, setCollegeName] = useState<string>("");
  const [validCollege, setValidCollege] = useState<boolean>(true);
  const [showRegNo, setShowRegNo] = useState(false);

  const { register, handleSubmit, control } = useForm<LoginForm>({
    defaultValues: {
      name: "",
      regNo: "",
      isAnonymous: false, // Changed to false so users can enter their details by default
    },
  });

  const isAnonymous = useWatch({ control, name: "isAnonymous" });

  // Check if already logged in as student
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "student" && user.collegeSlug) {
          // Already logged in, redirect to dashboard
          router.push(`/student/dashboard?college=${user.collegeSlug}`);
          return;
        }
      }
    } catch {
      // Invalid user data, continue to login
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = collegeSlug ? await getCollege(collegeSlug) : null;
        if (!mounted) return;
        if (!c || c.status !== "active") {
          setValidCollege(false);
          setCollegeName("");
          return;
        }
        setValidCollege(true);
        setCollegeName(c.name);
      } catch {
        if (!mounted) return;
        setValidCollege(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [collegeSlug]);

  const onSubmit = async (data: LoginForm) => {
    if (!validCollege) {
      alert("Please select a college first");
      router.push("/student");
      return;
    }

    // Generate user ID
    const userId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID() === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-$ {Math.random().toString(36).slice(2, 10)}`;
    const finalUserId = data.isAnonymous
      ? `student_anon_${userId}`
      : `student_${userId}`;

    // Save user profile to Firestore
    try {
      await upsertUserProfile({
        id: finalUserId,
        role: "student",
        name: data.isAnonymous ? "Anonymous Student" : data.name,
        collegeSlug,
        isAnonymous: data.isAnonymous,
      });
    } catch (error) {
      console.error("Error saving user profile:", error);
      // Continue anyway - user can still use the app
    }

    // Save user session to localStorage
    const userData = {
      id: finalUserId,
      role: "student" as const,
      name: data.isAnonymous ? "Anonymous Student" : data.name,
      regNo: data.isAnonymous ? null : data.regNo,
      collegeSlug,
      isAnonymous: data.isAnonymous,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));

    router.push(`/student/dashboard?college=${collegeSlug}`);
  };

  if (!validCollege) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid college selected</p>
          <button
            onClick={() => router.push("/student")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LightPillar
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
            <School className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to <br></br>{collegeName || "your college"}
          </h1>
          <p className="text-white text-sm">
            Secure, anonymous mental health support
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Full Name{" "}
              {!isAnonymous && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                {...register("name", { required: !isAnonymous })}
                disabled={isAnonymous}
                type="text"
                placeholder={isAnonymous ? "Anonymous" : "Enter your name"}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Registration Number{" "}
              {!isAnonymous && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                {...register("regNo", { required: !isAnonymous })}
                disabled={isAnonymous}
                type={showRegNo ? "text" : "password"}
                placeholder={isAnonymous ? "Not required" : "Enter reg number"}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50 disabled:opacity-50"
              />
              {!isAnonymous && (
                <button
                  type="button"
                  onClick={() => setShowRegNo(!showRegNo)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-600"
                >
                  {showRegNo ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <input
              {...register("isAnonymous")}
              type="checkbox"
              id="anonymous"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="anonymous"
              className="flex-1 text-sm font-medium text-white cursor-pointer"
            >
              <span className="font-bold text-blue-600">Anonymous Mode</span>
              <span className="block text-xs text-black mt-1">
                Your identity will be protected. No personal data stored.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-black text-white gradient-blue-purple shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Enter Dashboard
          </button>

          <p className="text-xs text-center text-white">
            By continuing, you agree to our privacy policy and terms of service.
            <br />

          </p>
        </form>
      </motion.div>
    </div>
  );
}
