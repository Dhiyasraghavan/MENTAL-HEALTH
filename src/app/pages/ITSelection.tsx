"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";

const ITSelection: React.FC = () => {
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">💻</div>
          <h2 className="text-3xl font-black text-slate-800">
            IT Employee Wellness
          </h2>
          <p className="text-slate-500 font-medium">
            Prevent burnout with continuous AI monitoring
          </p>
        </div>

        <button
          onClick={() => router.push("/it-employee/dashboard")}
          className="w-full py-5 rounded-2xl font-black text-white bg-indigo-600 shadow-xl hover:shadow-2xl transition-all"
        >
          Check Dashboard
        </button>
      </div>
    </div>
  );
};

export default ITSelection;
