"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type PasswordStrengthMeterProps = {
  password: string;
  className?: string;
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: "Empty", color: "bg-gray-300 dark:bg-gray-600" };
  }

  // Check length
  const lengthScore = Math.min(Math.floor(password.length / 3), 3);

  // Check for different character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const typesScore = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  // Calculate total score
  const score = Math.min(lengthScore + typesScore, 5);

  // Return appropriate label and color
  switch (score) {
    case 0:
      return { score, label: "Empty", color: "bg-gray-300 dark:bg-gray-600" };
    case 1:
      return { score, label: "Very Weak", color: "bg-red-500" };
    case 2:
      return { score, label: "Weak", color: "bg-orange-500" };
    case 3:
      return { score, label: "Fair", color: "bg-yellow-500" };
    case 4:
      return { score, label: "Good", color: "bg-green-500" };
    case 5:
      return { score, label: "Strong", color: "bg-purple-600" };
    default:
      return { score: 0, label: "Empty", color: "bg-gray-300 dark:bg-gray-600" };
  }
};

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score, label, color } = getPasswordStrength(password);

  // Create 5 segments for the strength meter
  const segments = Array(5).fill(0).map((_, i) => i < score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1">
        {segments.map((isActive, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-sm",
              isActive ? color : "bg-gray-200 dark:bg-gray-700"
            )}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Password strength: <span className="font-medium">{label}</span>
        </p>
      </div>
    </div>
  );
}