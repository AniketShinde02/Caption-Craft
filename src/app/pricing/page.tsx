import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with AI captions',
      icon: Sparkles,
      features: [
        '10 captions per month',
        'Basic mood selection',
        'Standard image analysis',
        'Community support',
        'Basic templates'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'Ideal for content creators and small businesses',
      icon: Zap,
      features: [
        'Unlimited captions',
        'Advanced mood options',
        'Deep image analysis',
        'Priority support',
        'Custom templates',
        'Bulk generation',
        'Export options',
        'Analytics dashboard'
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'default' as const,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For agencies and large organizations',
      icon: Crown,
      features: [
        'Everything in Pro',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Custom AI training',
        'White-label options',
        'SLA guarantee',
        'Advanced analytics'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="gradient-text">Perfect Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our powerful AI caption generation.
          </p>
          <div className="flex items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              ✨ 14-day free trial on Pro plans
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🚫 No setup fees
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period !== 'contact us' && (
                        <span className="text-muted-foreground ml-2">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild
                      variant={plan.buttonVariant} 
                      className="w-full"
                      size="lg"
                    >
                      <Link href={plan.name === 'Enterprise' ? '/contact' : '/'}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and offer enterprise billing options for larger organizations.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes! All Pro plans come with a 14-day free trial. No credit card required to start your free account.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
