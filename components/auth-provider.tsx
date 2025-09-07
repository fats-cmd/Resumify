'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getUserSession, supabase } from '@/lib/supabase';
import { handleAuthError } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for active session on initial load
    const initAuth = async () => {
      try {
        const { session, error } = await getUserSession();
        
        if (error) {
          // Handle refresh token errors specifically
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            console.warn('Refresh token invalid or not found. User needs to sign in again.');
            // Clear any existing session data and redirect to login
            setUser(null);
            router.push('/login');
          } else {
            throw error;
          }
        }
        
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        // Handle auth errors
        if (error instanceof Error) {
          if (handleAuthError(error)) {
            // If the error was handled (refresh token error), redirect to login
            router.push('/login');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        // Handle auth errors
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        }
        
        // Ensure loading is false after auth state changes
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};