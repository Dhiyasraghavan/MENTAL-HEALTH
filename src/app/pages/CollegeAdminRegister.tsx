"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, User, Phone } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase/client";
import { upsertCollege } from "@/lib/db/colleges";
import { upsertUserProfile } from "@/lib/db/users";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  collegeName: string;
  designation: string;
}

export default function CollegeAdminRegister() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterForm>();
  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setSubmitting(true);

    try {
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (data.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (!data.collegeName.trim()) {
        setError("Please enter your college name.");
        return;
      }

      // 1) Create Firebase Auth user (email/password)
      const cred = await createUserWithEmailAndPassword(
        getAuthClient(),
        data.email,
        data.password
      );

      // 2) Create / upsert the college doc -> this makes it appear in StudentSelection (active colleges)
      const college = await upsertCollege({
        name: data.collegeName,
        status: "active",
        createdByUserId: cred.user.uid,
      });

      // 3) Create profile in Firestore
      await upsertUserProfile({
        id: cred.user.uid,
        role: "college-admin",
        name: data.name,
        email: data.email,
        phone: data.phone,
        collegeSlug: college.slug,
        isAnonymous: false,
      });

      // 4) Keep current app session behavior (localStorage) so the rest of the app keeps working
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: cred.user.uid,
          role: "college-admin",
          name: data.name,
          email: data.email,
          phone: data.phone,
          designation: data.designation,
          collegeSlug: college.slug,
          collegeName: college.name,
          createdAt: new Date().toISOString(),
        })
      );

      router.push(`/college-admin/dashboard?college=${college.slug}`);
    } catch (e: any) {
      setError(e?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 gradient-blue-purple rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Register Your Institution
          </h1>
          <p className="text-slate-500 text-sm">
            Create an admin account for your college
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
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="Enter your full name"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
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
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
                type="tel"
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Designation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("designation", { required: "Designation is required" })}
                type="text"
                placeholder="e.g., Counselor, Dean, Admin"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.designation && (
              <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              College Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("collegeName", { required: "College name is required" })}
                type="text"
                placeholder="Enter your college name (this will be shown to students)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.collegeName && (
              <p className="text-red-500 text-xs mt-1">{errors.collegeName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                placeholder="Create a password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                })}
                type="password"
                placeholder="Confirm password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-black text-white gradient-blue-purple shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {submitting ? "Registering…" : "Register & Continue"}
          </button>

          <p className="text-xs text-center text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/college-admin/login")}
              className="text-blue-600 font-bold hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
