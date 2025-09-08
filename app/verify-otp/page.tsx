"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DarkVeil } from "@/components/ui/dark-veil";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import RedirectIfAuthenticated from "@/components/redirect-if-authenticated";

// Create a client component that handles search params client-side only
function VerifyOtpContent() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isLinkVerification, setIsLinkVerification] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Get email from URL params or redirect if not present
  useEffect(() => {
    // Client-side only: get search params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
      
      const emailParam = params.get("email");
      const tokenParam = params.get("token");
      const typeParam = params.get("type");
      
      if (emailParam) {
        setEmail(emailParam);
      } else if (tokenParam && typeParam) {
        // This is a link verification flow
        setIsLinkVerification(true);
        // For link verification, we don't need to show the OTP input
        // The user should have already clicked the link in their email
      } else {
        // Redirect to signup if no email is provided
        router.push("/signup");
      }
    }
  }, [router]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Start countdown when resend is triggered
  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60); // 60 seconds countdown
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // For link verification, automatically verify the token
  useEffect(() => {
    if (isLinkVerification && searchParams) {
      const verifyToken = async () => {
        try {
          setIsLoading(true);
          const token = searchParams.get("token");
          const type = searchParams.get("type");
          
          if (token && type) {
            // For signup verification, we need to include the email
            const email = searchParams.get("email") || "";
            
            const { error } = await supabase.auth.verifyOtp({
              email: email,
              token: token,
              type: type as 'email' | 'recovery' | 'invite' | 'email_change',
            });
            
            if (error) throw error;
            
            setSuccessMessage("Email verified successfully! Redirecting to your dashboard...");
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } catch (error: unknown) {
          console.error("Token verification error:", error);
          setError(error instanceof Error ? error.message : "Failed to verify email. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      
      verifyToken();
    }
  }, [isLinkVerification, searchParams, router]);

  const validateForm = () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify the OTP with Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) throw error;
      
      // If successful, redirect to dashboard or show success
      setSuccessMessage("Email verified successfully! Redirecting to your dashboard...");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      console.error("OTP verification error:", error);
      setError(error instanceof Error ? error.message : "Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    // Prevent resending if countdown is active or if already loading
    if (!canResend || isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Resend the OTP
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      setSuccessMessage("Verification code resent! Please check your email.");
      
      // Start countdown after successful resend
      startCountdown();
    } catch (error: unknown) {
      console.error("Resend OTP error:", error);
      setError(error instanceof Error ? error.message : "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while we're initializing
  if (!searchParams) {
    return (
      <div className="min-h-screen bg-background">
        <DarkVeil
          className="min-h-screen"
          hueShift={390}
          noiseIntensity={0.3}
          speed={0.3}
        >
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
              <Card className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading verification page...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DarkVeil>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Verify Email</title>
        <meta name="description" content="Verify your email address to complete your Resumify account registration." />
      </Head>
      
      {/* Back to home button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </motion.div>

      <DarkVeil
        className="min-h-screen"
        hueShift={390}
        noiseIntensity={0.3}
        speed={0.3}
      >
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="text-center space-y-2 pb-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {isLinkVerification ? "Verifying Email" : "Verify Your Email"}
                  </CardTitle>
                </motion.div>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {isLinkVerification 
                    ? "Please wait while we verify your email..." 
                    : `Enter the 6-digit code sent to ${email}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
                
                {!isLinkVerification && (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-6" 
                    onSubmit={handleSubmit}
                  >
                    {/* OTP Input Fields */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verification Code
                      </Label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        inputClassName="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-xl transition-all dark:bg-gray-800/50 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter the code sent to your email address
                      </p>
                    </div>

                    {/* Verify Button */}
                    <motion.div
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
                        disabled={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify Email"}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}

                {/* For link verification, show a loading state */}
                {isLinkVerification && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Verifying your email...
                    </p>
                  </div>
                )}

                {/* Resend Code - only show for OTP flow */}
                {!isLinkVerification && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Didn&apos;t receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading || !canResend}
                        className={`font-medium transition-colors disabled:opacity-50 ${
                          canResend 
                            ? "text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300" 
                            : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {canResend ? "Resend Code" : `Resend in ${countdown}s`}
                      </button>
                    </p>
                  </div>
                )}

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DarkVeil>
    </div>
  );
}

// Separate component for the main page that wraps content in Suspense
function VerifyOtpPageContent() {
  return (
    <RedirectIfAuthenticated>
      <VerifyOtpContent />
    </RedirectIfAuthenticated>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <DarkVeil
          className="min-h-screen"
          hueShift={390}
          noiseIntensity={0.3}
          speed={0.3}
        >
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
              <Card className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading verification page...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DarkVeil>
      </div>
    }>
      <VerifyOtpPageContent />
    </Suspense>
  );
}