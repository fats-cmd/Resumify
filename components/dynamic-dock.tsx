"use client";

import { useRouter } from "next/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Dock, DockItem } from "@/components/ui/dock";
import { 
  Home,
  LayoutDashboard,
  Plus,
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';

interface DynamicDockProps {
  showLogout?: boolean;
  currentPage?: 'home' | 'dashboard' | 'create' | 'templates' | 'my-resumes' | 'resume' | 'settings';
}

export function DynamicDock({ showLogout = true, currentPage }: DynamicDockProps) {
  const router = useRouter();
  const scrollDirection = useScrollDirection();

  const handleLogout = async () => {
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
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: scrollDirection === 'down' ? 0 : 1,
          y: scrollDirection === 'down' ? 20 : 0
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Dock>
          <DockItem title="Home" onClick={() => router.push("/")}>
            <Home className={`h-6 w-6 ${currentPage === 'home' ? 'text-primary' : 'text-foreground'}`} />
          </DockItem>
          <DockItem title="Dashboard" onClick={() => router.push("/dashboard")}>
            <LayoutDashboard className={`h-6 w-6 ${currentPage === 'dashboard' ? 'text-primary' : 'text-foreground'}`} />
          </DockItem>
          <DockItem title="Create Resume" onClick={() => router.push("/create")}>
            <Plus className={`h-6 w-6 ${currentPage === 'create' ? 'text-primary' : 'text-foreground'}`} />
          </DockItem>
          <DockItem title="My Templates" onClick={() => router.push("/templates")}>
            <FileText className={`h-6 w-6 ${currentPage === 'templates' ? 'text-primary' : 'text-foreground'}`} />
          </DockItem>
          <DockItem title="Settings" onClick={() => router.push("/settings")}>
            <Settings className={`h-6 w-6 ${currentPage === 'settings' ? 'text-primary' : 'text-foreground'}`} />
          </DockItem>
          {showLogout && (
            <DockItem title="Logout" onClick={handleLogout}>
              <LogOut className="h-6 w-6 text-foreground" />
            </DockItem>
          )}
        </Dock>
      </motion.div>
    </AnimatePresence>
  );
}