import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Bot, Sparkles, Palette, Hash, Pencil, Copy, Share, RefreshCcw, 
  Eye, ImageIcon, Languages, Zap, Clock, Shield, BarChart3, 
  Users, Heart, TrendingUp, Smartphone, Cloud, CheckCircle,
  ArrowRight, Lightbulb, Target, MessageSquare, Globe
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04]" style={{ maskImage: 'linear-gradient(to bottom, white 0%, transparent 70%)' }} />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto mb-8 p-4 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 w-fit">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
            Everything You Need to Create 
            <span className="gradient-text block">Amazing Captions</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            Discover the comprehensive suite of AI-powered tools designed to transform your social media presence. 
            From intelligent image analysis to mood-based generation, we've got every aspect of caption creation covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/">
                <Zap className="w-5 h-5 mr-2" />
                Start Creating Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The essential tools that make CaptionCraft the ultimate caption generation platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Caption Generation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">AI-Powered Generation</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Advanced AI that understands context, emotion, and brand voice to create captions that truly resonate with your audience.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Natural language processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Context-aware generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Brand voice adaptation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Image Analysis */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Smart Image Analysis</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Upload any image and our AI will analyze objects, scenes, emotions, and context to generate perfectly matched captions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Object & scene recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Emotion detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Color palette analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Mood & Tone Selection */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-pink-500/10 text-pink-600 w-fit group-hover:scale-110 transition-transform">
                  <Palette className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Mood & Tone Selection</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Choose from a wide variety of moods and tones to match your brand personality and audience preferences.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Professional & casual tones
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Emotional expressions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Industry-specific styles
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Hashtag Suggestions */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform">
                  <Hash className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Smart Hashtags</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Get intelligent hashtag recommendations based on your content, industry trends, and audience engagement patterns.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Trending hashtag analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Niche-specific suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Engagement optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Platform Optimization */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Multi-Platform Ready</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Captions optimized for Instagram, Twitter, LinkedIn, Facebook, and more, respecting each platform's best practices.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Platform-specific formatting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Character limit optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Audience targeting
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Caption History & Management */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="mb-6 p-4 rounded-lg bg-orange-500/10 text-orange-600 w-fit group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Caption Management</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Save, organize, and manage all your generated captions with powerful search and categorization features.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Unlimited caption storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Smart search & filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Export capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Capabilities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional-grade features that set CaptionCraft apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-600 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                    <p className="text-muted-foreground">Track caption performance and optimize your content strategy with detailed analytics.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-600 flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                    <p className="text-muted-foreground">Work together with your team, share caption libraries, and maintain brand consistency.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-600 flex-shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Brand Safety</h3>
                    <p className="text-muted-foreground">Advanced content filtering ensures all generated captions align with your brand guidelines.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 flex-shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Multi-Language Support</h3>
                    <p className="text-muted-foreground">Generate captions in multiple languages to reach global audiences effectively.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl p-8 border border-primary/10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Caption Performance Dashboard
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="font-semibold text-green-600">+24%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Reach Growth</span>
                        <span className="font-semibold text-blue-600">+18%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get perfect captions in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-primary/10 text-primary w-fit">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Upload or Describe</h3>
              <p className="text-muted-foreground">
                Upload an image or describe your content. Our AI will understand the context and visual elements.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-purple-500/10 text-purple-600 w-fit">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Choose Your Style</h3>
              <p className="text-muted-foreground">
                Select the mood, tone, and platform to customize the caption generation to your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-green-500/10 text-green-600 w-fit">
                <Target className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Get Perfect Captions</h3>
              <p className="text-muted-foreground">
                Receive multiple engaging captions with hashtags, ready to copy and paste to your social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 to-blue-500/10 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of creators, brands, and marketers who are already using CaptionCraft to create engaging content that drives results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <Link href="/">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/about">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
