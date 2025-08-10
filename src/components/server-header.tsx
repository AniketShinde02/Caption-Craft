import Link from 'next/link';
import { Sparkles, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignUpButton } from '@/components/SignUpButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServerHeader() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session);
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || userEmail.split('@')[0] || 'User';
  const userImage = session?.user?.image || '';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">CaptionCraft</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/features">Features</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/about">About</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/contact">Contact</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {isAuthed ? (
              <Link href="/profile" className="hover:opacity-80 transition-opacity">
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background">
              <nav className="flex flex-col gap-6 mt-8">
                <Link className="text-lg font-medium text-muted-foreground hover:text-foreground" href="/features">Features</Link>
                <Link className="text-lg font-medium text-muted-foreground hover:text-foreground" href="/about">About</Link>
                <Link className="text-lg font-medium text-muted-foreground hover:text-foreground" href="/contact">Contact</Link>
                <div className="border-t pt-6 mt-2 space-y-4">
                  {isAuthed ? (
                    <Button asChild className="w-full">
                      <Link href="/profile">Profile</Link>
                    </Button>
                  ) : (
                    <SignUpButton className="w-full" />
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
