
"use client"

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground font-sans">
      <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden">
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</p>
              <h1 className="text-3xl font-bold mb-4 mt-2 sm:text-5xl">Privacy Policy</h1>
              <p className="mt-4 text-muted-foreground text-base leading-relaxed">Last updated: October 26, 2023</p>
            </div>
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">1. Introduction</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Welcome to CaptionCraft's Privacy Policy. This policy outlines how we collect, use, and protect your personal information when you use our caption generation services. By using CaptionCraft, you agree to the terms of this policy. We are committed to safeguarding your privacy and ensuring the security of your data.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">2. Data Collection</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We collect information you provide directly, such as your email address when you register, and content you upload for caption generation. We also collect usage data, including your interactions with our services, and device information, such as your IP address and browser type. This data helps us improve our services and personalize your experience.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">3. Data Usage</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  The data we collect is used to provide and enhance our caption generation services, personalize your experience, communicate with you about updates or support, and ensure the security of our platform. We may also use aggregated, anonymized data for analytical purposes to understand user behavior and improve our offerings.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">4. Data Sharing</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We do not sell your personal information. We may share data with trusted third-party service providers who assist us in operating our services, such as hosting, analytics, and customer support. These providers are contractually obligated to protect your information and only use it for the purposes we specify. We may also disclose data if required by law or to protect our rights and safety.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">5. Data Protection</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We implement robust security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, and regular security assessments. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">6. User Rights</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. To exercise these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe. You can manage your data in your account settings.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">7. Contact Information</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <a className="text-primary hover:underline" href="mailto:support@captioncraft.com">support@captioncraft.com</a>.
                </p>
              </section>
            </div>
          </div>
        </main>
        <footer className="bg-card mt-16">
          <div className="container mx-auto px-10 py-8 text-center text-muted-foreground">
            <p>© 2023 CaptionCraft. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
