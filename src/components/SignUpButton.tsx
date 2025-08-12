"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/context/AuthModalContext";

export function SignUpButton({ className = "" }: { className?: string }) {
  const { setOpen } = useAuthModal();
  return (
    <Button onClick={() => setOpen(true)} className={className + " bg-white text-black hover:bg-white/90"}>
      Sign Up Free
    </Button>
  );
}
