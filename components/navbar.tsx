"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useScrollDirection } from "@/hooks/useScrollDirection"
import { MobileCardNav } from "./ui/mobile-card-nav"
import { BarcodeMenuIcon } from "./ui/barcode-menu-icon"
import { LogIn, UserPlus } from "lucide-react"

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollDirection = useScrollDirection()
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 10)
      setScrollY(currentScrollY)
    }
    
    // Only add event listener on client side
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Only apply transform if we've mounted (client-side)
  const navClass = cn(
    "fixed z-50 navbar-gradient backdrop-blur-md flex items-center justify-between shadow-sm dark:shadow-lg navbar-glow",
    "transition-all duration-500 ease-out",
    "transform-gpu will-change-transform",
    // Mobile: top full width with curved bottom corners when scrolled, top rounded when at top
    // Desktop: always fully rounded regardless of scroll state
    scrollY > 50 ? 
      "top-0 left-0 right-0 w-full px-4 py-4 rounded-b-3xl sm:top-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-7xl sm:mx-auto sm:rounded-full sm:px-6 sm:py-3" :
      "top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-full px-4 sm:px-6 py-3",
    // Hide navbar when scrolling down (but not on mobile when it's full width at top)
    mounted && scrollDirection === 'down' && scrollY > 100 ? 
      "sm:-translate-y-20" : 
      "translate-y-0",
    scrolled && 'shadow-sm dark:shadow-md',
    !mounted && 'top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-full px-4 sm:px-6 py-3 translate-y-0'
  );

  if (!mounted) {
    // Return a simplified version for server-side rendering
    return (
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto navbar-gradient backdrop-blur-md rounded-full px-4 sm:px-6 py-3 flex items-center justify-between z-50 shadow-sm dark:shadow-lg navbar-glow transition-all duration-500 ease-out transform-gpu will-change-transform">
        <Link href="/" className="font-bold text-lg sm:text-xl flex items-center">
          <span className="text-white dark:text-white dark:bg-gradient-to-r dark:from-primary dark:to-primary/70 dark:bg-clip-text dark:dark:text-transparent">
            Resumify
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="rounded-full gap-2 text-white hover:bg-white/20">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </Button>
          <Button asChild className="rounded-full gap-2 bg-white text-black hover:bg-gray-100">
            <Link href="/signup">
              <UserPlus className="h-4 w-4" />
              Sign up
            </Link>
          </Button>
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="rounded-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
            <BarcodeMenuIcon isOpen={false} />
          </Button>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className={navClass}>
        <Link href="/" className="font-bold text-lg sm:text-xl flex items-center">
          <span className="text-white dark:text-white dark:bg-gradient-to-r dark:from-primary dark:to-primary/70 dark:bg-clip-text dark:dark:text-transparent">
            Resumify
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="rounded-full gap-2 text-white hover:bg-white/20">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </Button>
          <Button asChild className="rounded-full gap-2 bg-white text-black hover:bg-gray-100">
            <Link href="/signup">
              <UserPlus className="h-4 w-4" />
              Sign up
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <BarcodeMenuIcon isOpen={mobileMenuOpen} />
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-20 left-4 right-4 bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col space-y-3">
              <MobileCardNav 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Log in</span>
              </MobileCardNav>
              <MobileCardNav 
                href="/signup"
                className="bg-white/90 text-black hover:bg-white hover:text-black border-white/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Sign up</span>
              </MobileCardNav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
