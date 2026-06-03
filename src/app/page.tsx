"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Award } from "lucide-react";
import MultiLangToggle from "./components/MultiLangToggle";
import MagnetLinesLazy from "./components/MagnetLinesLazy";

import { getCurrentUser, getDashboardPath } from "@/lib/auth";

const colorClassesMap = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    hoverBg:
      "group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-700",
    bar: "bg-gradient-to-r from-blue-500 to-blue-600",
    ring: "ring-blue-200",
    shadow: "shadow-blue-100",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    hoverBg:
      "group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-indigo-700",
    bar: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    ring: "ring-indigo-200",
    shadow: "shadow-indigo-100",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    hoverBg:
      "group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-purple-700",
    bar: "bg-gradient-to-r from-purple-500 to-purple-600",
    ring: "ring-purple-200",
    shadow: "shadow-purple-100",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    hoverBg:
      "group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-700",
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    ring: "ring-emerald-200",
    shadow: "shadow-emerald-100",
  },
} as const;

const Portals = [
  {
    title: "Students",
    icon: "🎓",
    path: "/student",
    color: "blue" as const,
    desc: "Campus-based emotional wellness & AI-powered support",
    features: ["24/7 AI Counselor", "Peer Support", "Crisis Detection"],
    comingSoon: false,
  },
  {
    title: "IT Professionals",
    icon: "💻",
    path: "/it-employee",
    color: "indigo" as const,
    desc: "Burnout prevention & workplace mental wellness",
    features: ["Stress Monitoring", "Work-Life Balance", "Team Support"],
    comingSoon: false,
  },
  {
    title: "Senior Citizens",
    icon: "👵",
    path: "/elder",
    color: "purple" as const,
    desc: "Guardian monitoring & AI safety assistance",
    features: ["Fall Detection", "Health Tracking", "Family Connect"],
    comingSoon: false,
  },
  {
    title: "College Administrators",
    icon: "🏫",
    path: "/college-admin",
    color: "emerald" as const,
    desc: "Monitor student wellness & manage campus health",
    features: ["Analytics Dashboard", "Risk Assessment", "Resource Management"],
    comingSoon: false,
  },
];

export default function Landing() {
  const router = useRouter();

  // Check if user is already logged in and redirect to their dashboard
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* MagnetLines Background Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <MagnetLinesLazy
          rows={12}
          columns={16}
          containerSize="100vw"
          lineColor="#ffffff"
          lineWidth="2px"
          lineHeight="40px"
          baseAngle={0}
        />
      </div>
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#384589]/20 to-[#5A4485]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#5A4485]/20 to-[#384589]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-14 h-14 gradient-aurora rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-slate-100 tracking-tight">
                Mental Health Hub
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-slate-400 font-semibold">Live</p>
              </div>
            </div>
          </div>
          <MultiLangToggle />
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-20 space-y-8 flex-1 flex flex-col justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#384589]/10 to-[#5A4485]/10 text-white rounded-full text-sm font-bold mb-6 shadow-lg border border-[#384589]/30"
          >
            <Award className="w-5 h-5 text-white" />
            <span>AI-Powered Wellness Platform</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight"
          >
            Mental Health
            <br />
            <span className="text-5xl md:text-7xl">Hub</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-2xl text-slate-200 font-semibold max-w-3xl mx-auto leading-relaxed">
              AI-driven emotional support for every stage of life
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Choose your portal to begin your personalized wellness journey
              with our advanced AI counselors and human support network.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-300"
          >
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Anonymous & Secure</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full shadow-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Multi-language</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full mb-20">
          {Portals.map((p, i) => {
            const colorClasses = colorClassesMap[p.color];

            return (
              <motion.div
                key={p.path}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={p.comingSoon ? {} : { y: -8, scale: 1.02 }}
                whileTap={p.comingSoon ? {} : { scale: 0.98 }}
                onClick={p.comingSoon ? undefined : () => router.push(p.path)}
                className={`${
                  p.comingSoon
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer hover:shadow-2xl hover:shadow-[#384589]/20"
                } glass-effect p-8 rounded-[32px] shadow-xl border border-[#384589]/20 flex flex-col items-center group transition-all duration-300 relative overflow-hidden`}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {p.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black rounded-full shadow-lg">
                    COMING SOON
                  </div>
                )}

                <motion.div
                  whileHover={p.comingSoon ? {} : { scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 ${colorClasses.bg} ${
                    p.comingSoon ? "" : colorClasses.hoverBg
                  } ${
                    p.comingSoon
                      ? ""
                      : "group-hover:text-white group-hover:shadow-lg"
                  } transition-all duration-7 00 shadow-sm relative z-10`}
                >
                  {p.icon}
                </motion.div>

                <h3 className="text-xl font-black text-slate-100 mb-3 text-center leading-tight relative z-10">
                  {p.title}
                </h3>

                <p className="text-slate-300 font-medium text-center text-sm mb-4 leading-relaxed relative z-10">
                  {p.desc}
                </p>

                {/* Features list */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-6 relative z-10">
                  {p.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full font-medium border border-slate-600/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {p.comingSoon ? (
                  <div className="px-6 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full text-sm font-bold relative z-10">
                    Available Soon
                  </div>
                ) : (
                  <motion.div
                    className={`w-16 h-1.5 rounded-full ${colorClasses.bar} transition-all duration-300 group-hover:w-24 relative z-10 shadow-sm`}
                    whileHover={{ scale: 1.1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-6 pt-12 border-t border-slate-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <div className="w-8 h-8 gradient-aurora rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Good Health & Well-being</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <div className="w-8 h-8 gradient-aurora rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">AI + Human Hybrid Support</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold">24/7 Available Worldwide</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-300">
            <span className="px-3 py-1 glass-effect rounded-full font-semibold">
              Anonymous
            </span>
            <span className="px-3 py-1 glass-effect rounded-full font-semibold">
              End-to-End Encrypted
            </span>
            <span className="px-3 py-1 glass-effect rounded-full font-semibold">
              Multi-language
            </span>
            <span className="px-3 py-1 glass-effect rounded-full font-semibold">
              HIPAA Compliant
            </span>
            <span className="px-3 py-1 glass-effect rounded-full font-semibold">
              Production Ready
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Powered by advanced AI technology and backed by licensed mental
            health professionals. Your privacy and well-being are our top
            priorities.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
