"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getUserSession, supabase } from "@/lib/supabase";
import { handleAuthError } from "@/lib/auth-utils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut?: () => Promise<{ error: Error | null }>;
  isLoggingOut?: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: undefined,
  isLoggingOut: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for active session on initial load
    const initAuth = async () => {
      try {
        const { session, error } = await getUserSession();

        if (error) {
          // Handle refresh token errors specifically
          if (
            error.message.includes("Invalid Refresh Token") ||
            error.message.includes("Refresh Token Not Found") ||
            error.message.includes("Auth session missing")
          ) {
            console.warn(
              "Session invalid or missing. User needs to sign in again.",
            );
            // Clear any existing session data and redirect to login
            setUser(null);
            router.push("/login");
          } else {
            throw error;
          }
        }

        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        // Handle auth errors
        if (error instanceof Error) {
          if (
            handleAuthError(error) ||
            error.message.includes("Auth session missing")
          ) {
            // If the error was handled (refresh token error), redirect to login
            router.push("/login");
          }
        }
        // In case of any error, ensure user is set to null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      // Handle different auth events
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoggingOut(false);
        // Only redirect if not already on login page
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/"
        ) {
          router.push("/login");
        }
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setIsLoggingOut(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      } else if (!session) {
        setUser(null);
        setIsLoggingOut(false);
      }

      // Ensure loading is false after auth state changes
      if (loading) {
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [loading, router]);

  // Enhanced signOut function to prevent double calls
  const handleSignOut = async () => {
    if (isLoggingOut) {
      return { error: null }; // Prevent double logout
    }

    setIsLoggingOut(true);

    try {
      // Check if there's an active session before attempting to sign out
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If no session exists, user is already logged out
      if (!session) {
        setUser(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();

      if (error && !error.message.includes("Auth session missing")) {
        throw error;
      }

      // Clear user state immediately
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      // If it's a session missing error, treat it as successful logout
      if (
        error instanceof Error &&
        error.message.includes("Auth session missing")
      ) {
        setUser(null);
        return { error: null };
      }
      return { error: error as Error };
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut: handleSignOut, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
