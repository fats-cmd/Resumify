"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  X,
  Search,
  Layout,

  LogOut,
  HelpCircle
} from "lucide-react";
import { TbLayoutSidebar, TbLayoutSidebarFilled } from "react-icons/tb";
import { signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import Image from 'next/image';

interface SidebarProps {
  currentPage: string;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ currentPage, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
          width={isCollapsed ? 32 : 40}
          height={isCollapsed ? 32 : 40}
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
      <div className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white ${isCollapsed ? "text-sm" : "text-base"} font-medium`}>
        {initials.toUpperCase()}
      </div>
    );
  };

  return (
    <div className={`bg-[#101B31] text-white h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16 px-2" : "w-full px-6"
    }`}>
      {/* Header with Resumify logo and toggle button */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6 pt-6`}>
        {!isCollapsed && <h1 className="text-2xl font-bold text-white">Resumify</h1>}
        
        {/* Container for toggle/exit buttons */}
        <div className="flex items-center">
          {/* Toggle button for desktop */}
          {onToggleCollapse && (
            <button 
              onClick={onToggleCollapse}
              className="p-2 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <TbLayoutSidebar className="h-5 w-5" />
              ) : (
                <TbLayoutSidebarFilled className="h-5 w-5" />
              )}
            </button>
          )}
          
          {/* Exit button for mobile */}
          {onClose && (
            <div className="lg:hidden">
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      {!isCollapsed && (
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-[#1B2D51] border border-[#1B2D51] text-white placeholder-gray-300 rounded-xl focus:bg-[#1B2D51] focus:border-[#1B2D51]"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <div className="space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
              currentPage === "dashboard" 
                ? "bg-white/4 text-white" 
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "justify-start"}`}
            onClick={() => {
              router.push("/dashboard");
              onClose?.();
            }}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
          </button>
          
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
              currentPage === "my-resumes" 
                ? "bg-white/4 text-white" 
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "justify-start"}`}
            onClick={() => {
              router.push("/my-resumes");
              onClose?.();
            }}
            title={isCollapsed ? "My Resumes" : undefined}
          >
            <FileText className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">My Resumes</span>}
          </button>
          
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
              currentPage === "templates" 
                ? "bg-white/4 text-white" 
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "justify-start"}`}
            onClick={() => {
              router.push("/templates");
              onClose?.();
            }}
            title={isCollapsed ? "Templates" : undefined}
          >
            <Layout className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Templates</span>}
          </button>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-1">

        
        <button
          className={`w-full flex items-center gap-3 px-3 py-3 text-left text-gray-300 hover:bg-white/10 hover:text-white transition-all rounded-lg ${isCollapsed ? "justify-center" : "justify-start"}`}
          onClick={() => {
            toast.info("Help documentation coming soon!");
            onClose?.();
          }}
          title={isCollapsed ? "Help Center" : undefined}
        >
          <HelpCircle className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Help Center</span>}
        </button>
        
        <button
          className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
            currentPage === "settings" 
              ? "bg-white/4 text-white" 
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          } ${isCollapsed ? "justify-center" : "justify-start"}`}
          onClick={() => {
            router.push("/settings");
            onClose?.();
          }}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        
        {/* Profile section */}
        <div className={`flex items-center ${isCollapsed ? "justify-center rounded-full w-12 h-12 mx-auto" : "justify-between rounded-4xl"} bg-blue-800/30 p-2 mb-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 ${isCollapsed ? "w-8 h-8" : ""}`}>
              {getUserAvatar()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={async () => {
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
                }
              }}
              className="p-1.5 rounded-full hover:bg-blue-700/50 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-red-400 hover:text-red-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}