"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { School, ChevronRight } from "lucide-react";
import { COLLEGES } from "../types";

interface FormData {
  college: string;
}

const CollegeSelection: React.FC = () => {
  const router = useRouter();

  const { register, handleSubmit, control } = useForm<FormData>({
    defaultValues: { college: "" },
  });

  const selectedCollege = useWatch({ control, name: "college" });

  const onSubmit = (data: FormData) => {
    if (data.college) {
      const encoded = encodeURIComponent(data.college.replace(/\s+/g, "-"));
      router.push(`/student/dashboard?college=${encoded}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 gradient-blue-purple rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <School className="text-white w-10 h-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Select Your <span className="text-blue-600">College</span>
          </h1>

          <p className="text-lg text-slate-600">
            Join your campus community and access personalized mental wellness
            tools.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 space-y-6"
        >
          <div className="text-left space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">
              Institutions
            </label>

            <select
              {...register("college", { required: true })}
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-slate-50 cursor-pointer"
            >
              <option value="">Choose an institution...</option>
              {COLLEGES.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedCollege}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              selectedCollege
                ? "gradient-blue-purple hover:opacity-90"
                : "bg-slate-300 cursor-not-allowed shadow-none"
            }`}
          >
            Continue to Dashboard
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="flex justify-center gap-4 text-sm text-slate-400 font-medium">
          <span>Trusted by 50,000+ Students</span>
          <span>•</span>
          <span>AI Integrated Support</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CollegeSelection;
