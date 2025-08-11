"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthModal } from "@/context/AuthModalContext";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function AuthForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const router = useRouter();
  const { setOpen } = useAuthModal();
  const [activeTab, setActiveTab] = useState("sign-in");

  // Clear messages when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSignInError('');
    setSignUpError('');
    setSignUpSuccess('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  });

  // Update form values when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      signInForm.setValue('email', initialEmail);
      signUpForm.setValue('email', initialEmail);
    }
  }, [initialEmail, signInForm, signUpForm]);

  async function onSignUp(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    setSignUpError('');
    setSignUpSuccess('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during sign up");
      }
      
      setSignUpSuccess("Account created successfully! Please sign in below.");
      setTimeout(() => {
        setActiveTab("sign-in");
        signInForm.setValue("email", values.email);
        setSignUpSuccess(''); // Clear success message when switching
      }, 1500);

    } catch (error: any) {
      setSignUpError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignIn(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    setSignInError('');
    
    try {
      // First check if the user is blocked
      const blockCheckResponse = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      if (blockCheckResponse.ok) {
        const blockData = await blockCheckResponse.json();
        if (blockData.blocked) {
          const reason = blockData.reason || 'suspicious_activity';
          const hoursRemaining = blockData.hoursRemaining || 0;
          
          let reasonMessage = '';
          switch (reason) {
            case 'account_deletion_abuse':
              reasonMessage = 'Account deletion abuse detected';
              break;
            case 'rate_limit_violation':
              reasonMessage = 'Rate limit violations';
              break;
            case 'suspicious_activity':
              reasonMessage = 'Suspicious activity detected';
              break;
            case 'manual_block':
              reasonMessage = 'Account manually blocked by administrators';
              break;
            default:
              reasonMessage = 'Account temporarily blocked';
          }
          
          throw new Error(
            `🚫 Account blocked: ${reasonMessage}. Please try again in ${hoursRemaining} hours.`
          );
        }
      }

      // If not blocked, proceed with sign-in
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        throw new Error("Invalid email or password. Please try again.");
      }
      
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      setSignInError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    const email = signInForm.getValues('email');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    
    if (!email) {
      setForgotPasswordError('Please enter your email above, then click Forgot Password.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setForgotPasswordSuccess('Reset link sent! Check your email for the password reset link. Please check your spam folder if you don\'t see it.');
      } else {
        const d = await res.json().catch(() => ({}));
        
        // Handle specific error cases
        if (res.status === 429) {
          if (d.message.includes('daily limit')) {
            setForgotPasswordError('You have reached the maximum password reset requests for today. Please try again tomorrow.');
          } else if (d.message.includes('location')) {
            setForgotPasswordError('Too many reset attempts from this location. Please try again later.');
          } else {
            setForgotPasswordError('Too many reset attempts. Please wait before requesting another reset link.');
          }
        } else {
          throw new Error(d.message || 'Failed to send reset link');
        }
      }
    } catch (e: any) {
      setForgotPasswordError(e.message);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Tabs List - Mobile First */}
      <TabsList className="grid w-full grid-cols-2 bg-muted h-12 sm:h-10">
        <TabsTrigger value="sign-in" className="text-sm sm:text-base">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up" className="text-sm sm:text-base">Sign Up</TabsTrigger>
      </TabsList>
      
      {/* Sign In Tab - Mobile First */}
      <TabsContent value="sign-in" className="mt-4 sm:mt-6">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignIn)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-background/80 h-12 sm:h-10 text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showSignInPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background/80 pr-12 h-12 sm:h-10 text-sm sm:text-base"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                
                {/* Forgot Password Link - Mobile First */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Error Messages - Mobile First */}
                {signInError && (
                  <p className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">{signInError}</p>
                )}

                {forgotPasswordError && (
                  <p className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">{forgotPasswordError}</p>
                )}

                {forgotPasswordSuccess && (
                  <p className="text-sm text-green-500 text-center p-2 bg-green-500/10 rounded-md">{forgotPasswordSuccess}</p>
                )}

                {/* Sign In Button - Mobile First */}
                <Button type="submit" disabled={isLoading} className="w-full h-12 sm:h-11 text-base sm:text-sm">
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Sign Up Tab - Mobile First */}
      <TabsContent value="sign-up" className="mt-4 sm:mt-6">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(onSignUp)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-background/80 h-12 sm:h-10 text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showSignUpPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background/80 pr-12 h-12 sm:h-10 text-sm sm:text-base"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                {/* Error/Success Messages - Mobile First */}
                {signUpError && (
                  <p className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">{signUpError}</p>
                )}

                {signUpSuccess && (
                  <p className="text-sm text-green-500 text-center p-2 bg-green-500/10 rounded-md">{signUpSuccess}</p>
                )}

                {/* Sign Up Button - Mobile First */}
                <Button type="submit" disabled={isLoading} className="w-full h-12 sm:h-11 text-base sm:text-sm">
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
