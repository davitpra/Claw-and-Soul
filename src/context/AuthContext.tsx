"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  RegisterDto,
} from "@/lib/auth/client";

export interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Proactive token refresh - refresh token before it expires
  useEffect(() => {
    if (!user) {
      // Clear any existing timer if user logs out
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    // Access token expires in 15 minutes
    // Refresh at 13 minutes (2 minutes before expiry)
    const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
    const REFRESH_BEFORE_EXPIRY = 2 * 60 * 1000; // 2 minutes
    const refreshInterval = ACCESS_TOKEN_LIFETIME - REFRESH_BEFORE_EXPIRY;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('[Auth] Proactively refreshing token...');
          await apiRefreshToken();
          console.log('[Auth] Token refreshed successfully');

          // Schedule the next refresh
          scheduleRefresh();
        } catch (error) {
          console.error('[Auth] Failed to refresh token:', error);
          // Don't schedule another refresh if it failed
        }
      }, refreshInterval);
    };

    // Start the refresh cycle
    scheduleRefresh();

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [user]);

  const checkAuth = async () => {
    // Since tokens are in httpOnly cookies, we need to make an API call to check auth
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Send cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data?.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    }

    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });

      // Tokens are now in httpOnly cookies (set by backend)
      // No need to save them manually

      // Set user from response
      setUser(response.user);

      return Promise.resolve();
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await apiRegister(data);

      // Tokens are now in httpOnly cookies (set by backend)
      // No need to save them manually

      // Set user from response
      setUser(response.user);

      return Promise.resolve();
    } catch (error) {
      console.error("Register error in context:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API - backend will clear httpOnly cookies
      try {
        await apiLogout();
      } catch (error) {
        console.error("Logout API error:", error);
        // Continue with local logout even if API call fails
      }

      // Clear user state
      setUser(null);

      // Redirect to home
      router.push("/");

      return Promise.resolve();
    } catch (error) {
      console.error("Logout error in context:", error);
      throw error;
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
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
