"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface MobileCardNavProps {
  children: ReactNode
  className?: string
  href: string
  onClick?: () => void
}

export function MobileCardNav({ 
  children, 
  className, 
  href, 
  onClick 
}: MobileCardNavProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group relative flex items-center justify-start gap-3 w-full p-4 rounded-xl",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          "hover:bg-white/10 hover:border-white/20",
          "transition-all duration-300 ease-out",
          "shadow-lg hover:shadow-xl",
          "text-white hover:text-white",
          className
        )}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-3 w-full">
          {children}
        </div>
        
        {/* Arrow indicator */}
        <div className="relative z-10 ml-auto">
          <svg 
            className="w-4 h-4 text-white/60 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  )
}