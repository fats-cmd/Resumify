"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dock, DockItem } from "@/components/ui/dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getUser, signOut, updateProfile, uploadProfileImage, updatePassword } from "@/lib/supabase";
import { toast } from 'react-toastify';
import { getPasswordStrength, PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette,
  ArrowLeft,
  LayoutDashboard, 
  LogOut,
  Home,
  Plus,
  Settings,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Lock,
  X
} from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const { user: userData, error } = await getUser();
        
        if (error) {
          console.error("Error fetching user:", error);
          toast.error("Error fetching user data. Please try again.");
        } else if (userData) {
          setFullName(userData.user_metadata?.full_name || "");
          setEmail(userData.email || "");
          setAvatarUrl(userData.user_metadata?.avatar_url || null);
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
      const { error } = await updateProfile({
        full_name: fullName,
      });
      
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
        setAvatarUrl(publicUrl);
        toast.success("Profile image updated successfully!");
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
      // For security, users should sign out and use the "Forgot Password" flow
      // However, we can update the password directly if we have the current session
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error("Error changing password:", error);
        toast.error("Error changing password. Please try again.");
      } else {
        toast.success("Password changed successfully!");
        // Close modal and reset form
        setShowChangePasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

  if (loading) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between w-full mb-8">
                <div className="h-8 w-32 bg-white/30 rounded animate-pulse"></div>
                <div className="h-7 w-14 bg-white/30 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-white/30 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-40 bg-white/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
            <div className="space-y-6">
              {/* Profile Section Skeleton */}
              <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>

              {/* Preferences Section Skeleton */}
              <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Link href="/dashboard" className="font-bold text-2xl sm:text-3xl flex items-center text-white">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
              <ThemeToggle className="bg-white/20 border-white/30 hover:bg-white/30" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
                <p className="text-white/80 mt-2">
                  Manage your account preferences and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 pb-32">
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
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
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full p-2 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 shadow-md"
                      onClick={triggerFileInput}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the camera icon to upload a new profile image
                  </p>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed at this time
                    </p>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-indigo-500" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your Resumify experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your resumes and account activity
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive occasional product updates and marketing emails
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-full"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    Change Password
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangePasswordModal(false)}
                className="rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={changingPassword}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Dock Component */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <Dock>
          <DockItem title="Home" onClick={() => router.push("/")}>  
            <Home className="h-6 w-6 text-foreground" />
          </DockItem>
          <DockItem title="Dashboard" onClick={() => router.push("/dashboard")}>
            <LayoutDashboard className="h-6 w-6 text-foreground" />
          </DockItem>
          <DockItem title="Create Resume" onClick={() => router.push("/create")}>
            <Plus className="h-6 w-6 text-foreground" />
          </DockItem>
          <DockItem title="Settings" onClick={() => router.push("/settings")}>
            <Settings className="h-6 w-6 text-foreground" />
          </DockItem>
          <DockItem title="Logout" onClick={() => handleLogout()}>
            <LogOut className="h-6 w-6 text-foreground" />
          </DockItem>
        </Dock>
      </div>
    </ProtectedPage>
  );
}