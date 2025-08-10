import Link from 'next/link';
import { Sparkles, Twitter, Linkedin, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/10 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="col-span-12 lg:col-span-3">
            <Link className="flex items-center gap-2 mb-2" href="/">
              <div className="bg-primary p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">CaptionCraft</h1>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
              AI-powered caption generation to supercharge your social media presence.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <Link href="https://twitter.com/captioncraft" className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com/company/captioncraft" className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="https://github.com/captioncraft" className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Github className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <nav className="flex flex-col gap-3">
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/features">Features</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/pricing">Pricing</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/integrations">Integrations</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/updates">Updates</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <nav className="flex flex-col gap-3">
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/about">About Us</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/careers">Careers</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/blog">Blog</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/contact">Contact</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/community">Community</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/support">Support Center</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/api-docs">API Docs</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/status">Status</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <nav className="flex flex-col gap-3">
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
                <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/cookies">Cookie Policy</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p className="mb-4 sm:mb-0">
            © 2024 CaptionCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for creators worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}
