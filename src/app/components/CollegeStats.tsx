"use client";

import React from "react";
import { TrendingUp, Users, AlertTriangle, Clock } from "lucide-react";
import type { CollegeMetrics } from "@/lib/db/metrics";

interface Props {
  metrics: CollegeMetrics;
}

export default function CollegeStats({ metrics }: Props) {
  const activePercentage = Math.round(
    (metrics.studentsActive / (metrics.studentsTotal || 1)) * 100
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-800">College Analytics</h3>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
          Admin View
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-500 uppercase">
              Active
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {metrics.studentsActive}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            of {metrics.studentsTotal} ({activePercentage}%)
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase">
              Health Score
            </span>
          </div>
          <div className="text-2xl font-black text-blue-600">
            {metrics.avgHealthScore}%
          </div>
          <div className="text-xs text-blue-500 mt-1">Average</div>
        </div>

        <div className="bg-red-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-600 uppercase">
              High Risk
            </span>
          </div>
          <div className="text-2xl font-black text-red-600">
            {metrics.highRiskAlerts}
          </div>
          <div className="text-xs text-red-500 mt-1">Alerts</div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase">
              Response
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {metrics.avgResponseTimeMin}m
          </div>
          <div className="text-xs text-emerald-500 mt-1">Avg Time</div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Community Health</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                style={{ width: `${metrics.avgHealthScore}%` }}
              />
            </div>
            <span className="text-slate-500 font-bold text-xs">
              {metrics.avgHealthScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

