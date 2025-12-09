'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';

// List of paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-otp',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/blogs',
  '/blogs-discussions',
  '/contact-us',
  '/advertise-with-us',
  '/courses',
  '/course-test',
  '/nata-courses',
  '/jobs-portal',
  '/events',
  '/workshops',
  '/discussions',
  '/test',
  '/video-demo'
];

export function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public paths (exact match)
      if (PUBLIC_PATHS.includes(pathname)) {
        return;
      }

      // Skip auth check for paths that start with public prefixes
      const publicPrefixes = ['/courses/', '/nata-courses/', '/blogs/', '/jobs-portal/', '/events/', '/workshops/'];
      if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return;
      }

      // Check if user is authenticated
      if (!auth.isAuthenticated()) {
        // Save the current path for redirect after login
        const returnPath = encodeURIComponent(pathname);
        router.push(`/login?redirect=${returnPath}`);
        return;
      }

      // Verify auth status with backend
      const user = await auth.getCurrentUser();
      if (!user) {
        // Token is invalid or expired
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [pathname, router]);

  // Render children
  return <>{children}</>;
}

// HOC to protect routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    return (
      <AuthMiddleware>
        <WrappedComponent {...props} />
      </AuthMiddleware>
    );
  };
}