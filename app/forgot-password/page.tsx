"use client";

import Link from "next/link";
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
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send a request to your backend to handle the password reset
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back to login button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </Link>
      </motion.div>

      <DarkVeil
        className="min-h-screen"
        hueShift={390}
        noiseIntensity={0.04}
        speed={0.3}
      >
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
                    Forgot Password
                  </CardTitle>
                </motion.div>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {isSubmitted ? 
                    "Check your email for reset instructions" :
                    "Enter your email to reset your password"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                      <div className="flex justify-center mb-4">
                        <svg className="w-16 h-16 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">Reset instructions sent to:</p>
                      <p className="font-medium text-purple-700 dark:text-purple-400">{email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Please check your inbox and follow the instructions to reset your password. 
                        If you don&apos;t receive an email within a few minutes, check your spam folder.
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <Button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Resend Email
                      </Button>
                      <Link href="/login" className="text-center">
                        <Button
                          variant="ghost"
                          className="w-full h-12 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                        >
                          Return to Login
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-5" 
                    onSubmit={handleSubmit}
                  >
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <motion.div 
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative"
                      >
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10 h-14 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 rounded-xl transition-all dark:bg-gray-800/50 dark:text-white"
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Reset Password
                      </Button>
                    </motion.div>
                    
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remember your password?{" "}
                        <Link
                          href="/login"
                          className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </motion.form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DarkVeil>
    </div>
  );
}