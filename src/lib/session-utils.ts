"use client";

import { signOut } from 'next-auth/react';

/**
 * Utility functions for session management
 */

/**
 * Force sign out and clear all session data
 * This ensures complete cleanup when cookies are cleared or session is invalid
 */
export async function forceSignOut(redirect: boolean = true) {
  try {
    // Clear NextAuth session
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    
    // Clear any remaining cookies manually
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      // Clear cookie for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      // Clear cookie for parent domain (if applicable)
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
      // Clear secure cookies
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
    });
    
    // Clear localStorage items that might be related to auth
    const localStorageKeys = [
      'next-auth.session',
      'next-auth.callback-url',
      'captioncraft-user-data'
    ];
    
    localStorageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors if localStorage is not available
      }
    });
    
    // Clear sessionStorage items
    const sessionStorageKeys = [
      'next-auth.session',
      'captioncraft-temp-data'
    ];
    
    sessionStorageKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignore errors if sessionStorage is not available
      }
    });
    
    console.log('🚪 Complete sign out and cleanup performed');
    
    if (redirect) {
      // Force a hard refresh to ensure all state is cleared
      window.location.href = '/';
    }
    
  } catch (error) {
    console.error('Error during force sign out:', error);
    // Fallback: force reload
    if (redirect) {
      window.location.href = '/';
    }
  }
}

/**
 * Check if user has valid session cookies
 */
export function hasValidSessionCookies(): boolean {
  try {
    const cookies = document.cookie;
    return cookies.includes('next-auth.session-token') || 
           cookies.includes('__Secure-next-auth.session-token');
  } catch (error) {
    console.error('Error checking session cookies:', error);
    return false;
  }
}

/**
 * Validate current session by making a request to the session endpoint
 */
export async function validateCurrentSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return false;
    }
    
    const session = await response.json();
    return !!(session?.user?.id);
    
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Setup session monitoring
 * This function sets up listeners to detect when cookies are cleared
 */
export function setupSessionMonitoring(onSessionInvalid: () => void) {
  let lastCookieCheck = hasValidSessionCookies();
  let consecutiveFailures = 0;
  
  const checkCookies = () => {
    const currentCookieCheck = hasValidSessionCookies();
    
    // If cookies were present but now they're gone, session was cleared
    if (lastCookieCheck && !currentCookieCheck) {
      consecutiveFailures++;
      
      // Only trigger sign out after 2 consecutive failures to avoid false positives
      if (consecutiveFailures >= 2) {
        console.log('🍪 Session cookies were cleared, triggering sign out');
        onSessionInvalid();
      } else {
        console.log('🍪 Cookie check failed, will retry...');
      }
    } else if (currentCookieCheck) {
      // Reset failure counter if cookies are present
      consecutiveFailures = 0;
    }
    
    lastCookieCheck = currentCookieCheck;
  };
  
  // Check cookies every 30 seconds instead of 10 (less aggressive)
  const cookieInterval = setInterval(checkCookies, 30 * 1000);
  
  // Check when page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      checkCookies();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Check when page regains focus
  const handleFocus = () => {
    checkCookies();
  };
  
  window.addEventListener('focus', handleFocus);
  
  // Return cleanup function
  return () => {
    clearInterval(cookieInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
}
