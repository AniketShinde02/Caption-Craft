'use client';

import Link from 'next/link';
import { Sparkles, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { SignUpButton } from '@/components/SignUpButton';
import { usePathname } from 'next/navigation';

export default function ServerHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthed = Boolean(session);
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || userEmail.split('@')[0] || 'User';
  const userImage = session?.user?.image || '';

  // Hide header on admin, setup, and login pages
  const isAdminPage = pathname.startsWith('/admin');
  const isSetupPage = pathname.startsWith('/setup');
  const isLoginPage = pathname.startsWith('/login');

  if (isAdminPage || isSetupPage || isLoginPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Better mobile sizing */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary p-1.5 sm:p-2 rounded-lg">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">CaptionCraft</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50" href="/features">Features</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50" href="/about">About</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50" href="/contact">Contact</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthed ? (
              <Link href="/profile" className="hover:opacity-80 transition-opacity p-2 rounded-md hover:bg-muted/50">
                <Avatar className="h-8 w-8">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={userName} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            ) : (
              <SignUpButton />
            )}
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button - Better touch target */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 p-0">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50 mb-6">
                  <div className="bg-primary p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">CaptionCraft</h1>
                </div>
                
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-2 flex-grow">
                  <Link className="text-lg font-medium text-muted-foreground hover:text-foreground px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors" href="/features">Features</Link>
                  <Link className="text-lg font-medium text-muted-foreground hover:text-foreground px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors" href="/about">About</Link>
                  <Link className="text-lg font-medium text-muted-foreground hover:text-foreground px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors" href="/contact">Contact</Link>
                </nav>
                
                {/* Mobile Actions */}
                <div className="border-t border-border/50 pt-6 space-y-4">
                  {isAuthed ? (
                    <Button asChild className="w-full h-12 text-base">
                      <Link href="/profile">Profile</Link>
                    </Button>
                  ) : (
                    <SignUpButton className="w-full h-12 text-base" />
                  )}
                  
                  {/* Theme Toggle in Mobile Menu */}
                  <div className="px-4">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
