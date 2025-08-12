
"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";
import { Sparkles } from "lucide-react";

export function AuthModal() {
  const { isOpen, setOpen, initialEmail, setInitialEmail } = useAuthModal();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    // Clear initial email when modal is closed
    if (!open) {
      setInitialEmail('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-background p-0 max-h-[85vh] overflow-hidden">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-3 text-center">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">Welcome to CaptionCraft</DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-muted-foreground mt-1">
                    Sign in or create an account to start generating captions.
                </DialogDescription>
            </DialogHeader>
        </div>
        
        {/* Form Section - Mobile First */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <AuthForm initialEmail={initialEmail} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
