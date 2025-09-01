'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If there's no user and we're not loading, redirect to login
        router.push('/login');
      } else {
        // User is authenticated, reset any previous auth errors
        setAuthError(false);
      }
    }
  }, [loading, user, router]);

  // Show nothing while checking authentication status
  if (loading || authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse bg-purple-600/20 dark:bg-purple-400/20 rounded-full h-12 w-12"></div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // If authenticated, show the children
  return <>{children}</>;
}