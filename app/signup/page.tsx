"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DarkVeil } from "@/components/ui/dark-veil";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

import { signUp } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import RedirectIfAuthenticated from "@/components/redirect-if-authenticated";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);

  // Handle video fade effect on loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Start fade 0.5 seconds before the video ends
      if (video.duration - video.currentTime < 0.5) {
        setIsFading(true);
      }
    };

    const handlePlay = () => {
      // Reset fade when video starts playing again
      setIsFading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!agreeTerms) {
      setError("You must agree to the terms and privacy policy");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Validate form fields
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Pass the full name to the signUp function
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) throw error;
      
      // Check if we got a user back (successful signup)
      if (data && data.user) {
        // Store additional user metadata in a Supabase profile table
        // This would be done once the user verifies their email
        
        setSuccessMessage("Registration successful! Please check your email for the verification code.");
        
        // Redirect to OTP verification page after a short delay
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        // This shouldn't happen, but just in case
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      // Check if the error is related to email already being taken
      if (error instanceof Error) {
        setError(error.message || "Failed to create account. Please try again.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen bg-background">
        <Head>
          <title>Sign Up</title>
          <meta name="description" content="Create your free Resumify account to start building professional resumes. Join thousands of job seekers who have landed their dream jobs with our easy-to-use resume builder." />
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
          noiseIntensity={0.04}
          speed={0.3}
        >
          <div className="min-h-screen flex items-center justify-center px-0 py-0">
            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row w-full h-screen bg-white/95 dark:bg-[#0C111D]/90 backdrop-blur-xl shadow-none rounded-none overflow-hidden">
              {/* Left Column - Video */}
              <div className="hidden lg:block lg:w-3/5 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-blue-800"></div>
                {/* Background video with blend mode and fade effect */}
                <div className={`absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-20'}`}>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/woman-creating-resume.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold mb-4">Create Your Professional Resume</h2>
                    <p className="text-xl opacity-90">Build stunning resumes that get you hired faster</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold">10K+</div>
                      <div className="text-sm opacity-80">Resumes Created</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold">95%</div>
                      <div className="text-sm opacity-80">ATS Compliant</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Signup Form */}
              <div className="w-full lg:w-2/5 bg-white dark:bg-[#0C111D]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 sm:p-8 max-w-md mx-auto flex items-center justify-center h-full"
                >
                  <Card className="bg-transparent shadow-none border-0 w-full">
                    <CardHeader className="text-center space-y-2 pb-6">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {/* Logo */}
                        <div className="mb-4 flex justify-center">
                          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                            Resumify
                          </h1>
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          Create Your Account
                        </CardTitle>
                      </motion.div>
                      <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Join Resumify and start building your perfect resume
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
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg">
                          <p>{successMessage}</p>
                        </div>
                      )}
                      
                      {!successMessage && (
                        <motion.form 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="space-y-3" 
                          onSubmit={handleSubmit}
                        >
                          {/* Full Name Field */}
                          <div className="space-y-2">
                            <motion.div 
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="relative"
                            >
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="pl-9 h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-lg transition-all dark:bg-[#0C111D]/50 dark:text-white text-sm"
                                required
                                disabled={isLoading}
                              />
                            </motion.div>
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <motion.div 
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="relative"
                            >
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="pl-9 h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-lg transition-all dark:bg-[#0C111D]/50 dark:text-white text-sm"
                                required
                                disabled={isLoading}
                              />
                            </motion.div>
                          </div>

                          {/* Password Field */}
                          <div className="space-y-2">
                            <motion.div 
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="relative"
                            >
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="pl-9 pr-9 h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-lg transition-all dark:bg-[#0C111D]/50 dark:text-white text-sm"
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </motion.div>
                            <PasswordStrengthMeter 
                              password={password} 
                            />
                          </div>

                          {/* Confirm Password Field */}
                          <div className="space-y-2">
                            <motion.div 
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="relative"
                            >
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="pl-9 pr-9 h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-lg transition-all dark:bg-[#0C111D]/50 dark:text-white text-sm"
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </motion.div>
                          </div>

                          {/* Terms and Marketing Opt-in */}
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center h-5">
                                <Switch
                                  id="terms"
                                  checked={agreeTerms}
                                  onCheckedChange={setAgreeTerms}
                                  disabled={isLoading}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-w-0">
                                <Label 
                                  htmlFor="terms" 
                                  className="cursor-pointer flex flex-wrap items-center gap-x-1"
                                  onClick={() => !isLoading && setAgreeTerms(!agreeTerms)}
                                >
                                  <span className="text-xs sm:text-sm whitespace-nowrap">I agree to the</span>
                                  <Link href="/terms" className="text-xs sm:text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium whitespace-nowrap">
                                    Terms of Service
                                  </Link>
                                  <span className="text-xs sm:text-sm whitespace-nowrap">and</span>
                                  <Link href="/privacy" className="text-xs sm:text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium whitespace-nowrap">
                                    Privacy Policy
                                  </Link>
                                </Label>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center h-5">
                                <Switch
                                  id="marketing"
                                  checked={marketingOptIn}
                                  onCheckedChange={setMarketingOptIn}
                                  disabled={isLoading}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <Label 
                                  htmlFor="marketing" 
                                  className="cursor-pointer"
                                  onClick={() => !isLoading && setMarketingOptIn(!marketingOptIn)}
                                >
                                  <span className="text-xs sm:text-sm">Send me occasional product updates and marketing emails</span>
                                </Label>
                              </div>
                            </div>
                          </div>

                          {/* Sign Up Button */}
                          <motion.div
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                          >
                            <Button
                              type="submit"
                              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 text-sm"
                              disabled={isLoading}
                            >
                              {isLoading ? "Creating Account..." : "Create Account"}
                            </Button>
                          </motion.div>
                        </motion.form>
                      )}

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-3 bg-white dark:bg-[#0C111D] text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                      </div>

                      {/* Social Signup Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full h-14 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                          >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            Google
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full h-14 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                          >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </Button>
                        </motion.div>
                      </div>

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
            </div>
          </div>
        </DarkVeil>
      </div>
    </RedirectIfAuthenticated>
  );
}