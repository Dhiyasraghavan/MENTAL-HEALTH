"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";
  const isDashboard = pathname.includes("/dashboard");

  // Only check localStorage on client side after mount to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    if (isDashboard) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setIsAnonymous(user.isAnonymous || false);
        }
      } catch {
        setIsAnonymous(false);
      }
    }
  }, [isDashboard]);

  if (isLanding) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("college");
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 gradient-blue-purple rounded-xl flex items-center justify-center shadow-lg"
              >
                <Heart className="w-5 h-5 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <span className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                  Mental Health Hub
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500 font-medium">Live</span>
                </div>
              </div>
            </Link>
            {isDashboard && (
              <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                <span className="font-semibold">AI-Powered Support</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Secure</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && isDashboard && isAnonymous && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full shadow-sm"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">
                  Anonymous Mode
                </span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50"
          >
            <div className="px-4 py-4 space-y-4">
              {mounted && isDashboard && isAnonymous && (
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-xl">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">
                    Anonymous Mode Active
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-auto"></div>
                </div>
              )}
              {isDashboard && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 px-4 py-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold">AI-Powered</span>
                  <span>•</span>
                  <span className="font-semibold">Secure</span>
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

