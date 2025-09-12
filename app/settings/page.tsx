"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { DashboardFooter } from "@/components/dashboard-footer";
import { DynamicDock } from "@/components/dynamic-dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getUser, signOut, updateProfile, uploadProfileImage, updatePassword } from "@/lib/supabase";
import { toast } from 'react-toastify';
import { getPasswordStrength, PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { 
  User, 
  Shield, 
  Palette, 
  Bell, 
  LogOut, 
  Camera,
  Lock,
  Eye,
  EyeOff,
  X,
  Upload,
  LayoutDashboard,
  FileText,
  Settings,
  Menu
} from "lucide-react";

// Custom avatar images
const customAvatarImages = [
  { id: 'avatar1', src: '/avatar/uifaces-cartoon-avatar.jpg', name: 'Nova' },
  { id: 'avatar2', src: '/avatar/uifaces-cartoon-avatar(1).jpg', name: 'Axel' },
  { id: 'avatar3', src: '/avatar/uifaces-cartoon-avatar(2).jpg', name: 'Kai' },
  { id: 'avatar4', src: '/avatar/uifaces-cartoon-avatar(3).jpg', name: 'Quinn' },
  { id: 'avatar5', src: '/avatar/uifaces-cartoon-avatar(4).jpg', name: 'Leo' },
  { id: 'avatar6', src: '/avatar/uifaces-cartoon-avatar(5).jpg', name: 'Cora' },
  { id: 'avatar7', src: '/avatar/uifaces-cartoon-avatar(6).jpg', name: 'Morgan' },
  { id: 'avatar8', src: '/avatar/uifaces-cartoon-avatar(7).jpg', name: 'Jett' },
  { id: 'avatar9', src: '/avatar/uifaces-cartoon-avatar(8).jpg', name: 'Rory' },
  { id: 'avatar10', src: '/avatar/uifaces-cartoon-avatar(9).jpg', name: 'Lyra' },
  { id: 'avatar11', src: '/avatar/uifaces-cartoon-avatar(10).jpg', name: 'Juno' },
  { id: 'avatar12', src: '/avatar/uifaces-cartoon-avatar(11).jpg', name: 'Zara' },
  { id: 'avatar13', src: '/avatar/uifaces-cartoon-avatar(12).jpg', name: 'Anya' },
  { id: 'avatar14', src: '/avatar/uifaces-cartoon-avatar(13).jpg', name: 'Iris' },
  { id: 'avatar15', src: '/avatar/uifaces-cartoon-avatar(14).jpg', name: 'Eden' },
  { id: 'avatar16', src: '/avatar/uifaces-cartoon-avatar(15).jpg', name: 'Freya' },
  { id: 'avatar17', src: '/avatar/uifaces-cartoon-avatar(16).jpg', name: 'Kaia' },
  { id: 'avatar18', src: '/avatar/uifaces-cartoon-avatar(17).jpg', name: 'Blair' },
  { id: 'avatar19', src: '/avatar/uifaces-cartoon-avatar(18).jpg', name: 'Briar' },
  { id: 'avatar20', src: '/avatar/uifaces-cartoon-avatar(19).jpg', name: 'Cleo' },
  { id: 'avatar21', src: '/avatar/uifaces-cartoon-avatar(20).jpg', name: 'Orion' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showRemoveImageDialog, setShowRemoveImageDialog] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [selectedCustomAvatar, setSelectedCustomAvatar] = useState<string | null>(null);
  const [visibleAvatars, setVisibleAvatars] = useState(7); // Show 7 avatars initially
  const [loadingAvatars, setLoadingAvatars] = useState(false); // For skeleton loading
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add this state for mobile sidebar

  // Password change state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Record start time to ensure minimum loading duration
        const startTime = Date.now();
        
        const { user: userData, error } = await getUser();
        
        if (error) {
          console.error("Error fetching user:", error);
          toast.error("Error fetching user data. Please try again.");
        } else if (userData) {
          setFullName(userData.user_metadata?.full_name || "");
          setEmail(userData.email || "");
          setAvatarUrl(userData.user_metadata?.avatar_url || null);
          
          // Check if user has selected a custom image avatar
          const customImageAvatar = userData.user_metadata?.custom_image_avatar;
          if (customImageAvatar) {
            setSelectedCustomAvatar(customImageAvatar);
          } else {
            setSelectedCustomAvatar(null);
          }
        }
        
        // Ensure skeleton shows for at least 800ms for better UX
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800;
        
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Error fetching user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save settings.");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update user profile
      const updateData: { 
        full_name: string; 
        avatar_url?: string | null;
        custom_image_avatar?: string | null;
      } = {
        full_name: fullName,
      };
      
      // Include avatar_url only if it exists
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }
      
      // Include custom_image_avatar only if it exists
      if (selectedCustomAvatar) {
        updateData.custom_image_avatar = selectedCustomAvatar;
      }
      
      const { error } = await updateProfile(updateData);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile. Please try again.");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.");
      return;
    }
    
    setUploading(true);
    
    try {
      const { publicUrl, error } = await uploadProfileImage(file, user.id);
      
      if (error) {
        console.error("Error uploading profile image:", error);
        toast.error("Error uploading profile image. Please try again.");
      } else {
        // Add cache-busting parameter to force browser to load new image
        const cacheBustedUrl = publicUrl ? `${publicUrl}?t=${Date.now()}` : null;
        
        // Refresh user data to get the updated avatar URL
        const { user: updatedUser, error: fetchError } = await getUser();
        
        if (fetchError) {
          console.error("Error fetching updated user data:", fetchError);
          toast.error("Profile image uploaded but failed to refresh data.");
        } else if (updatedUser) {
          // Update the state with the fresh data from the server
          // Add cache-busting parameter to force browser to load new image
          const userAvatarUrl = updatedUser.user_metadata?.avatar_url;
          const cacheBustedUserUrl = userAvatarUrl ? `${userAvatarUrl}?t=${Date.now()}` : null;
          
          setAvatarUrl(cacheBustedUserUrl || cacheBustedUrl);
          // Clear custom avatar selection when uploading an image
          setSelectedCustomAvatar(null);
          toast.success("Profile image updated successfully!");
        } else {
          // Fallback to using the publicUrl we got from uploadProfileImage
          setAvatarUrl(cacheBustedUrl);
          // Clear custom avatar selection when uploading an image
          setSelectedCustomAvatar(null);
          toast.success("Profile image updated successfully!");
        }
      }
    } catch (err) {
      console.error("Error uploading profile image:", err);
      toast.error("Error uploading profile image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeProfileImage = async () => {
    if (!user) return;
    
    try {
      // Update user profile to remove avatar URL by setting it to null
      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: null, // This will remove the avatar URL from user metadata
        custom_image_avatar: null // Also remove custom image avatar selection
      });
      
      if (error) {
        console.error("Error removing profile image:", error);
        toast.error("Error removing profile image. Please try again.");
      } else {
        setAvatarUrl(null);
        setSelectedCustomAvatar(null);
        toast.success("Profile image removed successfully!");
      }
    } catch (err) {
      console.error("Error removing profile image:", err);
      toast.error("Error removing profile image. Please try again.");
    } finally {
      setShowRemoveImageDialog(false);
    }
  };

  // Handle selecting a custom image avatar
  const handleSelectCustomImageAvatar = async (avatarSrc: string) => {
    if (!user) return;
    
    try {
      // Update user profile with selected custom image avatar
      const { error } = await updateProfile({
        full_name: fullName,
        custom_image_avatar: avatarSrc,
        avatar_url: null // Remove any uploaded image
      });
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile. Please try again.");
      } else {
        setSelectedCustomAvatar(avatarSrc);
        setAvatarUrl(null); // Clear any uploaded image
        setShowAvatarSelection(false);
        toast.success("Avatar updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error updating profile. Please try again.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    
    const strength = getPasswordStrength(newPassword);
    if (strength.score < 3) {
      toast.error("Please choose a stronger password. Password should be at least fair strength.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Note: Supabase doesn't have a direct "change password" function that requires current password
      // We'll update the user's password directly
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error("Error changing password:", error);
        // Handle specific error messages
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Current password is incorrect.");
        } else {
          toast.error("Error changing password. Please try again.");
        }
      } else {
        toast.success("Password changed successfully!");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePasswordModal(false);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Error changing password. Please try again.");
    } finally {
      setChangingPassword(false);
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

  // Get the initials from user's name or email
  const getUserInitials = () => {
    if (!user) return "U";
    
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
    
    return initials.toUpperCase();
  };

  // Render the appropriate avatar based on user selection
  const renderAvatar = (isSidebar = false) => {
    // If user has uploaded an image, show it
    if (avatarUrl) {
      // Extract the base URL and cache-busting parameter
      const [baseUrl] = avatarUrl.split('?t=');
      return (
        <Image 
          src={baseUrl} 
          alt="Profile" 
          width={isSidebar ? 32 : 96}
          height={isSidebar ? 32 : 96}
          className={isSidebar ? "w-8 h-8 object-cover" : "w-full h-full object-cover"}
          priority
        />
      );
    }
    
    // If user has selected a custom image avatar, show it
    if (selectedCustomAvatar) {
      return (
        <Image 
          src={selectedCustomAvatar} 
          alt="Custom Avatar" 
          width={isSidebar ? 32 : 96}
          height={isSidebar ? 32 : 96}
          className={isSidebar ? "w-8 h-8 object-cover" : "w-full h-full object-cover"}
          priority
        />
      );
    }
    
    // Default to user initials
    return (
      <span className={isSidebar ? "text-white text-sm font-medium" : "text-white text-2xl font-bold"}>
        {getUserInitials()}
      </span>
    );
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Link href="/dashboard" className="font-bold text-2xl sm:text-3xl flex items-center">
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
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
                <p className="text-white/80 mt-2">
                  Manage your account preferences and profile
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Sidebar Menu - Floats on mobile */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}>
              <div className="h-full lg:h-auto overflow-y-auto">
                {loading ? (
                  // Sidebar Skeleton Loading
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden sticky top-8 h-full lg:h-auto">
                    <CardHeader>
                      <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                      </div>
                      {/* Exit button for mobile */}
                      <div className="lg:hidden">
                        <button 
                          onClick={() => setSidebarOpen(false)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Close sidebar"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
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
                  <Sidebar currentPage="settings" onClose={() => setSidebarOpen(false)} />
                )}
              </div>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            {/* Main Content - takes full width on mobile */}
            <div className="flex-1 lg:ml-0">
              {loading ? (
                // Skeleton Loading UI
                <div className="space-y-6">
                  {/* Profile Section Skeleton */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className="h-5 w-5 mr-2 rounded-full bg-purple-500/30 animate-pulse" />
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 animate-pulse" />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-6" />
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Section Skeleton */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className="h-5 w-5 mr-2 rounded-full bg-purple-500/30 animate-pulse" />
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </CardContent>
                  </Card>

                  {/* Preferences Section Skeleton */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className="h-5 w-5 mr-2 rounded-full bg-purple-500/30 animate-pulse" />
                        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Theme Section Skeleton */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className="h-5 w-5 mr-2 rounded-full bg-purple-500/30 animate-pulse" />
                        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Logout Section Skeleton */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="h-10 w-full bg-red-100 dark:bg-red-900/30 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-purple-500" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                            {renderAvatar()}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                            className="absolute -bottom-2 -right-2 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Choose avatar"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          {(avatarUrl || selectedCustomAvatar) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowRemoveImageDialog(true)}
                              className="absolute -bottom-2 -left-2 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              aria-label="Remove profile image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Avatar Selection Panel */}
                        {showAvatarSelection && (
                          <div className="mt-4 w-full">
                            <p className="text-sm text-muted-foreground mb-3 text-center">
                              Choose an avatar or upload your own image
                            </p>
                            
                            {/* Custom image avatars */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                              {/* Upload Image Option at the top */}
                              <Button
                                type="button"
                                variant="outline"
                                className="h-20 flex flex-col items-center justify-center rounded-xl"
                                onClick={triggerFileInput}
                              >
                                <Upload className="h-6 w-6" />
                                <span className="text-xs mt-1">Upload</span>
                              </Button>
                              
                              {loadingAvatars
                                ? // Skeleton loading for avatars
                                  Array.from({ length: visibleAvatars }).map((_, index) => (
                                    <div 
                                      key={index} 
                                      className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                                    />
                                  ))
                                : // Actual avatars
                                  customAvatarImages.slice(0, visibleAvatars).map((avatar) => (
                                    <Button
                                      key={avatar.id}
                                      type="button"
                                      variant={selectedCustomAvatar === avatar.src ? "default" : "outline"}
                                      className={`h-20 flex flex-col items-center justify-center rounded-xl p-1 ${
                                        selectedCustomAvatar === avatar.src 
                                          ? "ring-2 ring-purple-500" 
                                          : ""
                                      }`}
                                      onClick={() => handleSelectCustomImageAvatar(avatar.src)}
                                    >
                                      <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <Image 
                                          src={avatar.src} 
                                          alt={avatar.name} 
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="text-xs mt-1 truncate w-full px-1">{avatar.name}</span>
                                    </Button>
                                  ))
                              }
                            </div>
                            
                            {/* Load More Button */}
                            {visibleAvatars < customAvatarImages.length && !loadingAvatars && (
                              <div className="flex justify-center mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setLoadingAvatars(true);
                                    // Simulate loading delay for better UX
                                    setTimeout(() => {
                                      setVisibleAvatars(prev => Math.min(prev + 7, customAvatarImages.length));
                                      setLoadingAvatars(false);
                                    }, 300);
                                  }}
                                >
                                  Load More
                                </Button>
                              </div>
                            )}
                            
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                          {avatarUrl || selectedCustomAvatar
                            ? "Click the camera icon to change your avatar or upload an image"
                            : "Click the camera icon to choose an avatar or upload an image"}
                        </p>
                        {uploading && (
                          <p className="text-sm text-purple-600 mt-2">Uploading...</p>
                        )}
                      </div>
                      
                      <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            disabled={loading || saving}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={true} // Email cannot be changed directly
                          />
                          <p className="text-sm text-muted-foreground">
                            Email cannot be changed. Contact support if you need to update your email address.
                          </p>
                        </div>
                        
                        <Button type="submit" disabled={loading || saving} className="w-full">
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Column Layout for Security, Preferences, and Appearance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Security and Appearance Section */}
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-purple-500" />
                          Security
                        </CardTitle>
                        <CardDescription>
                          Manage your password and security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button 
                            onClick={() => setShowChangePasswordModal(true)}
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </div>
                      </CardContent>
                      <div className="border-t border-border mx-6"></div>
                      <CardContent>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center text-base font-medium">
                              <Palette className="h-4 w-4 mr-2 text-purple-500" />
                              Appearance
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Customize the look and feel of the application
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-sm">Theme</span>
                              <ThemeToggle />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preferences Section */}
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2 text-purple-500" />
                          Preferences
                        </CardTitle>
                        <CardDescription>
                          Customize your notification and communication preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about your resumes and account activity
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span>Enable Notifications</span>
                              <Switch
                                id="notifications"
                                checked={notifications}
                                onCheckedChange={setNotifications}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails about new features and product updates
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span>Enable Marketing Emails</span>
                              <Switch
                                id="marketing-emails"
                                checked={marketingEmails}
                                onCheckedChange={setMarketingEmails}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Logout Section */}
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardContent className="pt-6">
                      <Button 
                        onClick={handleLogout}
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
          
          {/* Remove Image Confirmation Dialog */}
          {showRemoveImageDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md bg-card border-0 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <X className="h-5 w-5 mr-2 text-red-500" />
                    Remove Profile Image
                  </CardTitle>
                  <CardDescription>
                    Are you sure you want to remove your profile image?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    This will remove your current profile image and revert to showing your initials.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRemoveImageDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={removeProfileImage}
                      className="flex-1"
                    >
                      Remove Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md bg-card border-0 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-purple-500" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Enter your current password and a new password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <PasswordStrengthMeter password={newPassword} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowChangePasswordModal(false)}
                        className="flex-1"
                        disabled={changingPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Dynamic Dock Component */}
        <div className="mt-auto">
          <DynamicDock currentPage="settings" showLogout={false} />
        </div>
        
        {/* Footer - now using the reusable component */}
        <DashboardFooter />
      </div>
    </ProtectedPage>
  );
}