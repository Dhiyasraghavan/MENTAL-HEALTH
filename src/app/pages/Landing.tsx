"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Landing: React.FC = () => {
  const router = useRouter();

  const colorClassesMap = {
    blue: {
      bg: "bg-blue-50",
      hoverBg: "group-hover:bg-blue-600",
      bar: "bg-blue-500",
    },
    indigo: {
      bg: "bg-indigo-50",
      hoverBg: "group-hover:bg-indigo-600",
      bar: "bg-indigo-500",
    },
    purple: {
      bg: "bg-purple-50",
      hoverBg: "group-hover:bg-purple-600",
      bar: "bg-purple-500",
    },
  } as const;

  const Portals = [
    { title: "Students", icon: "👨‍🎓", path: "/student", color: "blue" as const },
    {
      title: "IT Employees",
      icon: "💻",
      path: "/it-employee",
      color: "indigo" as const,
    },
    { title: "Senior Citizens", icon: "👴", path: "/elder", color: "purple" as const },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter gradient-text">
          Mental Health Hub
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          AI-driven emotional support for every stage of life. Choose your
          portal to begin.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {Portals.map((p, i) => {
          const colorClasses = colorClassesMap[p.color];

          return (
            <motion.div
              key={p.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => router.push(p.path)}
              className="cursor-pointer bg-white p-10 rounded-[40px] shadow-xl hover:shadow-2xl border border-slate-100 flex flex-col items-center group transition-all"
            >
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 ${colorClasses.bg} ${colorClasses.hoverBg} group-hover:text-white transition-colors duration-500 shadow-inner`}
              >
                {p.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-800">{p.title}</h3>
              <p className="text-slate-400 mt-2 font-medium text-center">
                Personalized tracking and emergency alerts.
              </p>
              <div
                className={`mt-6 w-12 h-1.5 rounded-full ${colorClasses.bar} transition-all group-hover:w-full`}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Landing;
