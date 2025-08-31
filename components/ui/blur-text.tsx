"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  text: string
  className?: string
  variant?: "word" | "character"
  duration?: number
  delay?: number
}

export function BlurText({
  text,
  className,
  variant = "word",
  duration = 1,
  delay = 0,
}: BlurTextProps) {
  const words = text.split(" ")
  
  if (variant === "character") {
    const characters = text.split("")
    
    return (
      <div className={cn("flex flex-wrap", className)}>
        {characters.map((char, i) => (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{
              duration,
              delay: delay + i * 0.02,
              ease: "easeOut",
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0 }}
          animate={{ filter: "blur(0px)", opacity: 1 }}
          transition={{
            duration,
            delay: delay + i * 0.1,
            ease: "easeOut",
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}