
"use client";

import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InlineMessage } from '@/components/ui/inline-message';

interface CaptionCardProps {
  caption: string;
}

export function CaptionCard({ caption }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setInlineMessage("Copied to clipboard! ✨");
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setInlineMessage(null);
    }, 2000);
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
    <div className="group bg-muted/40 transition-all duration-300 rounded-lg flex flex-col justify-between min-h-[140px] sm:min-h-[150px] border border-border hover:border-primary/50">
      {/* Inline Message Display */}
      {inlineMessage && (
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <InlineMessage
            type="success"
            message={inlineMessage}
            className="text-xs sm:text-sm"
          />
        </div>
      )}
      
      {/* Caption Content - Mobile First */}
      <div className="p-3 sm:p-4 flex-grow">
        <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed">{caption}</p>
      </div>
      
      {/* Action Button - Mobile First */}
      <div className="p-2 sm:p-3 border-t border-border/50">
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="w-full h-10 sm:h-9 text-xs sm:text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
