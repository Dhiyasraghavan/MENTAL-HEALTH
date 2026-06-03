"use client";
import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, MicOff, Users, ArrowLeft } from "lucide-react";
import {
  findActiveSession,
  joinDiscussSession,
  subscribeToDiscussSession,
} from "@/lib/db/discuss";
import type { DiscussSession } from "@/lib/types";

// Helper to calculate polar coordinates
function getSeatTransform(index: number, radius: number) {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
}

export default function StudentDiscussPage() {
  const router = useRouter();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DiscussPageContent router={router} />
    </Suspense>
  );
}

function DiscussPageContent({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  const searchParams = useSearchParams();
  const collegeSlug = searchParams.get("college") || "";

  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<DiscussSession | null>(null);
  const [status, setStatus] = useState<
    "loading" | "no-session" | "ready" | "error"
  >("loading");
  const [error, setError] = useState<string>("");
  const [mySeat, setMySeat] = useState<number | null>(null);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

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
        router.push("/student/login");
        return;
      }
      setMe(JSON.parse(raw));
    } catch {
      router.push("/student/login");
    }
  }, [router]);

  // Mic logic
  useEffect(() => {
    if (!session || mySeat === null) return;
    const isActive = session.activeSpeakerSeatIndex === mySeat;
    setIsMyTurn(isActive);

    if (isActive && micPermission === "prompt") {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          setMicPermission("granted");
        } catch (err) {
          setMicPermission("denied");
        }
      })();
    } else if (!isActive && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMicPermission("prompt");
    }
  }, [session?.activeSpeakerSeatIndex, mySeat, micPermission]);

  // Data fetching logic
  useEffect(() => {
    if (!collegeSlug) {
      setStatus("error");
      setError("Missing college context.");
      return;
    }
    if (!me) {
      return; // Wait for user to load
    }

    let unsub: (() => void) | null = null;
    (async () => {
      try {
        setStatus("loading");
        const active = await findActiveSession(collegeSlug);
        if (!active) {
          setStatus("no-session");
          return;
        }

        setSessionId(active.id);
        unsub = subscribeToDiscussSession(active.id, setSession);
        const seatIndex = await joinDiscussSession({
          sessionId: active.id,
          userId: me.id,
          displayName: "Anonymous Member",
        });
        setMySeat(seatIndex);
        setStatus("ready");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message || "Connection failed.");
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [collegeSlug, me, router]);

  const connectedCount = session?.seats?.filter((s) => !!s.userId).length ?? 0;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Live Discussion
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Group Session
            </h1>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Safe, anonymous space. Your identity is hidden. Wait for your
              highlight to speak.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{connectedCount}/6</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <button
                onClick={() => router.back()}
                className="text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Exit
              </button>
            </div>
          </div>
        </header>

        {/* Main Interface Area */}
        <main className="relative flex flex-col items-center justify-center min-h-[500px]">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-500 animate-pulse font-medium">
                Joining secure room...
              </p>
            </div>
          )}

          {status === "no-session" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-sm"
            >
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Active Session
              </h3>
              <p className="text-slate-400 text-sm">
                The moderator hasn't started a group discussion for this campus
                yet.
              </p>
            </motion.div>
          )}

          {session && (
            <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
              {/* Turn Indicator HUD */}
              <AnimatePresence>
                {isMyTurn && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-12 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-900/20 border border-blue-400/30"
                  >
                    <Mic className="w-5 h-5 animate-bounce" />
                    <span className="font-bold tracking-tight">
                      You are the active speaker
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Table Visual */}
              <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shadow-inner" />
              <div className="absolute w-1/2 h-1/2 rounded-full border border-white/5 bg-black/20" />

              {/* Seats */}
              {session.seats.map((s, idx) => {
                const isPsych = s.kind === "psychiatrist";
                const isActive =
                  session.activeSpeakerSeatIndex === Number(s.seatIndex);
                const isMe = mySeat === Number(s.seatIndex);
                const occupied = !!s.userId;

                // Calculate position based on circle
                const radius =
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 120
                    : 180;
                const { x, y } = getSeatTransform(Number(s.seatIndex), radius);

                return (
                  <motion.div
                    key={s.seatIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute z-10"
                    style={{ x, y }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                          ${isActive ? "scale-110 shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)]" : "scale-100"}
                          ${occupied ? "bg-slate-800/40 border border-white/10" : "bg-transparent border border-dashed border-white/5"}
                          ${isMe ? "ring-2 ring-emerald-500/50" : ""}
                          ${isPsych ? "border-purple-500/30 bg-purple-500/5" : ""}
                        `}
                      >
                        {/* Avatar Circle */}
                        <div
                          className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-full transition-all
                          ${isActive ? "bg-blue-500 shadow-lg shadow-blue-500/50" : occupied ? "bg-slate-700" : "bg-slate-900"}
                          ${isPsych ? "bg-gradient-to-tr from-purple-600 to-indigo-500" : ""}
                        `}
                        />

                        {/* Speaking Ripple */}
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-2xl bg-blue-500/20 border border-blue-500/50"
                          />
                        )}
                      </div>

                      {/* Professional Labeling */}
                      <div className="mt-4 flex flex-col items-center gap-1 w-32">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${isPsych ? "text-purple-400" : "text-slate-500"}`}
                        >
                          {isPsych ? "Psychiatrist" : `Member ${idx + 1}`}
                        </span>

                        <div className="h-4 flex items-center">
                          {isActive ? (
                            <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                              Speaking
                            </span>
                          ) : occupied ? (
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                              Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-700 uppercase tracking-tighter italic">
                              Waiting...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer Info */}
        {session && (
          <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-2">
            <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
              Secure Instance: {sessionId}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
