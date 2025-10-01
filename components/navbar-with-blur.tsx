"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { LogIn, UserPlus } from "lucide-react";
import { BlurText } from "./ui/blur-text";

export function NavbarWithBlur() {
  const [mounted, setMounted] = useState(false);
  const scrollDirection = useScrollDirection();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Only add event listener on client side
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only apply transform if we've mounted (client-side)
  const navClass = cn(
    "fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto navbar-gradient backdrop-blur-md border rounded-full px-6 py-3 flex items-center justify-between z-50 shadow-lg transition-transform duration-300 ease-in-out navbar-glow",
    mounted && scrollDirection === "down" ? "-translate-y-24" : "translate-y-0",
    scrolled && "shadow-md",
    !mounted && "translate-y-0" // Initial render should match server
  );

  if (!mounted) {
    // Return a simplified version for server-side rendering
    return (
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto navbar-gradient backdrop-blur-md border rounded-full px-6 py-3 flex items-center justify-between z-50 shadow-lg navbar-glow">
        <Link href="/" className="font-bold text-xl flex items-center">
          <Image
            src="/logo/resumify-logo.png"
            alt="Resumify Logo"
            width={120}
            height={30}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={navClass}>
      <Link href="/" className="font-bold text-xl flex items-center">
        <Image
          src="/logo/resumify-logo.png"
          alt="Resumify Logo"
          width={120}
          height={30}
          className="object-contain"
        />
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" asChild className="rounded-full gap-2">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
        </Button>
        <Button asChild className="rounded-full gap-2">
          <Link href="/signup">
            <UserPlus className="h-4 w-4" />
            Sign up
          </Link>
        </Button>
      </div>
    </nav>
  );
}
