'use client';

import { ThemeProvider } from '@/components/theme-provider';

export default function AdminThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <div className="dark">
        {children}
      </div>
    </ThemeProvider>
  );
}
