
"use client";

import { CaptionGenerator } from "@/components/caption-generator";
import { Button } from "@/components/ui/button";
import {  Bot, Palette, Hash, Pencil, Copy, Share, RefreshCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <main className="flex-grow">
        <section className="py-24 md:py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.2] [mask-image:linear-gradient(to_bottom,white_0%,transparent_70%)]"></div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tighter">
              Generate <span className="gradient-text">Viral Captions</span><br /> in Seconds
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Stop guessing. Start impressing. CaptionCraft analyzes your image and generates compelling captions that boost engagement and reflect your unique brand voice.
            </p>
            <div className="max-w-4xl mx-auto">
              <CaptionGenerator />
            </div>
          </div>
        </section>

        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Ultimate Caption Toolkit</h2>
              <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">From hashtags to tone-matching, everything you need for content that connects.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/features">
                  Explore All Features
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-muted/40 p-6 rounded-lg border border-border transition-all hover:border-primary/50 hover:bg-muted">
                <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Contextual AI</h3>
                <p className="text-sm text-muted-foreground">Our AI understands your image and video content, not just keywords.</p>
              </div>
              <div className="bg-muted/40 p-6 rounded-lg border border-border transition-all hover:border-primary/50 hover:bg-muted">
                <div className="bg-pink-500/10 text-pink-500 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Tone Matching</h3>
                <p className="text-sm text-muted-foreground">Choose a voice that aligns perfectly with your brand identity.</p>
              </div>
              <div className="bg-muted/40 p-6 rounded-lg border border-border transition-all hover:border-primary/50 hover:bg-muted">
                <div className="bg-sky-500/10 text-sky-500 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Hash className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Smart Hashtags</h3>
                <p className="text-sm text-muted-foreground">Get relevant, trending hashtags to maximize your reach.</p>
              </div>
              <div className="bg-muted/40 p-6 rounded-lg border border-border transition-all hover:border-primary/50 hover:bg-muted">
                <div className="bg-amber-500/10 text-amber-500 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Pencil className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Easy Customization</h3>
                <p className="text-sm text-muted-foreground">Fine-tune every suggestion to make your captions truly yours.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your Generated Output</h2>
                <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">See the magic happen. Here’s an example of your new caption and hashtags.</p>
              </div>
              <div className="bg-muted/20 rounded-lg shadow-lg p-6 md:p-8 max-w-3xl mx-auto border border-border">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2">
                    <p className="text-base text-foreground/90 leading-relaxed mb-4">
                      Chasing horizons and embracing the glow. ✨ Every sunset paints a story of gratitude and wonder. Couldn't ask for a better view to end the day.
                    </p>
                    <div className="bg-background/50 p-3 rounded-md border border-border/50">
                      <p className="text-muted-foreground font-mono text-xs">#SunsetVibes #GoldenHourGlow #NaturePerfection #WanderlustLife #ChasingLight #MomentOfPeace</p>
                    </div>
                  </div>
                  <div className="md:col-span-1 flex flex-col gap-2">
                    <Button size="sm" className="w-full">
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full bg-pink-500/20 border-pink-500/0 hover:bg-pink-500/30 text-white">
                      <Share className="w-3.5 h-3.5"/>
                      Share
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full">
                      <RefreshCcw className="w-3.5 h-3.5"/>
                      Regenerate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
      </main>
    </div>
  );
}
