
"use client"

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground font-sans">
      <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden">
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</p>
              <h1 className="text-3xl font-bold mb-4 mt-2  sm:text-5xl">Terms of Service</h1>
              <p className="mt-4 text-muted-foreground text-base leading-relaxed">Last updated: October 26, 2023</p>
            </div>
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">1. Acceptance of Terms</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  By accessing or using the CaptionCraft web application (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">2. Description of Service</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  CaptionCraft provides an AI-powered caption generation service for various types of content. The Service allows users to input content and receive AI-generated captions. We reserve the right to modify or discontinue the Service at any time without notice.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">3. User Conduct</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all content you submit to the Service and the captions generated. You must not use the Service to:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li className="list-disc list-inside ml-5 text-base leading-relaxed">Generate captions that are illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                  <li className="list-disc list-inside ml-5 text-base leading-relaxed">Infringe on any third party's intellectual property rights.</li>
                  <li className="list-disc list-inside ml-5 text-base leading-relaxed">Distribute spam, unsolicited or unauthorized advertising.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">4. Intellectual Property</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of CaptionCraft and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CaptionCraft.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">5. Disclaimers</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">6. Limitation of Liability</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  In no event shall CaptionCraft, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">7. Governing Law</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">8. Changes to Terms</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary">9. Contact Information</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  If you have any questions about these Terms, please contact us at <a className="text-primary hover:underline" href="mailto:ai.captioncraft@outlook.com">ai.captioncraft@outlook.com</a>.
                </p>
              </section>
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}
