"use client";

import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/components/auth-provider";
import { getUser, signOut, updateProfile, uploadProfileImage, updatePassword } from "@/lib/supabase";
import { toast } from 'react-toastify';
import { getPasswordStrength, PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Shield, 
  Bell, 
  LogOut, 
  Camera,
  Lock,
  Eye,
  EyeOff,
  X,
  Upload,
  Menu,
  Settings
} from "lucide-react";

// Custom avatar images
const customAvatarImages = [
  { id: 'avatar1', src: '/avatar/uifaces-cartoon-avatar.jpg', name: 'Nova' },
  { id: 'avatar2', src: '/avatar/uifaces-cartoon-avatar(1).jpg', name: 'Axel' },
  { id: 'avatar3', src: '/avatar/uifaces-cartoon-avatar(2).jpg', name: 'Kai' },
  { id: 'avatar4', src: '/avatar/uifaces-cartoon-avatar(3).jpg', name: 'Quinn' },
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
  const [selectedCustomAvatar, setSelectedCustomAvatar] = useState<string | null>(null);
  const [showRemoveImageDialog, setShowRemoveImageDialog] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar collapsed state from localStorage on component mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }
    
    // Load sidebar open state from localStorage on component mount (for mobile)
    const savedOpenState = localStorage.getItem('sidebarOpen');
    if (savedOpenState !== null) {
      setSidebarOpen(JSON.parse(savedOpenState));
    }
  }, []);

  // Save sidebar collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Save sidebar open state to localStorage whenever it changes (for mobile)
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const startTime = Date.now();
        
        const { user: userData, error } = await getUser();
        
        if (error) {
          console.error("Error fetching user:", error);
          toast.error("Error fetching user data. Please try again.");
        } else if (userData) {
          setFullName(userData.user_metadata?.full_name || "");
          setEmail(userData.email || "");
          setAvatarUrl(userData.user_metadata?.avatar_url || null);
          
          const customImageAvatar = userData.user_metadata?.custom_image_avatar;
          if (customImageAvatar) {
            setSelectedCustomAvatar(customImageAvatar);
          } else {
            setSelectedCustomAvatar(null);
          }
        }
        
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
      const updateData: { 
        full_name: string; 
        avatar_url?: string | null;
        custom_image_avatar?: string | null;
      } = {
        full_name: fullName,
      };
      
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }
      
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
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }
    
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
        const cacheBustedUrl = publicUrl ? `${publicUrl}?t=${Date.now()}` : null;
        
        const { user: updatedUser, error: fetchError } = await getUser();
        
        if (fetchError) {
          console.error("Error fetching updated user data:", fetchError);
          toast.error("Profile image uploaded but failed to refresh data.");
        } else if (updatedUser) {
          const userAvatarUrl = updatedUser.user_metadata?.avatar_url;
          const cacheBustedUserUrl = userAvatarUrl ? `${userAvatarUrl}?t=${Date.now()}` : null;
          
          setAvatarUrl(cacheBustedUserUrl || cacheBustedUrl);
          setSelectedCustomAvatar(null);
          toast.success("Profile image updated successfully!");
        } else {
          setAvatarUrl(cacheBustedUrl);
          setSelectedCustomAvatar(null);
          toast.success("Profile image updated successfully!");
        }
      }
    } catch (err) {
      console.error("Error uploading profile image:", err);
      toast.error("Error uploading profile image. Please try again.");
    } finally {
      setUploading(false);
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
      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: null,
        custom_image_avatar: null
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

  const handleSelectCustomImageAvatar = async (avatarSrc: string) => {
    if (!user) return;
    
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        custom_image_avatar: avatarSrc,
        avatar_url: null
      });
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile. Please try again.");
      } else {
        setSelectedCustomAvatar(avatarSrc);
        setAvatarUrl(null);
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
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error("Error changing password:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Current password is incorrect.");
        } else {
          toast.error("Error changing password. Please try again.");
        }
      } else {
        toast.success("Password changed successfully!");
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

  const renderAvatar = () => {
    if (avatarUrl) {
      const [baseUrl] = avatarUrl.split('?t=');
      return (
        <Image 
          src={baseUrl} 
          alt="Profile" 
          width={96}
          height={96}
          className="w-full h-full object-cover"
          priority
        />
      );
    }
    
    if (selectedCustomAvatar) {
      return (
        <Image 
          src={selectedCustomAvatar} 
          alt="Custom Avatar" 
          width={96}
          height={96}
          className="w-full h-full object-cover"
          priority
        />
      );
    }
    
    return (
      <span className="text-white text-2xl font-bold">
        {getUserInitials()}
      </span>
    );
  };

  return (
    <ProtectedPage>
      <div className="h-screen flex bg-background">
        {/* Sidebar - Full Height */}
        <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-80'} bg-background transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0 lg:h-screen`}>
          <div className="h-full overflow-y-auto">
            {loading ? (
              <Card className="bg-card border-0 rounded-2xl overflow-hidden h-full">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                  </div>
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
              <div className="h-full">
                <Sidebar currentPage="settings" onClose={() => setSidebarOpen(false)} isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
              </div>
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

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'}`}>
          {/* Header with gradient */}
          <div className="bg-[#F4F7FA] dark:bg-[#0C111D]">
            <div className="px-4 sm:px-6 lg:px-8 py-1">
              <div className="flex items-center justify-end w-full">
                <div className="lg:hidden absolute left-4 sm:left-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resumify</h1>
                </div>
                <div className="hidden lg:block absolute" 
                  style={{ 
                    left: sidebarCollapsed ? 'calc(4rem + 1rem)' : 'calc(20rem + 1rem)'
                  }}>
                  {/* Desktop view - show logo when sidebar is collapsed (sidebar logo is hidden) */}
                  {/* Hide logo when sidebar is expanded (sidebar logo is visible) */}
                  {sidebarCollapsed ? (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white ps-4">Resumify</h1>
                  ) : null}
                </div>
                <div className="flex items-center space-x-3">
                  {/* Hamburger menu button for mobile */}
                  <button 
                    className="lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-500/50 rounded-full p-1"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
                  </button>
                  <ThemeToggle className="bg-gray-200 border-gray-300 hover:bg-gray-300" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus:ring-2 focus:ring-gray-500/50 rounded-full p-1">
                        {getUserAvatar()}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-4 mt-2" align="end" forceMount>
                      <div className="flex items-center px-2 py-2">
                        <div className="mr-2">
                          {getUserAvatar()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium dark:text-white">
                            {user?.user_metadata?.full_name || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-gray-300">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer dark:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 dark:text-red-400">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white sm:mt-0 mt-4">Settings</h1>
                  <p className="text-gray-900/80 mt-1 dark:text-gray-300">
                    Manage your account preferences and profile
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
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
                        className="absolute -bottom-2 -right-2 rounded-full bg-white dark:bg-[#0C111D] border-2 border-white dark:border-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                          className="absolute -bottom-2 -left-2 rounded-full bg-white dark:bg-[#0C111D] border-2 border-white dark:border-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label="Remove profile image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {showAvatarSelection && (
                      <div className="mt-4 w-full">
                        <p className="text-sm text-muted-foreground mb-3 text-center">
                          Choose an avatar or upload your own image
                        </p>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center rounded-xl"
                            onClick={triggerFileInput}
                          >
                            <Upload className="h-6 w-6" />
                            <span className="text-xs mt-1">Upload</span>
                          </Button>
                          
                          {customAvatarImages.map((avatar) => (
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
                          ))}
                        </div>
                        
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
                        disabled={true}
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

              {/* Security and Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <Button 
                      onClick={() => setShowChangePasswordModal(true)}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-purple-500" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Enable Notifications</span>
                        <Switch
                          id="notifications"
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Marketing Emails</span>
                        <Switch
                          id="marketing-emails"
                          checked={marketingEmails}
                          onCheckedChange={setMarketingEmails}
                        />
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
          </div>
          
          {/* Dynamic Dock Component */}
          <div className="mt-auto px-4 sm:px-6 lg:px-8">
            <DynamicDock currentPage="settings" showLogout={false} />
          </div>
          
          {/* Footer - now using the reusable component */}
          <DashboardFooter />
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
    </ProtectedPage>
  );
}