"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Briefcase, User, Phone, MapPin, ArrowLeft, Shield, Zap } from "lucide-react";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import LightPillar from "@/app/components/LightPillar";

interface FormData {
  name: string;
  phone: string;
  address: string;
}

export default function ITEmployeePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Check if already logged in as IT employee
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "it-employee") {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    const userId = `it_${crypto.randomUUID()}`;
    const userData = {
      id: userId,
      role: "it-employee" as const,
      name: data.name,
      phone: data.phone,
      address: data.address,
      isAnonymous: false,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      const { upsertUserProfile } = await import("@/lib/db/users");
      await upsertUserProfile({
        id: userId,
        role: "it-employee",
        name: data.name,
        phone: data.phone,
        isAnonymous: false,
      });
    } catch (error) {
      console.error("Error saving user profile:", error);
      // Continue anyway
    }

    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/it-employee/dashboard");
  };

  const features = [
    { icon: <Shield className="w-4 h-4" />, text: "Burnout Prevention" },
    { icon: <Zap className="w-4 h-4" />, text: "Real-time Monitoring" },
    { icon: <User className="w-4 h-4" />, text: "Anonymous Support" },
  ];

  // ... imports ...

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
        className="bg-white/80 backdrop-blur-xl w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8 border border-white/50 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl mb-6"
          >
            <Briefcase className="text-white w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">
            IT Professional Wellness
          </h2>
          <p className="text-slate-600 font-medium mb-6">
            Prevent burnout with continuous AI monitoring and support
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-indigo-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200/50"
              >
                {feature.icon}
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.name ? "border-red-300 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                  } outline-none transition-all bg-white/70 backdrop-blur-sm font-medium`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number"
                  }
                })}
                type="tel"
                placeholder="10-digit phone number"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.phone ? "border-red-300 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                  } outline-none transition-all bg-white/70 backdrop-blur-sm font-medium`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <textarea
                {...register("address", { required: "Address is required" })}
                placeholder="Enter your address"
                rows={3}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.address ? "border-red-300 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                  } outline-none transition-all bg-white/70 backdrop-blur-sm resize-none font-medium`}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.address.message}</p>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-indigo-600 shadow-xl hover:shadow-2xl transition-all btn-hover-lift"
          >
            Access Wellness Dashboard
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-6 border-t border-slate-200/50 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold">24/7 Support</span>
            </div>
            <span>•</span>
            <span className="font-bold">Workplace Wellness</span>
          </div>
          <p className="text-xs text-slate-400">
            Your data is encrypted and secure. Anonymous mode available.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
