
"use client";

import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CaptionCardProps {
  caption: string;
}

export function CaptionCard({ caption }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Now go make some magic happen. ✨",
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="group bg-muted/40 transition-all duration-300 rounded-lg flex flex-col justify-between min-h-[150px] border border-border hover:border-primary/50">
      <div className="p-4 flex-grow">
        <p className="text-foreground/90 text-sm">{caption}</p>
      </div>
      <div className="p-2 border-t border-border/50">
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
