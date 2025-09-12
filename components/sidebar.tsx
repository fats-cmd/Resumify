"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import Image from 'next/image';

interface SidebarProps {
  currentPage: string;
  onClose?: () => void;
  showLogout?: boolean;
}

export function Sidebar({ currentPage, onClose, showLogout = true }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out. Please try again.");
      } else {
        toast.success("You have been logged out successfully.");
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user's profile image or generate initials
  const getUserAvatar = () => {
    if (!user) return null;
    
    // Check if user has an avatar URL (uploaded image or custom avatar)
    const avatarUrl = user.user_metadata?.avatar_url;
    const customAvatar = user.user_metadata?.custom_image_avatar;
    const displayAvatar = avatarUrl || customAvatar;
    
    if (displayAvatar) {
      // Extract the base URL without cache-busting parameter for the Image component
      const [baseUrl] = displayAvatar.split('?t=');
      return (
        <Image 
          src={baseUrl} 
          alt="Profile" 
          width={32}
          height={32}
          className="rounded-full object-cover border-2 border-white/20"
          priority
        />
      );
    }
    
    // Generate initials from user's name or email
    const fullName = user.user_metadata?.full_name;
    const email = user.email || '';
    let initials = '';
    
    if (fullName) {
      const names = fullName.split(' ');
      initials = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '');
    } else if (email) {
      const emailParts = email.split('@');
      initials = emailParts[0].charAt(0);
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
        {initials.toUpperCase()}
      </div>
    );
  };

  return (
    <Card className="bg-card border-0 shadow-lg rounded-t-2xl overflow-hidden sticky top-8 h-full lg:h-auto">
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle className="text-lg">Dashboard Menu</CardTitle>
          <CardDescription>
            Navigate your workspace
          </CardDescription>
        </div>
        {/* Exit button for mobile */}
        {onClose && (
          <div className="lg:hidden">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          <Button
            variant={currentPage === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start rounded-full ${
              currentPage === "dashboard" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                : ""
            }`}
            onClick={() => {
              router.push("/dashboard");
              onClose?.();
            }}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentPage === "my-resumes" ? "default" : "ghost"}
            className={`w-full justify-start rounded-full ${
              currentPage === "my-resumes" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                : ""
            }`}
            onClick={() => {
              router.push("/my-resumes");
              onClose?.();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            My Resumes
          </Button>
          <Button
            variant={currentPage === "templates" ? "default" : "ghost"}
            className={`w-full justify-start rounded-full ${
              currentPage === "templates" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                : ""
            }`}
            onClick={() => {
              router.push("/templates");
              onClose?.();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            My Templates
          </Button>
          <Button
            variant={currentPage === "settings" ? "default" : "ghost"}
            className={`w-full justify-start rounded-full ${
              currentPage === "settings" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                : ""
            }`}
            onClick={() => {
              router.push("/settings");
              onClose?.();
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Resources</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-full"
              onClick={() => {
                toast.info("Help documentation coming soon!");
                onClose?.();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Help Center
            </Button>
          </div>
        </div>
        
        {showLogout && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                {getUserAvatar()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-full text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}