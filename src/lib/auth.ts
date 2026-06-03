/**
 * Authentication utilities for session management
 */

export interface UserSession {
  id: string;
  role: "student" | "it-employee" | "elder" | "guardian" | "college-admin";
  name: string;
  email?: string;
  phone?: string;
  collegeSlug?: string;
  isAnonymous?: boolean;
  createdAt?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Get current user session from localStorage
 */
export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  
  try {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    return JSON.parse(userData) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Save user session to localStorage
 */
export function saveUserSession(user: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clear user session
 */
export function clearUserSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("college");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserSession["role"]): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Get redirect path based on user role
 */
export function getDashboardPath(user: UserSession | null): string | null {
  if (!user) return null;

  switch (user.role) {
    case "student":
      return user.collegeSlug ? `/student/dashboard?college=${user.collegeSlug}` : "/student";
    case "college-admin":
      return user.collegeSlug ? `/college-admin/dashboard?college=${user.collegeSlug}` : "/college-admin";
    case "it-employee":
      return "/it-employee/dashboard";
    case "elder":
      return "/elder/dashboard";
    case "guardian":
      return "/elder/guardian";
    default:
      return null;
  }
}

/**
 * Check if current path requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const protectedPaths = [
    "/student/dashboard",
    "/student/discuss",
    "/college-admin/dashboard",
    "/college-admin/discuss",
    "/it-employee/dashboard",
    "/elder/dashboard",
    "/elder/guardian",
  ];
  
  return protectedPaths.some((path) => pathname.startsWith(path));
}

/**
 * Check if current path is a login/selection page
 */
export function isAuthPage(pathname: string): boolean {
  const authPaths = [
    "/student/login",
    "/college-admin/login",
    "/college-admin/register",
    "/elder/login",
    "/student",
    "/college-admin",
    "/it-employee",
    "/elder",
  ];
  
  return authPaths.includes(pathname) || pathname === "/";
}
