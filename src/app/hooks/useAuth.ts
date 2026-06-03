"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, getDashboardPath, requiresAuth, isAuthPage, type UserSession } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Handle authentication redirects
    if (!currentUser) {
      // Not logged in
      if (requiresAuth(pathname)) {
        // Trying to access protected page without auth
        // Redirect to appropriate selection page based on path
        if (pathname.startsWith("/student")) {
          router.push("/student");
        } else if (pathname.startsWith("/college-admin")) {
          router.push("/college-admin");
        } else if (pathname.startsWith("/it-employee")) {
          router.push("/it-employee");
        } else if (pathname.startsWith("/elder")) {
          router.push("/elder");
        }
      }
    } else {
      // Logged in - check if on wrong page
      const dashboardPath = getDashboardPath(currentUser);
      
      // If on landing or auth page, redirect to dashboard
      if (isAuthPage(pathname) && dashboardPath) {
        router.push(dashboardPath);
      }
      
      // Role-based path validation
      if (pathname.startsWith("/student") && currentUser.role !== "student") {
        router.push(dashboardPath || "/");
      } else if (pathname.startsWith("/college-admin") && currentUser.role !== "college-admin") {
        router.push(dashboardPath || "/");
      } else if (pathname.startsWith("/it-employee") && currentUser.role !== "it-employee") {
        router.push(dashboardPath || "/");
      } else if (pathname.startsWith("/elder") && !["elder", "guardian"].includes(currentUser.role)) {
        router.push(dashboardPath || "/");
      }
    }
  }, [pathname, router]);

  return { user, loading, isAuthenticated: !!user };
}
