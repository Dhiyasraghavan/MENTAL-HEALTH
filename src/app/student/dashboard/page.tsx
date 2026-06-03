"use client";

import React, { Suspense } from "react";
import StudentDashboard from "@/app/pages/StudentDashboard";

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentDashboard />
    </Suspense>
  );
}

