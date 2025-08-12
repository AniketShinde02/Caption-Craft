'use client';

import Link from 'next/link';
import { Sparkles, Twitter, Linkedin, Github, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin, setup, and login pages
  const isAdminPage = pathname.startsWith('/admin');
  const isSetupPage = pathname.startsWith('/setup');
  const isLoginPage = pathname.startsWith('/login');

  if (isAdminPage || isSetupPage || isLoginPage) {
    return null;
  }

  return (
    <footer className="bg-muted/10 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Main Footer Content - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Section - Mobile First */}
          <div className="col-span-12 lg:col-span-3 text-center lg:text-left">
            <Link className="flex items-center gap-2 mb-3 sm:mb-4 justify-center lg:justify-start" href="/">
              <div className="bg-primary p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">CaptionCraft</h1>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-xs mx-auto lg:mx-0 leading-relaxed">
              AI-powered caption generation to supercharge your social media presence.
            </p>
            
            {/* Social Links - Mobile First */}
            <div className="flex gap-3 justify-center lg:justify-start">
              <Link href="https://twitter.com/captioncraft" className="w-10 h-10 sm:w-9 sm:h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com/company/captioncraft" className="w-10 h-10 sm:w-9 sm:h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="https://github.com/captioncraft" className="w-10 h-10 sm:w-9 sm:h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Github className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Footer Links - Mobile First */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm">Product</h4>
                <nav className="flex flex-col gap-2 sm:gap-3">
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/features">Features</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/pricing">Pricing</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/integrations">Integrations</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/updates">Updates</Link>
                </nav>
              </div>
              
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm">Company</h4>
                <nav className="flex flex-col gap-2 sm:gap-3">
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/about">About Us</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/careers">Careers</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/blog">Blog</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/contact">Contact</Link>
                </nav>
              </div>
              
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm">Resources</h4>
                <nav className="flex flex-col gap-2 sm:gap-3">
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/community">Community</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/support">Support Center</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/api-docs">API Docs</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/status">Status</Link>
                </nav>
              </div>
              
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm">Legal</h4>
                <nav className="flex flex-col gap-2 sm:gap-3">
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/terms">Terms of Service</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/privacy">Privacy Policy</Link>
                  <Link className="text-sm text-muted-foreground hover:text-primary transition-colors py-1" href="/cookies">Cookie Policy</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Mobile First */}
        <div className="mt-6 sm:mt-8 border-t border-border/50 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4 sm:gap-0">
          <p className="text-center sm:text-left">
            © 2024 CaptionCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-center">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for creators worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}
