'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, reset any previous auth errors
        setAuthError(false);
      }
    }
  }, [user, loading, router]);

  // Show nothing while checking authentication status
  if (loading || authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse bg-purple-600/20 dark:bg-purple-400/20 rounded-full h-12 w-12"></div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected, so we don't need to render anything
  if (user) {
    return null;
  }

  // If user is not authenticated, show the children
  return <>{children}</>;
}