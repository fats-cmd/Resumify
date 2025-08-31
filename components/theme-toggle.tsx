"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={`relative w-14 h-7 bg-white/10 rounded-full border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-blue-600/20" />
        
        {/* Switch - default position */}
        <div className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center translate-x-1">
          <Sun className="h-3 w-3 text-orange-500" />
        </div>
      </button>
    )
  }

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 bg-white/10 rounded-full border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 ${className}`}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-blue-600/20" />
      
      {/* Switch */}
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-blue-600" />
        ) : (
          <Sun className="h-3 w-3 text-orange-500" />
        )}
      </div>
    </button>
  )
}
