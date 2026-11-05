"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  roles: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  setIsLoggedIn: (value: boolean) => void;
  logout: (reason?: string) => Promise<void>;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login", "/register"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const syncUserFromCookies = useCallback(() => {
    const isLoggedInCookie = Cookies.get("isLoggedIn");
    const userId = Cookies.get("userId");
    const name = Cookies.get("name");
    const rolesCookie = Cookies.get("userRoles");

    let roles: string[] = [];
    if (rolesCookie) {
      try {
        roles = JSON.parse(rolesCookie);
      } catch (e) {
        roles = [rolesCookie];
      }
    }

    if (isLoggedInCookie === "true" && userId) {
      setIsLoggedIn(true);
      setUser({
        id: userId,
        name: name || "User",
        roles,
      });
      return true;
    } else {
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async (reason?: string) => {
    try {
      await fetch("/api/auth/logout", { method: "GET" }).catch(() => {});
    } catch (e) {
      // Ignore network errors during logout
    }

    // Clear all client-side auth cookies
    Cookies.remove("authToken", { path: "/" });
    Cookies.remove("userId", { path: "/" });
    Cookies.remove("name", { path: "/" });
    Cookies.remove("userRoles", { path: "/" });
    Cookies.remove("isLoggedIn", { path: "/" });
    Cookies.remove("storeId", { path: "/" });

    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
    }

    setIsLoggedIn(false);
    setUser(null);

    const redirectUrl = reason ? `/login?reason=${encodeURIComponent(reason)}` : "/login";
    router.push(redirectUrl);
  }, [router]);

  useEffect(() => {
    const isAuthenticated = syncUserFromCookies();

    // Check if on protected route without auth
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith("/public"));
    if (!isAuthenticated && !isPublic) {
      router.push("/login?reason=unauthenticated");
    }
  }, [pathname, router, syncUserFromCookies]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      setIsLoggedIn,
      logout,
      refreshAuthState: syncUserFromCookies,
    }),
    [isLoggedIn, user, logout, syncUserFromCookies]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
