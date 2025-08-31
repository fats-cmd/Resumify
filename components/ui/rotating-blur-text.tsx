"use client"

import { useState, useEffect } from "react"
import { BlurText } from "./blur-text"
import { cn } from "@/lib/utils"

interface RotatingBlurTextProps {
  texts: string[]
  className?: string
  variant?: "word" | "character"
  duration?: number
  rotationInterval?: number
}

export function RotatingBlurText({
  texts,
  className,
  variant = "word",
  duration = 0.8,
  rotationInterval = 3000,
}: RotatingBlurTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
      setKey((prev) => prev + 1) // Force re-render of BlurText
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [texts.length, rotationInterval])

  return (
    <BlurText
      key={key}
      text={texts[currentIndex]}
      className={cn("transition-all duration-300", className)}
      variant={variant}
      duration={duration}
      delay={0}
    />
  )
}