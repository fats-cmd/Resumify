"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { DashboardFooter } from "@/components/dashboard-footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicDock } from "@/components/dynamic-dock";
import { signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Star,
  Settings,
  LogOut,
  Plus,
  LayoutDashboard,
  FileText,
  Menu
} from "lucide-react";
import { motion } from "framer-motion";

// Template data - in a real app, this would come from an API
const templateCategories = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and modern designs for corporate environments",
    templates: [
      {
        id: 1,
        name: "Classic Professional",
        description: "Timeless design with clear structure and readability",
        previewImage: "/placeholder.svg",
        isPremium: false,
        isFeatured: true
      },
      {
        id: 2,
        name: "Modern Executive",
        description: "Sleek layout with bold typography and clean lines",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: true
      },
      {
        id: 3,
        name: "Creative Pro",
        description: "Professional with creative elements and unique layout",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: false
      },
      {
        id: 8,
        name: "Modern Split",
        description: "Bold two-column layout with accent colors and clean organization",
        previewImage: "/modern-split-preview.svg",
        isPremium: false,
        isFeatured: true
      },
      // Adding more templates to test pagination
      {
        id: 9,
        name: "Corporate Elite",
        description: "Sophisticated design for senior executives and corporate professionals",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: true
      },
      {
        id: 10,
        name: "Minimalist Pro",
        description: "Clean, uncluttered design that emphasizes your content",
        previewImage: "/placeholder.svg",
        isPremium: false,
        isFeatured: false
      },
      {
        id: 11,
        name: "Tech Professional",
        description: "Modern design tailored for technology and IT professionals",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: false
      },
      {
        id: 12,
        name: "Finance Executive",
        description: "Professional design for banking, finance, and consulting industries",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: true
      }
    ]
  },
  {
    id: "creative",
    name: "Creative",
    description: "Unique designs for artistic and innovative fields",
    templates: [
      {
        id: 4,
        name: "Minimalist Designer",
        description: "Clean layout with ample white space and focus on content",
        previewImage: "/placeholder.svg",
        isPremium: false,
        isFeatured: true
      },
      {
        id: 5,
        name: "Bold & Vibrant",
        description: "Colorful design with strong visual elements",
        previewImage: "/placeholder.svg",
        isPremium: true,
        isFeatured: false
      }
    ]
  },
  {
    id: "entry-level",
    name: "Entry Level",
    description: "Perfect for students and those starting their careers",
    templates: [
      {
        id: 6,
        name: "Fresh Graduate",
        description: "Focus on education and skills with clean layout",
        previewImage: "/placeholder.svg",
        isPremium: false,
        isFeatured: true
      },
      {
        id: 7,
        name: "Career Starter",
        description: "Balanced design highlighting potential and enthusiasm",
        previewImage: "/placeholder.svg",
        isPremium: false,
        isFeatured: false
      }
    ]
  }
];

// Skeleton component for loading states
const TemplateSkeleton = () => (
  <div className="bg-card border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden h-full flex flex-col animate-pulse">
    {/* Preview Image Skeleton */}
    <div className="relative overflow-hidden rounded-t-2xl h-56 bg-gray-200 dark:bg-gray-700"></div>
    
    {/* Template Info Skeleton */}
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-start">
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="mt-2 space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("professional");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add this state for mobile sidebar
  const itemsPerPage = 6; // Show 6 templates per page

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
    if (!user) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">?</span>
        </div>
      );
    }
    
    // Check if user has an avatar URL (trying multiple possible locations)
    // Handle cache-busted URLs by extracting the base URL
    let avatarUrl = user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture || 
                   user.identities?.[0]?.identity_data?.avatar_url;
    
    // If avatarUrl contains a cache-busting parameter, extract the base URL
    if (avatarUrl && avatarUrl.includes('?t=')) {
      avatarUrl = avatarUrl.split('?t=')[0];
    }
    
    if (avatarUrl) {
      return (
        <div className="relative w-8 h-8">
          <Image 
            src={avatarUrl} 
            alt="Profile" 
            fill
            className="rounded-full object-cover border-2 border-white/20"
            sizes="32px"
            priority
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const initialsContainer = e.currentTarget.nextSibling as HTMLElement;
              if (initialsContainer) initialsContainer.style.display = 'flex';
            }}
          />
          {/* Fallback initials that shows only if image fails to load */}
          <div className="hidden w-full h-full rounded-full bg-purple-600 items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
        </div>
      );
    }
    
    // Check for custom image avatar
    const customImageAvatar = user.user_metadata?.custom_image_avatar;
    if (customImageAvatar) {
      return (
        <div className="relative w-8 h-8">
          <Image 
            src={customImageAvatar} 
            alt="Profile" 
            fill
            className="rounded-full object-cover border-2 border-white/20"
            sizes="32px"
            priority
          />
        </div>
      );
    }
    
    // Fallback to initials if no avatar URL
    return (
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
        {getUserInitials()}
      </div>
    );
  };
  
  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user) return '?';
    
    // Try to get name from user_metadata or identity data
    const fullName = user.user_metadata?.full_name || 
                    user.user_metadata?.name ||
                    user.identities?.[0]?.identity_data?.name ||
                    '';
    
    const email = user.email || '';
    
    if (fullName) {
      const names = fullName.trim().split(/\s+/);
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    } 
    
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Get current templates based on selected category and pagination
  const getCurrentTemplates = () => {
    const currentCategory = templateCategories.find(cat => cat.id === selectedCategory);
    const templates = currentCategory?.templates || [];
    
    // Calculate pagination
    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return templates.slice(startIndex, endIndex);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen flex flex-col bg-background pb-20">
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
                {/* Hamburger menu button for mobile */}
                <button 
                  className="lg:hidden focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-6 w-6 text-white" />
                </button>
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
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Resume Templates</h1>
                <p className="text-white/80 mt-2">
                  Choose from our professionally designed templates to create your perfect resume
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button asChild className="bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full font-medium">
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Resume
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Sidebar Menu - Floats on mobile */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}>
              <div className="h-full lg:h-auto overflow-y-auto">
                <Sidebar currentPage="templates" onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
              {/* Category Filter using shadcn Tabs */}
              <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="mb-8">
                <TabsList className="grid w-full grid-cols-3 bg-muted rounded-full p-1 h-auto">
                  {templateCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Category Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {templateCategories.find(cat => cat.id === selectedCategory)?.name} Templates
                </h2>
                <p className="text-muted-foreground">
                  {templateCategories.find(cat => cat.id === selectedCategory)?.description}
                </p>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getCurrentTemplates().map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.07,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ 
                      y: -8,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                    className="h-full relative group"
                  >
                    {/* Premium Badge */}
                    {template.isPremium && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                          <span className="relative px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold rounded-full flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            PREMIUM
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Card className="bg-card border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col group-hover:border-purple-200 dark:group-hover:border-purple-900/50 relative">
                      {/* Preview Image */}
                      <div className="relative overflow-hidden rounded-t-2xl h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {template.previewImage ? (
                            <Image 
                              src={template.previewImage} 
                              alt={template.name}
                              width={400}
                              height={400}
                              className="object-contain transition-all duration-700 group-hover:scale-105 rounded-lg"
                              style={{
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                            </div>
                          )}
                        </div>
                        
                      </div>
                      
                      {/* Template Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {template.name}
                          </h3>
                          {template.isFeatured && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map((i) => (
                                <div 
                                  key={i}
                                  className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-2 border-white dark:border-gray-800"
                                  style={{ zIndex: 3 - i }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.floor(Math.random() * 100) + 1}K+ users
                            </span>
                          </div>
                          
                          <Button 
                            asChild
                            size="sm" 
                            className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                          >
                            <Link href={`/create?template=${template.id}`}>
                              {template.isPremium ? (
                                <span className="flex items-center">
                                  <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                                  Use Premium
                                </span>
                              ) : 'Use Free'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {(() => {
                const currentCategory = templateCategories.find(cat => cat.id === selectedCategory);
                const templates = currentCategory?.templates || [];
                const totalPages = Math.ceil(templates.length / itemsPerPage);
                
                if (totalPages <= 1) return null;
                
                return (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-full"
                      >
                        Previous
                      </Button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show first, last, current, and nearby pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`rounded-full ${currentPage === page ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                            >
                              {page}
                            </Button>
                          );
                        }
                        
                        // Show ellipsis for skipped pages
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 py-1 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-full"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Premium CTA Section */}
              <div className="mt-16">
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-3xl overflow-hidden shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Star className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Unlock All Premium Templates</h2>
                    <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                      Get access to all our premium templates and create a resume that truly stands out from the competition.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="bg-white text-purple-600 hover:bg-white/90 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base"
                      onClick={() => router.push('/settings')}
                    >
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Dock Component */}
        <div className="mt-auto">
          <DynamicDock currentPage="templates" showLogout={false} />
        </div>
        
        {/* Footer - now using the reusable component */}
        <DashboardFooter />
      </div>
    </ProtectedPage>
  );
}