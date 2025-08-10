"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { forceSignOut, hasValidSessionCookies } from '@/lib/session-utils';

/**
 * Balanced SessionValidator - Only detects cookie clearing, no aggressive monitoring
 * Provides security without frequent interruptions
 */
export function SessionValidator() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Skip if still loading
    if (status === 'loading') return;

    // If we have a session, only check for cookie clearing
    if (session?.user) {
      console.log('🔐 Setting up minimal session monitoring for user:', session.user.email);

      // Simple function to check if cookies were cleared
      const checkCookiesOnly = async () => {
        try {
          // Only check if cookies still exist - no server validation
          if (!hasValidSessionCookies()) {
            console.log('🍪 Session cookies were cleared, signing out...');
            await forceSignOut(true);
            return;
          }
        } catch (error) {
          console.error('Cookie check error:', error);
        }
      };

      // Only check on visibility change (when user comes back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('👁️ Page visible, checking cookies...');
          checkCookiesOnly();
        }
      };

      // Check cookies when window gets focus (user switches back)
      const handleFocus = () => {
        console.log('🎯 Window focused, checking cookies...');
        checkCookiesOnly();
      };

      // Listen for storage events (when cookies/localStorage change)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.includes('next-auth')) {
          console.log('💾 NextAuth storage changed, checking cookies...');
          setTimeout(checkCookiesOnly, 500); // Small delay to let changes settle
        }
      };

      // Set up minimal event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('storage', handleStorageChange);

      // Cleanup function
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('storage', handleStorageChange);
        console.log('🧹 Minimal session monitoring cleanup completed');
      };
    } else if (status === 'unauthenticated') {
      // If we're unauthenticated but have stale cookies, clear them
      if (hasValidSessionCookies()) {
        console.log('🧽 Clearing stale session cookies...');
        forceSignOut(false); // Don't redirect, just clean up
      }
    }
  }, [session, status]);

  // This component doesn't render anything
  return null;
}
