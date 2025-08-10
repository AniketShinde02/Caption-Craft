'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Cookie, Settings, X, Shield, Info } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay to avoid flash
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    
    // Here you would typically integrate with your analytics/tracking services
    // For example:
    // if (prefs.analytics) {
    //   initializeAnalytics();
    // }
    // if (prefs.marketing) {
    //   initializeMarketingPixels();
    // }
    
    console.log('Cookie preferences saved:', prefs);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                    You can choose which cookies to accept below or click "Accept All" to consent to all cookies.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By continuing to use our site, you agree to our{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-xs"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={acceptNecessary}
                  className="text-xs"
                >
                  Accept Necessary Only
                </Button>
                <Button 
                  size="sm" 
                  onClick={acceptAll}
                  className="bg-primary hover:bg-primary/90 text-xs"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={preferences.necessary}
                    disabled={true}
                    className="opacity-50"
                  />
                  <div>
                    <h4 className="font-medium">Necessary Cookies</h4>
                    <Badge variant="secondary" className="text-xs mt-1">Required</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Essential cookies required for basic site functionality, security, and user authentication. 
                These cannot be disabled.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={() => togglePreference('analytics')}
                  />
                  <div>
                    <h4 className="font-medium">Analytics Cookies</h4>
                    <Badge variant="outline" className="text-xs mt-1">Optional</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                This includes Google Analytics and similar services.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={preferences.marketing}
                    onCheckedChange={() => togglePreference('marketing')}
                  />
                  <div>
                    <h4 className="font-medium">Marketing Cookies</h4>
                    <Badge variant="outline" className="text-xs mt-1">Optional</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Used to track visitors across websites to display relevant advertisements and measure ad campaign effectiveness.
                This includes social media pixels and advertising networks.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={preferences.functional}
                    onCheckedChange={() => togglePreference('functional')}
                  />
                  <div>
                    <h4 className="font-medium">Functional Cookies</h4>
                    <Badge variant="outline" className="text-xs mt-1">Optional</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Enable enhanced functionality like remembering your preferences, language settings, 
                and providing personalized features.
              </p>
            </div>

            {/* Additional Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Your Privacy Rights</p>
                  <p className="text-muted-foreground mb-2">
                    You have the right to withdraw consent at any time. You can change your preferences 
                    by revisiting this dialog or contacting us directly.
                  </p>
                  <p className="text-muted-foreground">
                    For more information, please read our{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={acceptNecessary}
              className="flex-1"
            >
              Accept Necessary Only
            </Button>
            <Button 
              onClick={saveCustomPreferences}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
