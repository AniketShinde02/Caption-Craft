'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FixedHeightMessage } from '@/components/ui/inline-message';
import { Loader2, Shield, UserPlus, LogIn, Key, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import MobileErrorBoundary from '@/components/ui/mobile-error-boundary';

function AdminSetupContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<'token' | 'options' | 'signup' | 'login'>('token');
  const [setupToken, setSetupToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminExists, setAdminExists] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [tokenRequestMessage, setTokenRequestMessage] = useState('');

  // STRICT PROTOCOL: If user is already authenticated as admin, redirect immediately
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (status === 'authenticated' && session?.user?.role?.name === 'admin') {
      console.log('ℹ️ Setup page - User is authenticated admin, redirecting to dashboard');
      router.replace('/admin/dashboard');
      return;
    }
  }, [session, status, router]);

  // Check if admin system is already set up
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Admin status check timeout, proceeding with setup');
        setAdminExists(false);
      }, 5000); // 5 second timeout
      
      checkAdminStatus().finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }, [status]);

  // STRICT PROTOCOL: Show loading while checking admin status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base">Checking system status...</p>
        </div>
      </div>
    );
  }

  // STRICT PROTOCOL: If authenticated as admin, don't render anything (will redirect)
  if (status === 'authenticated' && session?.user?.role?.name === 'admin') {
    return null;
  }

  const checkAdminStatus = async () => {
    try {
      console.log('🔍 Checking admin system status...');
      const response = await fetch('/api/admin/setup');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin status check successful:', data);
        setAdminExists(data.existingAdmin || false);
        
        if (data.existingAdmin) {
          setStep('options');
        }
      } else {
        console.log('⚠️ Admin status check failed:', response.status);
        setAdminExists(false);
      }
    } catch (error) {
      console.error('❌ Failed to check admin status:', error);
      setAdminExists(false);
    }
  };

     // Verify setup token
   const handleTokenVerification = async () => {
     if (!setupToken.trim()) {
       setError('Please enter the setup token');
       return;
     }

     // Enhanced JWT format validation
     if (!setupToken.includes('.') || setupToken.split('.').length !== 3) {
       setError('Invalid JWT format. Token should have 3 parts separated by dots.');
       return;
     }

     // Check token length (JWT tokens are typically very long - at least 150+ characters)
     if (setupToken.length < 150) {
       setError('Token appears to be incomplete. JWT tokens are typically 150+ characters long. Please ensure you copied the complete token from your email.');
       return;
     }

     // Check if token ends with proper JWT format (should end with base64 characters)
     const parts = setupToken.split('.');
     if (parts.length === 3) {
       const lastPart = parts[2];
       if (lastPart.length < 20) {
         setError('Token appears to be truncated. The last part seems too short. Please copy the complete token from your email.');
         return;
       }
     }

     console.log('🔐 Attempting to verify token:', {
       tokenLength: setupToken.length,
       tokenStart: setupToken.substring(0, 20) + '...',
       tokenEnd: '...' + setupToken.substring(setupToken.length - 20),
       tokenParts: setupToken.split('.').map(part => part.length)
     });

     setIsVerifying(true);
     setError('');
     setSuccess('');

     // Add timeout for faster response
     const timeoutPromise = new Promise((_, reject) => {
       setTimeout(() => reject(new Error('Request timeout')), 15000); // Increased to 15 seconds
     });

     try {
       const verificationPromise = fetch('/api/admin/setup', {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Accept': 'application/json'
         },
         body: JSON.stringify({ action: 'verify-token', token: setupToken })
       });

       // Race between timeout and actual request
       const response = await Promise.race([verificationPromise, timeoutPromise]) as Response;
       
       // Check if response is ok before trying to parse JSON
       if (!response.ok) {
         if (response.status === 401) {
           setError('Token verification failed. The token may be expired or invalid.');
         } else if (response.status === 400) {
           setError('Invalid token format. Please ensure you copied the complete token from your email.');
         } else if (response.status >= 500) {
           setError('Server error. Please try again later or contact support.');
         } else {
           setError(`Verification failed (${response.status}). Please try again.`);
         }
         return;
       }

       let data;
       try {
         data = await response.json();
       } catch (jsonError) {
         console.error('Failed to parse response JSON:', jsonError);
         setError('Invalid response from server. Please try again.');
         return;
       }

       if (data.success) {
         setTokenVerified(true);
         setSuccess('Token verified successfully!');
         setError('');
         
         // Show token expiration info
         if (data.tokenInfo && data.tokenInfo.expiresAt) {
           const expiresAt = new Date(data.tokenInfo.expiresAt);
           const now = new Date();
           const timeLeft = expiresAt.getTime() - now.getTime();
           const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
           const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
           
           setSuccess(`Token verified successfully! Expires in ${hoursLeft}h ${minutesLeft}m`);
         }
         
         setTimeout(() => {
           setSuccess('');
           setStep('options');
         }, 2000); // Increased to 2 seconds for better UX
       } else {
         setError(data.message || 'Token verification failed');
       }
     } catch (error) {
       console.error('Token verification error:', error);
       if (error instanceof Error && error.message === 'Request timeout') {
         setError('Token verification timed out. Please check your connection and try again.');
       } else if (error instanceof TypeError && error.message.includes('fetch')) {
         setError('Network error. Please check your connection and try again.');
       } else {
         setError('Failed to verify token. Please try again.');
       }
     } finally {
       setIsVerifying(false);
     }
   };

   // Handle token request for production
   const handleGetToken = async () => {
     setIsGettingToken(true);
     setError('');
     setSuccess(''); // Clear any previous success message
     setTokenRequestMessage('');
     
     try {
       const response = await fetch('/api/admin/request-setup-token', {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Accept': 'application/json'
         },
         body: JSON.stringify({
           email: 'sunnyshinde2601@gmail.com' // Only this email is authorized
         })
       });

       // Check if response is ok before trying to parse JSON
       if (!response.ok) {
         if (response.status === 403) {
           setError('Unauthorized email address. Only authorized administrators can request tokens.');
         } else if (response.status >= 500) {
           setError('Server error. Please try again later.');
         } else {
           setError(`Token request failed (${response.status}). Please try again.`);
         }
         setTokenRequestMessage('❌ Token generation failed. Please try again or contact system administrator.');
         return;
       }

       let data;
       try {
         data = await response.json();
       } catch (jsonError) {
         console.error('Failed to parse response JSON:', jsonError);
         setError('Invalid response from server. Please try again.');
         setTokenRequestMessage('❌ Server response error. Please try again.');
         return;
       }

       if (data.success) {
         setTokenRequestMessage('✅ Token generated and sent to admin email. Please check your email and paste the token below.');
         setSuccess(''); // Clear any previous success message
       } else {
         setError(data.message || 'Failed to generate token. Please try again.');
         setTokenRequestMessage('❌ Token generation failed. Please try again or contact system administrator.');
       }
     } catch (error) {
       console.error('❌ Error requesting token:', error);
       if (error instanceof TypeError && error.message.includes('fetch')) {
         setError('Network error. Please check your connection and try again.');
         setTokenRequestMessage('❌ Network error. Please check your connection and try again.');
       } else {
         setError('Failed to request token. Please check your connection and try again.');
         setTokenRequestMessage('❌ Network error. Please check your connection and try again.');
       }
     } finally {
       setIsGettingToken(false);
     }
   };

  // Handle admin signup
  const handleSignup = async () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'create-admin',
          email: signupForm.email,
          password: signupForm.password,
          token: setupToken
        })
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 401) {
          setError('Token expired or invalid. Please generate a new token.');
        } else if (response.status === 400) {
          setError('Invalid request. Please check your input and try again.');
        } else if (response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Signup failed (${response.status}). Please try again.`);
        }
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (data.success) {
        setSuccess('Admin account created successfully! Signing you in...');
        
        console.log('🔐 Attempting auto-login for newly created admin:', signupForm.email);
        
        const result = await signIn('admin-credentials', {
          email: signupForm.email,
          password: signupForm.password,
          redirect: false,
        });

        console.log('🔐 Auto-login result:', result);

        if (result?.ok) {
          console.log('✅ Auto-login successful, redirecting to dashboard');
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1500);
        } else {
          console.log('❌ Auto-login failed, showing manual login option');
          setError('Admin created but login failed. Please try logging in.');
          setStep('options');
        }
      } else {
        setError(data.message || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to create admin account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin login
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Manual login attempt for:', loginForm.email);
      
      const result = await signIn('admin-credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      console.log('🔐 Manual login result:', result);

      if (result?.ok) {
        console.log('✅ Manual login successful, redirecting to dashboard');
        setSuccess('Login successful! Redirecting to admin panel...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        console.log('❌ Manual login failed:', result?.error);
        if (result?.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please try again.');
        } else if (result?.error === 'Configuration') {
          setError('Authentication system error. Please contact administrator.');
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to token step
  const goBackToToken = () => {
    setStep('token');
    setTokenVerified(false);
    setError('');
    setSuccess('');
  };

  // Step indicator component - Mobile First
  const StepIndicator = () => {
    const steps = [
      { key: 'token', label: 'Verify Token', icon: Key, description: 'Enter your setup token' },
      { key: 'options', label: 'Choose Action', icon: Shield, description: 'Select what to do next' },
      { key: 'signup', label: 'Create Admin', icon: UserPlus, description: 'Set up admin account' },
      { key: 'login', label: 'Access Panel', icon: LogIn, description: 'Login to admin panel' }
    ];

    return (
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.key;
              const isCompleted = 
                (stepItem.key === 'token' && tokenVerified) ||
                (stepItem.key === 'options' && (step === 'signup' || step === 'login')) ||
                (stepItem.key === 'signup' && step === 'login') ||
                (stepItem.key === 'login' && step === 'login');

              return (
                <div key={stepItem.key} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <div className="text-center mt-1">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stepItem.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                      {stepItem.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Instructions above the form - Mobile First */}
        <div className="text-center mb-4 sm:mb-6 text-white">
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold mb-2">CaptionCraft Admin</h1>
          <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
            {step === 'token' ? 'Enter setup token to continue' :
             step === 'options' ? 'Choose your action' :
             step === 'signup' ? 'Create admin account' :
             'Login to admin panel'}
          </p>
          
          {/* Step indicator above form - Mobile First */}
          <StepIndicator />
        </div>

        {/* Main form card - Mobile First sizing */}
        <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Fixed height messages to prevent form expansion */}
            <FixedHeightMessage
              type={error ? 'error' : success ? 'success' : 'info'}
              message={error || success || ''}
              height="min-h-[60px]"
            />

            {step === 'token' && (
              <div className="space-y-4">
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Get your setup token for production deployment
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Click "Get Token" to generate and send token</p>
                    <p>• Token will be sent to authorized admin email</p>
                    <p>• <strong>Copy the ENTIRE token from your email</strong> (150+ characters)</p>
                    <p>• Token expires in 24 hours (not 30 seconds)</p>
                    <p>• Check your email spam folder if not received</p>
                    <p className="text-red-600 font-medium">⚠️ Important: Make sure to copy the complete token without truncation</p>
                  </div>
                </div>

                {/* Get Token Button - Mobile First */}
                <div className="text-center">
                  <Button
                    onClick={handleGetToken}
                    disabled={isGettingToken}
                    className="w-full h-10 sm:h-9 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg mb-3"
                    size="lg"
                  >
                    {isGettingToken ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Token...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Get Token
                      </>
                    )}
                  </Button>
                  
                  {/* Token copying instructions */}
                  <div className="text-xs text-gray-600 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="font-medium text-blue-800 mb-2">📋 How to copy the token properly:</p>
                    <ul className="text-left space-y-1 text-blue-700">
                      <li>• <strong>Gmail:</strong> Click on the token text, press Ctrl+A (Cmd+A on Mac), then Ctrl+C</li>
                      <li>• <strong>Outlook:</strong> Double-click the token, press Ctrl+C to copy</li>
                      <li>• <strong>Mobile:</strong> Long-press the token text, select "Select All", then "Copy"</li>
                      <li>• <strong>Important:</strong> Make sure you see the complete token before copying</li>
                    </ul>
                  </div>
                  
                  {/* Fixed height token message to prevent form expansion */}
                  <FixedHeightMessage
                    type="info"
                    message={tokenRequestMessage}
                    height="min-h-[40px]"
                  />
                </div>
                
                <div>
                  <label htmlFor="token" className="block text-sm font-semibold text-gray-800 mb-2">
                    Setup Token
                  </label>
                  <div className="text-xs text-gray-600 mb-2 text-center">
                    💡 <strong>Copy the entire token from your email</strong> - JWT tokens are typically 150+ characters long
                  </div>
                  <Input
                    id="token"
                    type="text"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    placeholder="Paste your complete setup token here..."
                    className="h-10 sm:h-10 text-center text-sm font-mono bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleTokenVerification()}
                    style={{ fontSize: '12px', letterSpacing: '0.5px' }}
                  />
                  <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
                    <div>🔒 Token access restricted to authorized administrators only</div>
                    <div>⚠️ Unauthorized access attempts will be logged and blocked</div>
                    <div className="text-blue-600 font-medium">
                      📧 Make sure to copy the complete token from your email (check spam folder)
                    </div>
                  </div>
                  
                  {/* Token length indicator */}
                  {setupToken && (
                    <div className={`text-xs mt-2 text-center font-medium ${
                      setupToken.length >= 150 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Token length: {setupToken.length} characters 
                      {setupToken.length >= 150 ? ' ✅' : ' ⚠️ (may be incomplete)'}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleTokenVerification}
                  disabled={isVerifying || !setupToken.trim()}
                  className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Verify Token
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 'options' && (
              <div className="space-y-3">
                <div className="text-center mb-3">
                  <p className="text-gray-600 text-sm">
                    {adminExists 
                      ? 'Admin system is already set up. You can either create a new admin account or login with existing credentials.'
                      : 'Token verified! You can now create the first admin account or login if one already exists.'
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => setStep('signup')}
                    className="h-10 sm:h-9 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                    size="lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Admin Account
                  </Button>
                  
                  <Button
                    onClick={() => setStep('login')}
                    variant="outline"
                    className="h-10 sm:h-9 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                    size="lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Existing Account
                  </Button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <Button
                    onClick={goBackToToken}
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-gray-700 text-sm h-10 sm:h-9"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Use Different Token
                  </Button>
                </div>
              </div>
            )}

            {step === 'signup' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800">Create Admin Account</h3>
                  <Button
                    onClick={() => setStep('options')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 text-xs h-8"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </Button>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="h-10 sm:h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="h-10 sm:h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 sm:h-9 px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="h-10 sm:h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 sm:h-9 px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full h-10 sm:h-9 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-2" />
                      Create Admin Account
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 'login' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800">Login to Admin Panel</h3>
                  <Button
                    onClick={() => setStep('options')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 text-xs h-8"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </Button>
                </div>
                
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-800 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="h-10 sm:h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="h-10 sm:h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 sm:h-9 px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-10 sm:h-9 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3 mr-2" />
                      Login to Admin Panel
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminSetup() {
  return (
    <MobileErrorBoundary>
      <AdminSetupContent />
    </MobileErrorBoundary>
  );
}
