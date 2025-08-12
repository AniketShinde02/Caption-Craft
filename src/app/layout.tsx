
import type {Metadata} from 'next';
import './globals.css';

// This is the crucial line.
// It opts this layout and all pages that use it out of static caching.
// It forces Next.js to render it on the server for every request,
// ensuring the authentication state is always fresh.
export const dynamic = 'force-dynamic';

import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';
import { AuthModal } from '@/components/auth-modal';
import ServerHeader from '@/components/server-header';
import Footer from '@/components/footer';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CaptionCraft',
  description: 'Generate Viral Captions in Seconds',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <Providers>
          <ServerHeader />
          <main className="flex-grow w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <AuthModal />
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
