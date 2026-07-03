"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { User, ApiResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Reads a cookie value by name from the browser document.
 */
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);

  useEffect(() => {
    // Monitor Zustand hydration from localStorage
    const unsubHydrate = useAuthStore.persist.onHydrate(() => {
      setIsStoreHydrated(false);
    });
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      setIsStoreHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      // Defer state update to avoid calling setState synchronously during rendering/effect phase
      Promise.resolve().then(() => {
        setIsStoreHydrated(true);
      });
    }

    return () => {
      unsubHydrate();
      unsubFinish();
    };
  }, []);

  useEffect(() => {
    if (!isStoreHydrated) return;

    const verifySession = async () => {
      const { accessToken: currentToken, refreshToken: currentRefresh, setAuth, clearAuth } = useAuthStore.getState();
      const tokenCookie = getCookie("token");

      // 1. If token cookie is missing but the store has an accessToken, browser cookies were cleared.
      if (currentToken && !tokenCookie) {
        clearAuth();
        setIsLoading(false);
        router.push("/login");
        return;
      }

      // 2. If store is empty but browser cookie exists, try to recover session using the cookie
      if (!currentToken && tokenCookie) {
        try {
          const response = await apiClient.get<ApiResponse<{ user: User }>>(
            API_ENDPOINTS.AUTH.ME,
            { headers: { Authorization: `Bearer ${tokenCookie}` } }
          );
          if (response.status === "success" && response.data.user) {
            setAuth(
              response.data.user,
              tokenCookie,
              useAuthStore.getState().refreshToken || ""
            );
            setIsLoading(false);
            return;
          }
        } catch {
          clearAuth();
          setIsLoading(false);
          router.push("/login");
          return;
        }
      }

      // 3. Enforce client-side route guard redirection on protected pages when unauthenticated
      const isProtectedRoute =
        pathname.startsWith("/candidate") ||
        pathname.startsWith("/recruiter") ||
        pathname.startsWith("/admin");

      if (isProtectedRoute && !currentToken && !tokenCookie) {
        clearAuth();
        setIsLoading(false);
        router.push("/login");
        return;
      }

      // 4. Regular session verification path
      if (currentToken && tokenCookie) {
        try {
          const response = await apiClient.get<ApiResponse<{ user: User }>>(
            API_ENDPOINTS.AUTH.ME
          );
          if (response.status === "success" && response.data.user) {
            // Get the LATEST token from store as it might have been refreshed under the hood
            const latestToken = useAuthStore.getState().accessToken || currentToken;
            const latestRefresh = useAuthStore.getState().refreshToken || currentRefresh || "";
            setAuth(
              response.data.user,
              latestToken,
              latestRefresh
            );
          }
        } catch {
          clearAuth();
          router.push("/login");
        }
      }
      setIsLoading(false);
    };

    verifySession();
     
  }, [isStoreHydrated, pathname, router]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Fail silently
    } finally {
      clearAuth();
      setIsLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: !isStoreHydrated || isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
