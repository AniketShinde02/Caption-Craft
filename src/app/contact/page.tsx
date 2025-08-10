'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Facebook, Instagram, Mail, MapPin, Twitter, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent } from '@/components/ui/card';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submit error and success when user starts fixing the form
    if (submitError) {
      setSubmitError('');
    }
    if (submitSuccess) {
      setSubmitSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      // Success - show confirmation
      setIsSubmitted(true);
      setSubmitError('');
      setSubmitSuccess(result.message || "Thanks for reaching out! We'll get back to you within 24 hours.");
      
      // Reset form after successful submission
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      
      console.log('✅ Contact form submitted successfully:', {
        submissionId: result.data?.id,
        submittedAt: result.data?.submittedAt
      });
      
    } catch (error: any) {
      console.error('❌ Contact form submission failed:', error);
      setSubmitError(error.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    // The root container uses flexbox to structure the page vertically.
    // - `min-h-screen`: Ensures the page is at least as tall as the viewport.
    // - `flex flex-col`: Stacks the children (<main> and <footer>) vertically.
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground bg-grid-gray-700/[0.2]">
      
      {/* The main content area.
        - `flex-grow`: This is the key. It tells this element to expand and fill all
          available vertical space, which pushes the footer to the very bottom.
        - `flex items-center`: This centers the content grid vertically within the main area.
        - `py-16`: Increased vertical padding for better spacing above and below the content.
      */}
      <main className="container mx-auto flex flex-grow items-center px-4 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          
          {/* Left Column: Information */}
          <div className="space-y-6 text-center md:text-left">
            <h2 className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
              Let's Connect
            </h2>
            <p className="text-xl leading-relaxed text-muted-foreground">
              Have a question, feedback, or a partnership idea? We're all ears. Reach out and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-center gap-4 md:justify-start">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-lg">AiCaptionCraft@outlook.com</span>
              </div>
              <div className="flex items-center justify-center gap-4 md:justify-start">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-lg">Nashik, Maharashtra, India</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 pt-8 md:justify-start">
              <Link href="/twitter" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Twitter className="h-7 w-7" />
              </Link>
              <Link href="/instagram" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Instagram className="h-7 w-7" />
              </Link>
              <Link href="/facebook" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Facebook className="h-7 w-7" />
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-xl bg-card p-8 shadow-lg">
            {isSubmitted ? (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    Thank you for reaching out! We've received your message and will get back to you within 24 hours.
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                    A confirmation email has been sent to your inbox.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSubmitted(false)}
                    className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                  >
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Your full name" 
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className={errors.name ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <div className="flex items-center mt-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="email" 
                      name="email" 
                      placeholder="your.email@example.com" 
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className={errors.email ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    placeholder="What's this about?" 
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange('subject')}
                    className={errors.subject ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <div className="flex items-center mt-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.subject}
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Tell us more about your inquiry..." 
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    className={errors.message ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <div className="flex items-center mt-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.message}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formData.message.length}/500 characters
                  </div>
                </div>
                
                {/* Submit Error Message */}
                {submitError && (
                  <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-sm">{submitError}</p>
                  </div>
                )}
                
                {/* Submit Success Message */}
                {submitSuccess && (
                  <div className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-sm">{submitSuccess}</p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                 
              </form>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}