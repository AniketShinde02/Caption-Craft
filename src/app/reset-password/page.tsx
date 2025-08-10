"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => sp.get('token') || '', [sp]);
  const email = useMemo(() => sp.get('email') || '', [sp]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const disabled = submitting || !token || !email || !strong.test(password) || password !== confirm;

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: 'Enter password', color: 'text-muted-foreground', width: 'w-0' };
    if (strong.test(password)) return { text: 'Strong', color: 'text-green-600', width: 'w-full bg-green-500' };
    if (password.length >= 6) return { text: 'Medium', color: 'text-yellow-600', width: 'w-1/2 bg-yellow-500' };
    return { text: 'Weak', color: 'text-red-600', width: 'w-1/4 bg-red-500' };
  };

  const strengthInfo = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reset Your Password</h1>
              <p className="text-muted-foreground mt-2">Create a new secure password for your account</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium truncate">{email || 'No email provided'}</span>
              </div>
            </div>

              {!token || !email ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm text-destructive font-medium mb-4">
                    Invalid or missing reset link
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">
                    This link may have expired or is invalid. Please request a new password reset.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <div className="relative">
                        <Input
                          type={show ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 h-11"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShow((s) => !s)}
                          aria-label={show ? 'Hide password' : 'Show password'}
                        >
                          {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password strength</span>
                          <span className={`font-medium ${
                            password.length === 0 ? 'text-muted-foreground' :
                            strong.test(password) ? 'text-green-600' :
                            password.length >= 6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {password.length === 0 ? 'Enter password' :
                             strong.test(password) ? 'Strong' :
                             password.length >= 6 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                        
                        {/* Strength meter */}
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              password.length === 0
                                ? 'w-0'
                                : strong.test(password)
                                ? 'w-full bg-green-500'
                                : password.length >= 6
                                ? 'w-1/2 bg-yellow-500'
                                : 'w-1/4 bg-red-500'
                            }`}
                          />
                        </div>
                        
                        {/* Requirements checklist */}
                        {password.length > 0 && (
                          <div className="space-y-1 text-xs">
                            <div className={`flex items-center gap-2 ${
                              password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                password.length >= 8 ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              At least 8 characters
                            </div>
                            <div className={`flex items-center gap-2 ${
                              /[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              One uppercase letter
                            </div>
                            <div className={`flex items-center gap-2 ${
                              /[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                /[a-z]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              One lowercase letter
                            </div>
                            <div className={`flex items-center gap-2 ${
                              /\d/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                /\d/.test(password) ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              One number
                            </div>
                            <div className={`flex items-center gap-2 ${
                              /[^\w\s]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                /[^\w\s]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              One special character
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm Password</label>
                      <div className="relative">
                        <Input
                          type={show2 ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className={`pr-10 h-11 ${
                            confirm.length > 0 && password !== confirm 
                              ? 'border-destructive focus-visible:ring-destructive' 
                              : confirm.length > 0 && password === confirm
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShow2((s) => !s)}
                          aria-label={show2 ? 'Hide password' : 'Show password'}
                        >
                          {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {confirm.length > 0 && (
                        <p className={`text-xs flex items-center gap-1.5 ${
                          password === confirm ? 'text-green-600' : 'text-destructive'
                        }`}>
                          {password === confirm ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {password === confirm ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive mb-1">Reset Failed</p>
                        <p className="text-xs text-destructive/80">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Success!</p>
                        <p className="text-xs text-green-600/80">{success}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full mt-6 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200"
                    disabled={disabled}
                    onClick={async () => {
                    setError('');
                    setSuccess('');
                    
                    if (password !== confirm) {
                      setError('Passwords do not match. Please make sure both fields are identical.');
                      return;
                    }
                    if (password.length < 6) {
                      setError('Password too short. Minimum 6 characters required.');
                      return;
                    }
                    if (!strong.test(password)) {
                      setError('Password must include uppercase, lowercase, number, and special character.');
                      return;
                    }
                    
                    setSubmitting(true);
                    try {
                      const res = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, token, newPassword: password }),
                      });
                      if (!res.ok) {
                        const d = await res.json().catch(() => ({}));
                        setError(d.message || 'Reset failed. Please request a new link and try again.');
                        return;
                      }
                      setSuccess('Password reset successful! You can now sign in with your new password.');
                      setTimeout(() => router.push('/'), 2000);
                    } catch (err) {
                      setError('Network error. Please check your connection and try again.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
