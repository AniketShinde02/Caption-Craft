// Cookie utility functions for the entire app
// This file provides easy access to cookie preferences and tracking

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

/**
 * Get the user's saved cookie preferences
 * @returns CookiePreferences object or null if not set
 */
export const getCookiePreferences = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('cookie-preferences');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
};

/**
 * Check if user has consented to a specific cookie type
 * @param type - The cookie type to check
 * @returns boolean indicating consent
 */
export const hasConsent = (type: keyof CookiePreferences): boolean => {
  const prefs = getCookiePreferences();
  return prefs ? prefs[type] : false;
};

/**
 * Track user actions (only if analytics consent is given)
 * @param action - The action name to track
 * @param data - Optional data to include with the event
 */
export const trackUserAction = (action: string, data?: any) => {
  if (hasConsent('analytics')) {
    // Send to analytics service
    console.log('📊 Analytics Event:', action, data);
    
    // You can integrate with your analytics service here
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, data);
    }
    
    // Example: Send to your own analytics endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ action, data, timestamp: Date.now() })
    // });
  }
};

/**
 * Personalize user experience based on functional cookie consent
 * @param userId - Optional user ID for personalization
 */
export const personalizeExperience = (userId?: string) => {
  if (hasConsent('functional')) {
    // Load user preferences and personalize the experience
    console.log('🎨 Personalizing experience for user:', userId);
    
    // You can implement personalization logic here
    // - Load user's preferred theme
    // - Show personalized content
    // - Remember user preferences
  }
};

/**
 * Check if user has made any cookie consent decision
 * @returns boolean indicating if consent decision was made
 */
export const hasMadeConsentDecision = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookie-consent') === 'true';
};

/**
 * Get user's preferred theme (if functional cookies are enabled)
 * @returns theme preference or null
 */
export const getUserTheme = (): 'light' | 'dark' | 'system' | null => {
  if (!hasConsent('functional')) return null;
  
  try {
    return localStorage.getItem('user-theme') as 'light' | 'dark' | 'system' | null;
  } catch {
    return null;
  }
};

/**
 * Save user's theme preference (if functional cookies are enabled)
 * @param theme - The theme to save
 */
export const saveUserTheme = (theme: 'light' | 'dark' | 'system') => {
  if (hasConsent('functional')) {
    try {
      localStorage.setItem('user-theme', theme);
      console.log('🎨 Theme preference saved:', theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }
};

/**
 * Track page views (only if analytics consent is given)
 * @param page - The page name/path
 * @param title - Optional page title
 */
export const trackPageView = (page: string, title?: string) => {
  trackUserAction('page_view', { page, title, timestamp: Date.now() });
};

/**
 * Track user engagement (only if analytics consent is given)
 * @param action - The engagement action
 * @param details - Additional details about the engagement
 */
export const trackEngagement = (action: string, details?: any) => {
  trackUserAction('user_engagement', { action, details, timestamp: Date.now() });
};

/**
 * Check if marketing pixels should be loaded
 * @returns boolean indicating if marketing cookies are enabled
 */
export const shouldLoadMarketingPixels = (): boolean => {
  return hasConsent('marketing');
};

/**
 * Check if analytics should be loaded
 * @returns boolean indicating if analytics cookies are enabled
 */
export const shouldLoadAnalytics = (): boolean => {
  return hasConsent('analytics');
};

/**
 * Get all cookie consent status for debugging/admin purposes
 * @returns object with all consent statuses
 */
export const getCookieConsentStatus = () => {
  return {
    hasMadeDecision: hasMadeConsentDecision(),
    preferences: getCookiePreferences(),
    analyticsEnabled: hasConsent('analytics'),
    marketingEnabled: hasConsent('marketing'),
    functionalEnabled: hasConsent('functional'),
  };
};
