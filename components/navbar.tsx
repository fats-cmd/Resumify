"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useScrollDirection } from "@/hooks/useScrollDirection"
import { MobileCardNav } from "./ui/mobile-card-nav"
import { BarcodeMenuIcon } from "./ui/barcode-menu-icon"
import { LogIn, UserPlus, User, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()
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
  
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

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

  // Desktop auth buttons component
  const DesktopAuthButtons = () => {
    // Show loading state during auth check or when not mounted
    if (loading || !mounted) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      );
    }

    if (user) {
      const avatarUrl = user.user_metadata?.avatar_url;
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-white">
                {fullName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 p-2 rounded-2xl border border-white/20 bg-background/80 backdrop-blur-xl shadow-xl" 
            align="end" 
            forceMount
          >
            <div className="flex flex-col space-y-1">
              <div 
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Dashboard</span>
              </div>
              <div 
                className="group relative flex items-center justify-start gap-3 w-full p-4 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 ease-out shadow-lg hover:shadow-xl text-red-600 hover:text-red-600 cursor-pointer"
                onClick={handleSignOut}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Log out</span>
                </div>
                
                {/* Arrow indicator */}
                <div className="relative z-10 ml-auto">
                  <svg 
                    className="w-4 h-4 text-red-600/60 group-hover:text-red-600/80 group-hover:translate-x-1 transition-all duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <>
        <Button variant="ghost" asChild className="rounded-full gap-2 text-white hover:bg-white/20 transition-all duration-300">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
        </Button>
        <Button asChild className="rounded-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Link href="/signup">
            <UserPlus className="h-4 w-4" />
            Sign up
          </Link>
        </Button>
      </>
    );
  };

  // Mobile auth buttons component
  const MobileAuthButtons = () => {
    // Show loading state during auth check or when not mounted
    if (loading || !mounted) {
      return (
        <div className="flex items-center gap-2 p-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      );
    }

    if (user) {
      const avatarUrl = user.user_metadata?.avatar_url;
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      
      return (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <span className="font-medium text-white">
              {fullName}
            </span>
          </div>
          <MobileCardNav 
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <LayoutDashboard className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Dashboard</span>
          </MobileCardNav>
          <div 
            className="group relative flex items-center justify-start gap-3 w-full p-4 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 ease-out shadow-lg hover:shadow-xl text-red-600 hover:text-red-600 cursor-pointer"
            onClick={() => {
              handleSignOut();
              setMobileMenuOpen(false);
            }}
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-3 w-full">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log out</span>
            </div>
            
            {/* Arrow indicator */}
            <div className="relative z-10 ml-auto">
              <svg 
                className="w-4 h-4 text-red-600/60 group-hover:text-red-600/80 group-hover:translate-x-1 transition-all duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <MobileCardNav 
          href="/login"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <LogIn className="h-5 w-5" />
          <span className="font-medium">Log in</span>
        </MobileCardNav>
        <MobileCardNav 
          href="/signup"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <UserPlus className="h-5 w-5 text-purple-400" />
          <span className="font-medium text-purple-400">Sign up</span>
        </MobileCardNav>
      </>
    );
  };

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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
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
          <DesktopAuthButtons />
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
              <MobileAuthButtons />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
