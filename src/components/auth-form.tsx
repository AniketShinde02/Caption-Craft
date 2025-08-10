"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
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

export function AuthForm() {
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
      email: "",
      password: "",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        setForgotPasswordSuccess('Reset link sent! Check your email for the password reset link.');
      } else {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to send reset link');
      }
    } catch (e: any) {
      setForgotPasswordError(e.message);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted">
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sign-in">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0 pt-6">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignIn)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-background/80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showSignInPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background/80 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                            {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Error Messages */}
                {signInError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{signInError}</p>
                  </div>
                )}

                {forgotPasswordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{forgotPasswordError}</p>
                  </div>
                )}

                {forgotPasswordSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-500">{forgotPasswordSuccess}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <LogIn className="mr-2" /> Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="sign-up">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0 pt-6">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(onSignUp)}
                className="space-y-4"
              >
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-background/80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showSignUpPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background/80 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                            {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error/Success Messages */}
                {signUpError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{signUpError}</p>
                  </div>
                )}

                {signUpSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-500">{signUpSuccess}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2" /> Sign Up
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
