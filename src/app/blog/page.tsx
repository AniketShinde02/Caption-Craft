import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, TrendingUp, Lightbulb, Zap, Target } from 'lucide-react';

export default function BlogPage() {
  const featuredPost = {
    title: 'The Future of AI-Powered Content Creation',
    excerpt: 'Explore how artificial intelligence is revolutionizing the way we create, optimize, and distribute content across social media platforms.',
    author: 'Sarah Johnson',
    date: 'January 8, 2025',
    readTime: '8 min read',
    category: 'AI & Technology',
    image: '🚀',
    featured: true
  };

  const blogPosts = [
    {
      title: '10 Caption Writing Tips That Boost Engagement by 300%',
      excerpt: 'Learn the proven strategies that top influencers use to create captions that drive massive engagement.',
      author: 'Mike Chen',
      date: 'January 6, 2025',
      readTime: '5 min read',
      category: 'Social Media',
      image: '📈'
    },
    {
      title: 'Instagram Algorithm 2025: What Creators Need to Know',
      excerpt: 'Stay ahead of the curve with our comprehensive guide to Instagram\'s latest algorithm changes.',
      author: 'Emma Rodriguez',
      date: 'January 4, 2025',
      readTime: '7 min read',
      category: 'Instagram',
      image: '📱'
    },
    {
      title: 'Building a Personal Brand with AI-Generated Content',
      excerpt: 'Discover how to maintain authenticity while leveraging AI tools for consistent content creation.',
      author: 'David Park',
      date: 'January 2, 2025',
      readTime: '6 min read',
      category: 'Personal Branding',
      image: '🎯'
    },
    {
      title: 'The Psychology Behind Viral Captions',
      excerpt: 'Understand the cognitive triggers that make some captions spread like wildfire across social platforms.',
      author: 'Dr. Lisa Wang',
      date: 'December 30, 2024',
      readTime: '9 min read',
      category: 'Psychology',
      image: '🧠'
    },
    {
      title: 'LinkedIn Content Strategy for B2B Success',
      excerpt: 'Master the art of professional content creation that drives business results on LinkedIn.',
      author: 'James Miller',
      date: 'December 28, 2024',
      readTime: '6 min read',
      category: 'LinkedIn',
      image: '💼'
    },
    {
      title: 'Measuring ROI: Social Media Metrics That Actually Matter',
      excerpt: 'Cut through the noise and focus on the metrics that truly impact your business bottom line.',
      author: 'Anna Thompson',
      date: 'December 26, 2024',
      readTime: '8 min read',
      category: 'Analytics',
      image: '📊'
    }
  ];

  const categories = [
    { name: 'AI & Technology', count: 12, icon: Zap },
    { name: 'Social Media', count: 18, icon: TrendingUp },
    { name: 'Content Strategy', count: 15, icon: Target },
    { name: 'Tips & Tutorials', count: 22, icon: Lightbulb }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Lightbulb className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            CaptionCraft <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Insights, tips, and strategies for mastering social media content creation with AI-powered tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              📚 Expert Insights
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🚀 Growth Tips
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🤖 AI Strategies
            </Badge>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
          
          <Card className="mb-16 overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                  <Badge variant="outline">{featuredPost.category}</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-4 leading-tight">{featuredPost.title}</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{featuredPost.excerpt}</p>
                
                <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                
                <Button asChild size="lg">
                  <Link href="/blog/featured" className="flex items-center gap-2">
                    Read Full Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-12">
                <div className="text-8xl opacity-50">{featuredPost.image}</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Explore by Category</h2>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <Badge variant="secondary">{category.count} articles</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="text-3xl opacity-70">{post.image}</div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </div>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <Button asChild variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                    <Link href={`/blog/${index + 1}`} className="flex items-center gap-2">
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/blog/all">View All Articles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Never Miss an Update</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the latest insights, tips, and strategies delivered straight to your inbox. Join thousands of creators who trust our content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/contact">Subscribe Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/updates">View Updates</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
