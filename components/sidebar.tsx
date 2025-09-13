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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
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

  return (
    <div className={`bg-gradient-to-b from-blue-900 to-blue-950 text-white h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16 px-2" : "w-full px-6"
    }`}>
      {/* Header with Resumify logo and toggle button */}
      <div className="flex items-center justify-between mb-6 pt-6">
        {!isCollapsed && <h1 className="text-2xl font-bold text-white">Resumify</h1>}
        
        <div className="flex items-center gap-2">
          {/* Toggle button for desktop */}
          {onToggleCollapse && (
            <button 
              onClick={onToggleCollapse}
              className="p-2 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
            className="w-full pl-10 bg-blue-800/50 border-blue-700 text-white placeholder-gray-300 rounded-xl focus:bg-blue-800/70 focus:border-blue-600"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <div className="space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
              currentPage === "dashboard" 
                ? "bg-white/20 text-white" 
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
                ? "bg-white/20 text-white" 
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
                ? "bg-white/20 text-white" 
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
          className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-lg ${
            currentPage === "settings" 
              ? "bg-white/20 text-white" 
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
      </div>
    </div>
  );
}