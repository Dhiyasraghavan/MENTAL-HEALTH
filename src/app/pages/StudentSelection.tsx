"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  School,
  ChevronsUpDown,
  Check,
  Search,
  ArrowLeft,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import { listActiveColleges } from "@/lib/db/colleges";
import LightPillarLazy from "@/app/components/LightPillarLazy";
import dynamic from "next/dynamic";

/* ---------- THEME + GROUP LOGIC ---------- */
const getCollegeMeta = (name: string) => {
  const n = name.toLowerCase();

  if (n.includes("engineering") || n.includes("technology"))
    return {
      group: "Engineering & Technology",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: "⚙️",
    };

  if (n.includes("medical") || n.includes("health"))
    return {
      group: "Medical & Health Sciences",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "🏥",
    };

  if (n.includes("arts") || n.includes("science"))
    return {
      group: "Arts & Sciences",
      text: "text-violet-600",
      bg: "bg-violet-50",
      icon: "🎨",
    };

  if (n.includes("university"))
    return {
      group: "Universities",
      text: "text-amber-600",
      bg: "bg-amber-50",
      icon: "🏛️",
    };

  return {
    group: "Other Institutions",
    text: "text-slate-700",
    bg: "bg-slate-100",
    icon: "🏫",
  };
};

export default function StudentSelection() {
  const router = useRouter();
  const [colleges, setColleges] = useState<
    Array<{ slug: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [selected, setSelected] = useState<{
    slug: string;
    name: string;
  }>({ slug: "", name: "" });
  const [query, setQuery] = useState("");

  // Check if already logged in as student
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "student" && user.collegeSlug) {
          // Already logged in, redirect to dashboard
          router.push(`/student/dashboard?college=${user.collegeSlug}`);
          return;
        }
      }
    } catch {
      // Invalid user data, continue to selection
    }
  }, [router]);

  /* ---------- LOAD COLLEGES FROM DB ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const list = await listActiveColleges();
        if (!mounted) return;
        setColleges(list.map((c) => ({ slug: c.slug, name: c.name })));
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(
          e?.message ||
            "Could not load colleges. Make sure Firebase env vars are configured.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- REMEMBER LAST SELECTION ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("college");
    if (saved) {
      const found = colleges.find((c) => c.slug === saved);
      if (found) {
        setSelected(found);
        setQuery(found.name);
      }
    }
  }, [colleges]);

  useEffect(() => {
    if (selected) localStorage.setItem("college", selected.slug);
  }, [selected]);

  /* ---------- SEARCH FILTER ---------- */
  const filtered = useMemo(() => {
    return colleges.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [colleges, query]);

  /* ---------- GROUPING ---------- */
  const grouped = useMemo(() => {
    return filtered.reduce((acc: any, college) => {
      const meta = getCollegeMeta(college.name);
      acc[meta.group] = acc[meta.group] || [];
      acc[meta.group].push({ ...college, meta });
      return acc;
    }, {});
  }, [filtered]);

  const handleSelect = (college: { slug: string; name: string }) => {
    setSelected(college);
    setQuery(college.name);
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setSelected({ slug: "", name: "" });
  };

  const handleContinue = () => {
    if (selected) {
      router.push(`/student/login?college=${selected.slug}`);
    }
  };

  const features = [
    { icon: <Users className="w-4 h-4" />, text: "Peer Support" },
    { icon: <Shield className="w-4 h-4" />, text: "Anonymous" },
    { icon: <Zap className="w-4 h-4" />, text: "AI Counselor" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LightPillarLazy
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

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all text-slate-600 hover:text-slate-800 z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8 border border-white/20 relative z-10"
      >
        {/* ---------- HEADER ---------- */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl mb-6"
          >
            <School className="text-white w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-3">
            Select Your Institution
          </h2>
          <p className="text-white font-medium mb-6">
            Secure campus access to the mental health hub
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200/50"
              >
                {feature.icon}
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ---------- ELITE DROPDOWN ---------- */}
        <Listbox value={selected || undefined} onChange={handleSelect}>
          <div className="relative space-y-4">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                placeholder="Search your college or university…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200 font-semibold outline-none
                           placeholder:text-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Listbox.Button className="w-full p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200 flex items-center justify-between font-black shadow-sm hover:shadow-md transition-all">
                {selected ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getCollegeMeta(selected.name).icon}
                    </span>
                    <span className={getCollegeMeta(selected.name).text}>
                      {selected.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">
                    {loading
                      ? "Loading institutions…"
                      : "Choose from the list…"}
                  </span>
                )}
                <ChevronsUpDown className="w-5 h-5 text-slate-400" />
              </Listbox.Button>
            </motion.div>

            <AnimatePresence>
              <Listbox.Options
                as={motion.div}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute z-50 w-full mt-3 max-h-80 overflow-auto rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 p-3 space-y-2 custom-scrollbar"
              >
                {loadError && (
                  <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
                    {loadError}
                  </div>
                )}
                {Object.entries(grouped).length === 0 && (
                  <div className="text-center text-sm text-slate-400 py-8">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="spinner"></div>
                        <span>Loading institutions…</span>
                      </div>
                    ) : (
                      "No institutions found"
                    )}
                  </div>
                )}

                {Object.entries(grouped).map(([group, colleges]: any) => (
                  <div key={group} className="space-y-1">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <span className="text-lg">{colleges[0]?.meta?.icon}</span>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {group}
                      </p>
                    </div>

                    {colleges.map((c: any) => {
                      const meta = getCollegeMeta(c.name);
                      return (
                        <Listbox.Option
                          key={c.slug}
                          value={c}
                          className={({ active }) =>
                            `rounded-2xl px-5 py-4 cursor-pointer flex items-center justify-between transition-all
                             ${active ? `${meta.bg} shadow-sm` : "hover:bg-slate-50"}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <div className="flex items-center gap-3">
                                <span className="text-sm">{meta.icon}</span>
                                <span className={`font-bold ${meta.text}`}>
                                  {c.name}
                                </span>
                              </div>
                              {selected && (
                                <Check className="w-5 h-5 text-slate-800" />
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      );
                    })}
                  </div>
                ))}
              </Listbox.Options>
            </AnimatePresence>
          </div>
        </Listbox>

        {/* ---------- CONTINUE ---------- */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={selected ? { scale: 1.02 } : {}}
          whileTap={selected ? { scale: 0.98 } : {}}
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-5 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-hover-lift"
        >
          {selected ? "Continue to Login" : "Select an Institution"}
        </motion.button>

        {/* ---------- FOOTER ---------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-6 border-t border-slate-200/50 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold">24/7 Support</span>
            </div>
            <span>•</span>
            <span className="font-bold">Campus Secure</span>
          </div>
          <p className="text-xs text-slate-400">
            Your privacy is protected with end-to-end encryption
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
