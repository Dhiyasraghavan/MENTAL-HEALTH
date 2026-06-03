"use client";

import React, { Suspense } from "react";
import CollegeAdminDashboard from "@/app/pages/CollegeAdminDashboard";

export default function CollegeAdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CollegeAdminDashboard />
    </Suspense>
  );
}
