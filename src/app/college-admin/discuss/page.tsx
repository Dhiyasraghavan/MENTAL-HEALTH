"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  StopCircle,
  Users,
  Mic,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import {
  endDiscussSession,
  findActiveSession,
  setActiveSpeaker,
  startDiscussSession,
  subscribeToDiscussSession,
} from "@/lib/db/discuss";
import type { DiscussSession } from "@/lib/types";

// Helper for professional positioning
function getSeatTransform(index: number, radius: number) {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
}

export default function CollegeAdminDiscussPage() {
  const router = useRouter();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DiscussPageContent />
    </Suspense>
  );
}

function DiscussPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";

  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<DiscussSession | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string>("");

  const [me, setMe] = useState<{
    id: string;
    role: string;
    name: string;
  } | null>(null);

  // Load user on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        router.push("/college-admin/login");
        return;
      }
      setMe(JSON.parse(raw));
    } catch {
      router.push("/college-admin/login");
    }
  }, [router]);

  useEffect(() => {
    if (!me) {
      return; // Wait for user to load
    }
    if (!collegeSlug) {
      setStatus("error");
      setError("Missing college context.");
      return;
    }

    let unsub: (() => void) | null = null;
    (async () => {
      try {
        setStatus("loading");
        const active = await findActiveSession(collegeSlug);
        if (active) {
          setSessionId(active.id);
          unsub = subscribeToDiscussSession(active.id, setSession);
        }
        setStatus("ready");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message || "Failed to load session.");
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [collegeSlug, me, router]);

  const handleStart = async () => {
    if (!me) return;
    try {
      setError("");
      setStatus("loading");
      const id = await startDiscussSession({
        collegeSlug,
        psychiatristUserId: me.id,
        psychiatristDisplayName: "Psychiatrist",
      });
      setSessionId(id);
      setStatus("ready");
      subscribeToDiscussSession(id, setSession);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Failed to start session.");
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to end this session for everyone?")) {
      await endDiscussSession(sessionId);
      setSession(null);
      setSessionId("");
    }
  };

  const connectedCount =
    session?.seats?.filter((s) => Boolean(s.userId)).length ?? 0;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3 h-3" />
              Moderator Dashboard
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Discussion Control
            </h1>
            <p className="text-slate-400 max-w-md">
              Manage the live floor. Click on a connected member to grant them
              the microphone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-semibold hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
            </button>
          </div>
        </header>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-12 p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
          {!sessionId ? (
            <button
              onClick={handleStart}
              disabled={status === "loading"}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> Start New Session
            </button>
          ) : (
            <button
              onClick={handleEnd}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition-all"
            >
              <StopCircle className="w-4 h-4" /> Terminate Session
            </button>
          )}

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-6 px-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">
                <strong className="text-white">{connectedCount}</strong> / 6
                Present
              </span>
            </div>
          </div>
        </div>

        {status === "error" && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <main className="relative min-h-[600px] flex items-center justify-center bg-white/[0.01] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]" />

          {!session && status === "ready" && (
            <div className="text-center space-y-4 relative z-10">
              <div className="w-20 h-20 bg-blue-500/5 border border-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <h2 className="text-xl font-bold text-white">System Standby</h2>
              <p className="text-slate-500 text-sm">
                Waiting for moderator to initialize the room.
              </p>
            </div>
          )}

          {session && (
            <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center scale-90 md:scale-100">
              {/* Central Table Visual */}
              <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent" />
              <div className="absolute w-[65%] h-[65%] rounded-full border border-white/5 bg-black/40 shadow-2xl" />

              {/* Seats */}
              {session.seats.map((s) => {
                const isActive =
                  session.activeSpeakerSeatIndex === Number(s.seatIndex);
                const isPsych = s.kind === "psychiatrist";
                const occupied = Boolean(s.userId);

                // Position logic
                const radius =
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 130
                    : 190;
                const { x, y } = getSeatTransform(Number(s.seatIndex), radius);

                return (
                  <motion.button
                    key={s.seatIndex}
                    onClick={() =>
                      occupied &&
                      setActiveSpeaker(session.id, Number(s.seatIndex))
                    }
                    className="absolute z-20 group outline-none"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        relative w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 border-2
                        ${isActive ? "bg-blue-600/20 border-blue-400 shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] scale-110" : "bg-slate-900/80 border-white/10"}
                        ${occupied ? "cursor-pointer hover:border-blue-400/50" : "cursor-default opacity-40 grayscale"}
                        ${isPsych ? "border-purple-500/40 bg-purple-500/5" : ""}
                      `}
                      >
                        {/* Status Light */}
                        {occupied && (
                          <div
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-[#05070a] ${isActive ? "bg-blue-400" : "bg-emerald-500"}`}
                          />
                        )}

                        <div
                          className={`
                          w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300
                          ${isActive ? "bg-blue-500 scale-110" : occupied ? "bg-slate-700" : "bg-slate-800"}
                          ${isPsych ? "bg-gradient-to-tr from-purple-500 to-indigo-500" : ""}
                        `}
                        />

                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-[2rem] bg-blue-500/30"
                          />
                        )}
                      </div>

                      {/* Labels */}
                      <div className="mt-4 flex flex-col items-center gap-1 w-32">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${isPsych ? "text-purple-400" : "text-slate-500"}`}
                        >
                          {isPsych
                            ? "Moderator"
                            : `Member ${Number(s.seatIndex)}`}
                        </span>

                        <div className="h-5 flex items-center">
                          {isActive ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                              <Mic className="w-3 h-3 text-blue-400" />
                              <span className="text-[10px] font-bold text-blue-400 uppercase">
                                Live
                              </span>
                            </div>
                          ) : occupied ? (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              Ready
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-700 uppercase italic">
                              Empty
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </main>

        {/* Admin Footer */}
        {session && (
          <footer className="mt-12 flex justify-center">
            <div className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 font-mono">
              Instance ID: {sessionId}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
