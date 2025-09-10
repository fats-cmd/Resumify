"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dock, DockItem } from "@/components/ui/dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getResumes, updateResume, signOut } from "@/lib/supabase";
import { Resume, ResumeData } from "../../../types/resume";
import { toast } from 'react-toastify';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin,
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  LayoutDashboard, 
  LogOut,
  Home,
  Settings,
  Sparkles
} from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  
  // State for form data
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: ""
    },
    workExperience: [
      {
        id: 1,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false
      }
    ],
    education: [
      {
        id: 1,
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: ""
      }
    ],
    skills: [""]
  });
  
  // State for AI generation loading
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState<{[key: number]: boolean}>({});
  const [isGeneratingEducation, setIsGeneratingEducation] = useState<{[key: number]: boolean}>({});
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
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
          console.error("Error fetching resume:", error);
          // Provide more detailed error information
          if (error.message) {
            console.error("Error message:", error.message);
          }
          if (error.name) {
            console.error("Error name:", error.name);
          }
          if (error.stack) {
            console.error("Error stack:", error.stack);
          }
          toast.error("Failed to load resume. Please try again later.");
          router.push("/dashboard");
        } else {
          const resume = data?.find((r: Resume) => r.id === parseInt(unwrappedParams.id));
          if (resume) {
            setResumeData(resume.data as ResumeData);
            // Set image preview if resume has an image
            if (resume.data.basics?.image) {
              setImagePreview(resume.data.basics.image);
            }
          } else {
            toast.error("Resume not found.");
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        // Provide more detailed error information for caught exceptions
        if (err instanceof Error) {
          console.error("Caught error details:", {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        }
        toast.error("Failed to load resume. Please try again later.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResume();
    }
  }, [user, unwrappedParams.id, router]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image upload triggered"); // Debug log
    const file = e.target.files?.[0];
    console.log("File selected:", file); // Debug log
    if (!file) {
      console.log("No file selected"); // Debug log
      return;
    }

    setIsUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File read completed"); // Debug log
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // In a real implementation, you would upload to Supabase storage here
      // For now, we'll just use the preview URL
      // You can implement the actual upload using the existing uploadProfileImage function
      console.log("File selected for upload:", file.name);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Debug effect to log image preview changes
  useEffect(() => {
    console.log("Image preview updated:", imagePreview);
  }, [imagePreview]);

  // Handle input changes for personal info
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = 'target' in e ? e.target : e;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...(resumeData.personalInfo || {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          location: "",
          headline: "",
          summary: ""
        }),
        [name]: value
      }
    });
  };

  // Handle work experience changes
  const handleWorkExperienceChange = (id: number, field: string, value: string | boolean) => {
    setResumeData({
      ...resumeData,
      workExperience: (resumeData.workExperience || []).map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  // Add new work experience
  const addWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...(resumeData.workExperience || []),
        {
          id: Date.now(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false
        }
      ]
    });
  };

  // Remove work experience
  const removeWorkExperience = (id: number) => {
    const currentWorkExperience = resumeData.workExperience || [];
    if (currentWorkExperience.length > 1) {
      setResumeData({
        ...resumeData,
        workExperience: currentWorkExperience.filter(exp => exp.id !== id)
      });
    }
  };

  // Handle education changes
  const handleEducationChange = (id: number, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      education: (resumeData.education || []).map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  // Add new education
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...(resumeData.education || []),
        {
          id: Date.now(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    });
  };

  // Remove education
  const removeEducation = (id: number) => {
    const currentEducation = resumeData.education || [];
    if (currentEducation.length > 1) {
      setResumeData({
        ...resumeData,
        education: currentEducation.filter(edu => edu.id !== id)
      });
    }
  };

  // Handle skills changes
  const handleSkillsChange = (index: number, value: string) => {
    const currentSkills = resumeData.skills || [""];
    const newSkills = [...currentSkills];
    newSkills[index] = value;
    setResumeData({
      ...resumeData,
      skills: newSkills
    });
  };

  // Add new skill
  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...(resumeData.skills || []), ""]
    });
  };

  // Remove skill
  const removeSkill = (index: number) => {
    const currentSkills = resumeData.skills || [""];
    if (currentSkills.length > 1) {
      const newSkills = [...currentSkills];
      newSkills.splice(index, 1);
      setResumeData({
        ...resumeData,
        skills: newSkills
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save a resume.");
      return;
    }
    
    setSaving(true);
    
    try {
      // Add image to resume data if available
      const resumeDataWithImage = {
        ...resumeData,
        basics: {
          ...(resumeData.basics || {}),
          name: `${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName}`.trim(),
          label: resumeData.personalInfo?.headline || "",
          email: resumeData.personalInfo?.email || "",
          phone: resumeData.personalInfo?.phone || "",
          summary: resumeData.personalInfo?.summary || "",
          location: resumeData.personalInfo?.location ? {
            address: resumeData.personalInfo.location,
          } : undefined,
          image: imagePreview || undefined
        }
      };
      
      // Update the resume data in Supabase
      const { data, error } = await updateResume(parseInt(unwrappedParams.id), resumeDataWithImage);
      
      if (error) {
        console.error("Error updating resume:", error);
        toast.error("Error updating resume. Please try again.");
      } else {
        console.log("Resume updated successfully:", data);
        toast.success("Resume updated successfully!");
        // Add a small delay before redirecting so user can see the toast
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating resume:", err);
      toast.error("Error updating resume. Please try again.");
    } finally {
      setSaving(false);
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

  // AI Helper Functions
  const generateSummaryWithAI = async () => {
    console.log("Generating summary with AI..."); // Debug log
    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateSummary",
          data: {
            personalInfo: resumeData.personalInfo
          }
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.result) {
        // Check if the result is an error message
        if (typeof result.result === 'string' && result.result.startsWith('Error:')) {
          toast.error(result.result);
          return;
        }
        
        // Clean up the result to remove any introductory phrases
        let cleanedResult = result.result;
        
        // Remove common introductory phrases
        cleanedResult = cleanedResult.replace(/^Here's a professional resume summary for.*?:\s*/i, '');
        cleanedResult = cleanedResult.replace(/^Here is a professional.*?:\s*/i, '');
        cleanedResult = cleanedResult.replace(/^Professional summary for.*?:\s*/i, '');
        cleanedResult = cleanedResult.replace(/^Summary:\s*/i, '');
        
        // Sanitize the result to ensure it's proper HTML for the rich text editor
        let sanitizedResult = cleanedResult;
        if (typeof sanitizedResult === 'string' && !sanitizedResult.includes('<')) {
          // If it's plain text, convert line breaks to HTML
          sanitizedResult = sanitizedResult.replace(/\n/g, '<br />');
        }
        
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...(resumeData.personalInfo || {
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              location: "",
              headline: "",
              summary: ""
            }),
            summary: sanitizedResult
          }
        });
        toast.success("Professional summary generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Error generating summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generateExperienceWithAI = async (id: number) => {
    console.log("Generating experience with AI for ID:", id); // Debug log
    setIsGeneratingExperience(prevState => ({
      ...prevState,
      [id]: true
    }));
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateExperience",
          data: {
            workExperience: resumeData.workExperience
          }
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.result) {
        // Check if the result is an error message
        if (Array.isArray(result.result) && result.result.length > 0 && 
            typeof result.result[0] === 'string' && result.result[0].startsWith('Error:')) {
          toast.error(result.result[0]);
          return;
        }
        
        const experience = (resumeData.workExperience || []).find(exp => exp.id === id);
        if (experience) {
          handleWorkExperienceChange(id, "description", result.result[0]);
          toast.success("Work experience description enhanced successfully!");
        }
      } else {
        toast.error(result.error || "Failed to enhance work experience. Please try again.");
      }
    } catch (error) {
      console.error("Error enhancing work experience:", error);
      toast.error("Error enhancing work experience. Please try again.");
    } finally {
      setIsGeneratingExperience(prevState => ({
        ...prevState,
        [id]: false
      }));
    }
  };

  const generateEducationWithAI = async (id: number) => {
    console.log("Generating education with AI for ID:", id); // Debug log
    setIsGeneratingEducation(prevState => ({
      ...prevState,
      [id]: true
    }));
    try {
      // Find the index of the education entry being enhanced
      const educationIndex = (resumeData.education || []).findIndex(edu => edu.id === id);
      if (educationIndex === -1) {
        toast.error("Education entry not found. Please try again.");
        setIsGeneratingEducation(prevState => ({
          ...prevState,
          [id]: false
        }));
        return;
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateEducation",
          data: {
            education: resumeData.education
          }
        }),
      });
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        toast.error("Error enhancing education description. Please try again.");
        console.error("Non-JSON response received:", await response.text());
        setIsGeneratingEducation(prevState => ({
          ...prevState,
          [id]: false
        }));
        return;
      }
      
      const result = await response.json();
      
      if (response.ok && result.result) {
        // Check if the result is an error message
        if (Array.isArray(result.result) && result.result.length > 0 && 
            typeof result.result[0] === 'string' && result.result[0].startsWith('Error:')) {
          toast.error(result.result[0]);
          return;
        }
        
        // Make sure we have a result for the specific education entry
        if (Array.isArray(result.result) && result.result.length > educationIndex) {
          handleEducationChange(id, "description", result.result[educationIndex]);
          toast.success("Education description generated successfully!");
        } else {
          toast.error("Failed to generate education description. Please try again.");
        }
      } else {
        toast.error(result.error || "Failed to enhance education description. Please try again.");
      }
    } catch (error) {
      console.error("Error enhancing education description:", error);
      toast.error("Error enhancing education description. Please try again.");
    } finally {
      setIsGeneratingEducation(prevState => ({
        ...prevState,
        [id]: false
      }));
    }
  };

  const generateSkillsWithAI = async () => {
    console.log("Generating skills with AI..."); // Debug log
    setIsGeneratingSkills(true);
    try {
      // Check if work experience or education data exists
      const hasWorkExperience = (resumeData.workExperience || []).some(exp => exp.company || exp.position);
      const hasEducation = (resumeData.education || []).some(edu => edu.institution || edu.degree);
      
      if (!hasWorkExperience && !hasEducation) {
        toast.error("Please add your work experience and education details first.");
        setIsGeneratingSkills(false);
        return;
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateSkills",
          data: {
            workExperience: resumeData.workExperience,
            education: resumeData.education
          }
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.result) {
        // Check if the result is an error message (both string and array formats)
        if (typeof result.result === 'string' && result.result.startsWith('Error:')) {
          toast.error(result.result);
          return;
        }
        
        if (Array.isArray(result.result) && result.result.length > 0 && 
            typeof result.result[0] === 'string' && result.result[0].startsWith('Error:')) {
          toast.error(result.result[0]);
          return;
        }
        
        // Post-process the skills to remove any introductory text
        let skills = Array.isArray(result.result) ? result.result : [result.result];
        
        // If we have a single string that contains commas, split it properly
        if (skills.length === 1 && typeof skills[0] === 'string' && skills[0].includes(',')) {
          skills = skills[0].split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        }
        
        // Clean up each skill to remove any remaining introductory text or markdown
        skills = skills.map(skill => {
          if (typeof skill === 'string') {
            // Remove common introductory phrases
            return skill
              .replace(/^Here are.*?:\s*/i, '')
              .replace(/^Skills?:\s*/i, '')
              .replace(/^\d+\.\s*/, '') // Remove numbered lists
              .replace(/^\*\s*/, '') // Remove bullet points
              .replace(/^\-\s*/, '') // Remove dash bullet points
              .trim();
          }
          return skill;
        }).filter(skill => typeof skill === 'string' && skill.length > 0);
        
        setResumeData({
          ...resumeData,
          skills: skills
        });
        toast.success("Skills suggestions generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate skills. Please try again.");
      }
    } catch (error) {
      console.error("Error generating skills:", error);
      toast.error("Error generating skills. Please try again.");
    } finally {
      setIsGeneratingSkills(false);
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation Skeleton */}
              <div className="lg:col-span-1">
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8 animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-border space-y-3">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Skeleton */}
              <div className="lg:col-span-3">
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-4 w-332 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
              <ThemeToggle className="bg-white/20 border-white/30 hover:bg-white/20" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Edit Resume</h1>
                <p className="text-white/80 mt-2">
                  Update your professional resume
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button 
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/20 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Resume Sections</CardTitle>
                  <CardDescription>
                    Edit all sections of your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <Button
                      variant={activeSection === "personal" ? "default" : "ghost"}
                      className="w-full justify-start rounded-full"
                      onClick={() => setActiveSection("personal")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Personal Info
                    </Button>
                    <Button
                      variant={activeSection === "work" ? "default" : "ghost"}
                      className="w-full justify-start rounded-full"
                      onClick={() => setActiveSection("work")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Work Experience
                    </Button>
                    <Button
                      variant={activeSection === "education" ? "default" : "ghost"}
                      className="w-full justify-start rounded-full"
                      onClick={() => setActiveSection("education")}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Education
                    </Button>
                    <Button
                      variant={activeSection === "skills" ? "default" : "ghost"}
                      className="w-full justify-start rounded-full"
                      onClick={() => setActiveSection("skills")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Skills
                    </Button>
                  </nav>
                  
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex flex-col gap-3">
                      <Button 
                        className="w-full rounded-full" 
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Resume
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-full"
                        asChild
                      >
                        <Link href={`/resume/${unwrappedParams.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                {activeSection === "personal" && (
                  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-purple-500" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Image Upload Section */}
                      <div className="space-y-2 border border-dashed border-gray-300 p-4 rounded-lg">
                        <Label htmlFor="image-upload">Profile Image</Label>
                        <div className="flex items-center space-x-4">
                          {/* Image Preview */}
                          {imagePreview ? (
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 overflow-hidden">
                                <Image 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                aria-label="Remove image"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          
                          {/* Upload Button */}
                          <div>
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                {isUploading ? "Uploading..." : "Upload Image"}
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, or GIF (max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={resumeData.personalInfo?.firstName || ""}
                            onChange={handlePersonalInfoChange}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={resumeData.personalInfo?.lastName || ""}
                            onChange={handlePersonalInfoChange}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="headline">Professional Headline</Label>
                        <Input
                          id="headline"
                          name="headline"
                          value={resumeData.personalInfo?.headline || ""}
                          onChange={handlePersonalInfoChange}
                          placeholder="Software Engineer, Product Manager, etc."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              value={resumeData.personalInfo?.email || ""}
                              onChange={handlePersonalInfoChange}
                              placeholder="john.doe@example.com"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              name="phone"
                              value={resumeData.personalInfo?.phone || ""}
                              onChange={handlePersonalInfoChange}
                              placeholder="(123) 456-7890"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            name="location"
                            value={resumeData.personalInfo?.location || ""}
                            onChange={handlePersonalInfoChange}
                            placeholder="City, Country"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateSummaryWithAI}
                            disabled={isGeneratingSummary}
                            className="rounded-full text-xs"
                          >
                            {isGeneratingSummary ? (
                              <>
                                <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        </div>
                        <RichTextEditor
                          value={resumeData.personalInfo?.summary || ""}
                          onChange={(value) => handlePersonalInfoChange({
                            target: { name: "summary", value }
                          } as React.ChangeEvent<HTMLTextAreaElement>)}
                          placeholder="Write a brief summary of your professional background, skills, and career goals..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Work Experience Section */}
                {activeSection === "work" && (
                  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                        Work Experience
                      </CardTitle>
                      <CardDescription>
                        Update your professional experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(resumeData.workExperience || []).map((exp, index) => (
                        <div key={exp.id} className="space-y-4 p-4 border border-border rounded-xl">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Experience #{index + 1}</h3>
                            {(resumeData.workExperience || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeWorkExperience(exp.id)}
                                className="rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`company-${exp.id}`}>Company</Label>
                              <Input
                                id={`company-${exp.id}`}
                                value={exp.company}
                                onChange={(e) => handleWorkExperienceChange(exp.id, "company", e.target.value)}
                                placeholder="Company Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`position-${exp.id}`}>Position</Label>
                              <Input
                                id={`position-${exp.id}`}
                                value={exp.position}
                                onChange={(e) => handleWorkExperienceChange(exp.id, "position", e.target.value)}
                                placeholder="Job Title"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                              <Input
                                id={`startDate-${exp.id}`}
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => handleWorkExperienceChange(exp.id, "startDate", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                              <Input
                                id={`endDate-${exp.id}`}
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => handleWorkExperienceChange(exp.id, "endDate", e.target.value)}
                                disabled={exp.current}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${exp.id}`}
                              checked={exp.current}
                              onChange={(e) => handleWorkExperienceChange(exp.id, "current", e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`current-${exp.id}`}>I currently work here</Label>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`description-${exp.id}`}>Description</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => generateExperienceWithAI(exp.id)}
                                disabled={isGeneratingExperience[exp.id]}
                                className="rounded-full text-xs"
                              >
                                {isGeneratingExperience[exp.id] ? (
                                  <>
                                    <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Enhance with AI
                                  </>
                                )}
                              </Button>
                            </div>
                            <RichTextEditor
                              value={exp.description}
                              onChange={(value) => handleWorkExperienceChange(exp.id, "description", value)}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={addWorkExperience}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Experience
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Education Section */}
                {activeSection === "education" && (
                  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                        Education
                      </CardTitle>
                      <CardDescription>
                        Update your educational background
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(resumeData.education || []).map((edu, index) => (
                        <div key={edu.id} className="space-y-4 p-4 border border-border rounded-xl">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Education #{index + 1}</h3>
                            {(resumeData.education || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEducation(edu.id)}
                                className="rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                              <Input
                                id={`institution-${edu.id}`}
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                                placeholder="University Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                              <Input
                                id={`degree-${edu.id}`}
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                                placeholder="Bachelor's, Master's, etc."
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                            <Input
                              id={`field-${edu.id}`}
                              value={edu.field}
                              onChange={(e) => handleEducationChange(edu.id, "field", e.target.value)}
                              placeholder="Computer Science, Business, etc."
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`eduStartDate-${edu.id}`}>Start Date</Label>
                              <Input
                                id={`eduStartDate-${edu.id}`}
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`eduEndDate-${edu.id}`}>End Date</Label>
                              <Input
                                id={`eduEndDate-${edu.id}`}
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`eduDescription-${edu.id}`}>Description</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => generateEducationWithAI(edu.id)}
                                disabled={isGeneratingEducation[edu.id]}
                                className="rounded-full text-xs"
                              >
                                {isGeneratingEducation[edu.id] ? (
                                  <>
                                    <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Generate with AI
                                  </>
                                )}
                              </Button>
                            </div>
                            <RichTextEditor
                              value={edu.description}
                              onChange={(value) => handleEducationChange(edu.id, "description", value)}
                              placeholder="Additional details about your education..."
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={addEducation}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Education
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Section */}
                {activeSection === "skills" && (
                  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                        Skills
                      </CardTitle>
                      <CardDescription>
                        Update your professional skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSkillsWithAI}
                          disabled={isGeneratingSkills}
                          className="rounded-full text-xs"
                        >
                          {isGeneratingSkills ? (
                            <>
                              <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-33 mr-1" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </div>
                      {(resumeData.skills || []).map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => handleSkillsChange(index, e.target.value)}
                            placeholder="e.g. JavaScript, Project Management, etc."
                          />
                          {(resumeData.skills || []).length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeSkill(index)}
                              className="rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={addSkill}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Skill
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Form Actions */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <div className="space-x-33">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        if (activeSection === "personal") setActiveSection("work");
                        else if (activeSection === "work") setActiveSection("education");
                        else if (activeSection === "education") setActiveSection("skills");
                      }}
                    >
                      Next
                    </Button>
                    <Button 
                      type="submit" 
                      className="rounded-full"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
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