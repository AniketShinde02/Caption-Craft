
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
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-background p-0 max-h-[90vh] overflow-y-auto">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-4 text-center">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to CaptionCraft</DialogTitle>
                <DialogDescription className="text-base sm:text-lg text-muted-foreground mt-2">
                    Sign in or create an account to start generating captions.
                </DialogDescription>
            </DialogHeader>
        </div>
        
        {/* Form Section - Mobile First */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <AuthForm initialEmail={initialEmail} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
