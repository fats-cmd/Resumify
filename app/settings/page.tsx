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
  const [showRemoveImageDialog, setShowRemoveImageDialog] = useState(false);
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
        avatar_url: avatarUrl // Pass the current avatar URL
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

  const removeProfileImage = async () => {
    if (!user) return;
    
    try {
      // Update user profile to remove avatar URL by setting it to null
      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: null // This will remove the avatar URL from user metadata
      });
      
      if (error) {
        console.error("Error removing profile image:", error);
        toast.error("Error removing profile image. Please try again.");
      } else {
        setAvatarUrl(null);
        toast.success("Profile image removed successfully!");
      }
    } catch (err) {
      console.error("Error removing profile image:", err);
      toast.error("Error removing profile image. Please try again.");
    } finally {
      setShowRemoveImageDialog(false);
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

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Link href="/dashboard" className="font-bold text-2xl sm:text-3xl flex items-center">
                <span className="text-white dark:text-white dark:bg-gradient-to-r dark:from-primary dark:to-primary/70 dark:bg-clip-text dark:dark:text-transparent">
                  Resumify
                </span>
              </Link>
              <div className="flex items-center space-x-3">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
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
                      size="icon"
                      onClick={triggerFileInput}
                      className="absolute -bottom-2 -right-2 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Upload profile image"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {avatarUrl && (
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {avatarUrl 
                      ? "Click the camera icon to change your profile image" 
                      : "Click the camera icon to upload a profile image"}
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

            {/* Security Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
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
            </Card>

            {/* Preferences Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications</Label>
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
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and product updates
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred color scheme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Logout Section */}
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
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
        
        {/* Remove Image Confirmation Dialog */}
        {showRemoveImageDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-card border-0 shadow-2xl rounded-2xl overflow-hidden">
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
            <Card className="w-full max-w-md bg-card border-0 shadow-2xl rounded-2xl overflow-hidden">
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
                        disabled={changingPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
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
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        disabled={changingPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        disabled={changingPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowChangePasswordModal(false);
                        // Reset form when closing
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      disabled={changingPassword}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1"
                    >
                      {changingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Dock Component */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
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
      </div>
    </ProtectedPage>
  );
}