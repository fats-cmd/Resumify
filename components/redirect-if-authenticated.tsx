'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show nothing while checking authentication status
  if (loading) {
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