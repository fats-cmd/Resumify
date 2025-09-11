"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getResumes, deleteResume, signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  LayoutDashboard, 
  Clock, 
  Star,
  LogOut,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { Resume } from "@/types/resume";
import { DynamicDock } from "@/components/dynamic-dock";

// Skeleton component for loading states - improved to better reflect resume structure
const SkeletonCard = () => (
  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
    <CardHeader className="pb-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export default function MyResumesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;
      
      try {
        setResumesLoading(true);
        // Add a minimum loading time to ensure skeleton is visible
        const startTime = Date.now();
        
        const { data, error } = await getResumes(user.id);
        
        // Ensure skeleton shows for at least 800ms for better UX
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800;
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }
        
        if (error) {
          console.error("Error fetching resumes:", error);
          toast.error("Failed to load resumes. Please try again later.");
        } else {
          setResumes(data || []);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
        toast.error("Failed to load resumes. Please try again later.");
      } finally {
        setResumesLoading(false);
        setLoading(false);
      }
    };

    if (user) {
      // Reset avatar error state when user changes
      setAvatarError(false);
      fetchResumes();
    }
  }, [user]);

  const handleDeleteResume = async (id: number) => {
    try {
      const { error } = await deleteResume(id);
      
      if (error) {
        console.error("Error deleting resume:", error);
        toast.error("Error deleting resume. Please try again.");
      } else {
        // Remove the resume from the local state
        setResumes(resumes.filter(resume => resume.id !== id));
        toast.success("Resume deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      toast.error("Error deleting resume. Please try again.");
    }
  };

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

  // Get user's profile image or generate initials
  const getUserAvatar = () => {
    if (!user) return null;
    
    // Check if user has an avatar URL (uploaded image or custom avatar)
    const avatarUrl = user.user_metadata?.avatar_url;
    const customAvatar = user.user_metadata?.custom_image_avatar;
    
    // Add cache-busting parameter to avatar URL
    const cacheBustedAvatarUrl = avatarUrl ? `${avatarUrl}?t=${Date.now()}` : null;
    const displayAvatar = cacheBustedAvatarUrl || customAvatar;
    
    if (displayAvatar && !avatarError) {
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
          onError={() => setAvatarError(true)}
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
      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
        {initials.toUpperCase()}
      </div>
    );
  };

  // Add this helper function before the component definition
  const formatDateDifference = (dateString: string): string => {
    // Handle invalid date strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    
    // Handle future dates
    if (diffTime < 0) {
      return date.toLocaleDateString();
    }
    
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Link href="/" className="font-bold text-2xl sm:text-3xl flex items-center">
                <span className="text-white dark:text-white dark:bg-gradient-to-r dark:from-primary dark:to-primary/70 dark:bg-clip-text dark:dark:text-transparent">
                  Resumify
                </span>
              </Link>
              <div className="flex items-center space-x-3">
                {loading ? (
                  <div className="h-7 w-14 bg-white/30 rounded-full animate-pulse"></div>
                ) : (
                  <>
                    <ThemeToggle className="bg-white/20 border-white/30 hover:bg-white/30" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1">
                          {getUserAvatar()}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 mr-4 mt-2" align="end" forceMount>
                        <div className="flex items-center px-2 py-2">
                          <div className="mr-2">
                            {getUserAvatar()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user?.user_metadata?.full_name || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/30 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">My Resumes</h1>
                    <p className="text-white/80 mt-2">
                      Manage your professional resumes
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {loading ? (
                  <div className="h-10 w-40 bg-white/30 rounded animate-pulse"></div>
                ) : (
                  <Button asChild className="bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full font-medium">
                    <Link href="/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Resume
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 pb-24">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Menu */}
            <div className="lg:w-64 flex-shrink-0">
              {loading ? (
                // Sidebar Skeleton Loading
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
                  <CardHeader>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="space-y-3">
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Dashboard Menu</CardTitle>
                    <CardDescription>
                      Navigate your workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        asChild
                      >
                        <Link href="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        className="w-full justify-start rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        onClick={() => router.push("/my-resumes")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        My Resumes
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        asChild
                      >
                        <Link href="/templates">
                          <FileText className="h-4 w-4 mr-2" />
                          My Templates
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-full"
                        asChild
                      >
                        <Link href="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                    </nav>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Resources</h3>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-full"
                          onClick={() => toast.info("Help documentation coming soon!")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Help Center
                        </Button>
                      </div>
                    </div>
                    
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
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Resumes Section */}
              <div className="mb-24 mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-foreground">Your Resumes</h2>
                        <p className="text-muted-foreground mt-1 sm:mt-0">
                          Manage and track your resumes
                        </p>
                      </>
                    )}
                  </div>
                  {loading ? (
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <Button variant="outline" asChild className="border-input text-foreground hover:bg-accent hover:text-accent-foreground rounded-full">
                      <Link href="/create">
                        <Plus className="h-4 w-4 mr-2" />
                        New Resume
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {resumesLoading ? (
                    [...Array(3)].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <SkeletonCard />
                      </motion.div>
                    ))
                  ) : resumes.length > 0 ? (
                    resumes.map((resume, index) => (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  {resume.title}
                                  {resume.is_featured && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full px-2 py-0.5">
                                      <Star className="h-3 w-3 mr-1 fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground mt-1">
                                  Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge 
                                variant={resume.status === "Published" ? "default" : "secondary"}
                                className={`rounded-full px-2 py-0.5 ${
                                  resume.status === "Published" 
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300" 
                                    : "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {resume.status || "Draft"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex gap-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {resume.views || 0}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Download className="h-4 w-4 mr-1" />
                                  {resume.downloads || 0}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Created {formatDateDifference(resume.created_at)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild className="border-input text-foreground hover:bg-accent rounded-full">
                                <Link href={`/resume/${resume.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild className="border-input text-foreground hover:bg-accent rounded-full">
                                <Link href={`/edit/${resume.id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteResume(resume.id)}
                                className="border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-300 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden lg:col-span-2">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-16 w-16 text-muted-foreground mb-6" />
                        <h3 className="text-2xl font-bold mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                          Get started by creating your first professional resume.
                        </p>
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full">
                          <Link href="/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Resume
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Dock Component */}
        <DynamicDock currentPage="my-resumes" showLogout={false} />
      </div>
    </ProtectedPage>
  );
}