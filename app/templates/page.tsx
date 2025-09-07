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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Star,
  Settings,
  LogOut,
  Plus,
  LayoutTemplate
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

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("professional");

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
    
    // Check if user has an avatar URL
    const avatarUrl = user.user_metadata?.avatar_url;
    if (avatarUrl) {
      return (
        <Image 
          src={avatarUrl} 
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
      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
        {initials.toUpperCase()}
      </div>
    );
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {templateCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    : "border-input text-foreground hover:bg-accent"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templateCategories
              .find((category) => category.id === selectedCategory)
              ?.templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative">
                      {template.previewImage ? (
                        <div className="w-full h-64 bg-gray-200 rounded-t-2xl overflow-hidden">
                          <Image 
                            src={template.previewImage} 
                            alt={template.name}
                            width={400}
                            height={256}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-t-2xl w-full h-64" />
                      )}
                      {template.isFeatured && (
                        <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900 rounded-full">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                      {template.isPremium && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <CardDescription className="text-muted-foreground mt-1">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button 
                        className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => router.push(`/create?template=${template.id}`)}
                      >
                        <LayoutTemplate className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* Premium CTA Section */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Unlock All Premium Templates</h2>
                <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                  Get access to all our premium templates and create a resume that truly stands out from the competition.
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-purple-600 hover:bg-white/90 rounded-full font-medium"
                  onClick={() => router.push('/settings')}
                >
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}