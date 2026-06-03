"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Camera, Shield } from "lucide-react";
import LightPillar from "@/app/components/LightPillar";

export default function ElderLogin() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"face" | "manual">("face");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if already logged in as elder
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "elder") {
          router.push("/elder/dashboard");
          return;
        }
      }
    } catch {
      // Invalid user data, continue to login
    }
  }, [router]);

  const handleFaceUnlock = async () => {
    setIsProcessing(true);
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support camera access. Please use Chrome, Firefox, or Edge.");
        setIsProcessing(false);
        return;
      }

      // Simulate face recognition
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // In production: Send to face recognition API
      setTimeout(async () => {
        stream.getTracks().forEach((track) => track.stop());

        const userId = crypto.randomUUID();
        const finalUserId = `elder_face_${userId}`;

        // Save to Firestore
        try {
          const { upsertUserProfile } = await import("@/lib/db/users");
          await upsertUserProfile({
            id: finalUserId,
            role: "elder",
            name: "Elder User",
            isAnonymous: false,
          });
        } catch (error) {
          console.error("Error saving user profile:", error);
          // Continue anyway
        }

        const userData = {
          id: finalUserId,
          role: "elder" as const,
          name: "Elder User",
          isAnonymous: false,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setIsProcessing(false);
        router.push("/elder/dashboard");
      }, 2000);
    } catch (error: any) {
      setIsProcessing(false);
      let message = "Camera access required for face unlock. Please allow camera permissions.";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        message = "Camera access was denied. Please check your browser permissions and allow access, then refresh the page.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        message = "No camera found. Please connect a camera and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        message = "Camera is already in use by another application. Please close other apps and try again.";
      }

      alert(message);
    }
  };

  const handleManualLogin = async () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const userId = crypto.randomUUID();
    const finalUserId = `elder_${userId}`;

    // Save to Firestore
    try {
      const { upsertUserProfile } = await import("@/lib/db/users");
      await upsertUserProfile({
        id: finalUserId,
        role: "elder",
        name: name,
        isAnonymous: false,
      });
    } catch (error) {
      console.error("Error saving user profile:", error);
      // Continue anyway
    }

    const userData = {
      id: finalUserId,
      role: "elder" as const,
      name: name,
      isAnonymous: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/elder/dashboard");
  };



  // ... existing code ...

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
        className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-10 rounded-[40px] shadow-2xl space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <User className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Elder Portal Login
          </h1>
          <p className="text-slate-500 text-sm">
            Secure access to your wellness dashboard
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLoginMethod("face")}
              className={`p-4 rounded-xl border-2 transition-all ${loginMethod === "face"
                ? "border-purple-500 bg-purple-50"
                : "border-slate-200 bg-slate-50"
                }`}
            >
              <Camera className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-bold">Face Unlock</div>
            </button>
            <button
              onClick={() => setLoginMethod("manual")}
              className={`p-4 rounded-xl border-2 transition-all ${loginMethod === "manual"
                ? "border-purple-500 bg-purple-50"
                : "border-slate-200 bg-slate-50"
                }`}
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-bold">Manual Login</div>
            </button>
          </div>

          {loginMethod === "face" ? (
            <div className="space-y-4">
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <p className="text-sm text-slate-700 mb-4">
                  Position your face in front of the camera for recognition
                </p>
                <button
                  onClick={handleFaceUnlock}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Start Face Recognition"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-slate-50"
                />
              </div>
              <button
                onClick={handleManualLogin}
                className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-all"
              >
                Login to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-200 text-center">
          <button
            onClick={() => router.push("/elder/guardian")}
            className="text-sm text-purple-600 font-bold hover:text-purple-700"
          >
            Are you a Guardian? Click here →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
