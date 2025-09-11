"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protected-page";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { DynamicDock } from "@/components/dynamic-dock";
import TemplatePreview from "@/components/template-preview";
import Link from "next/link";
import { saveResume } from "@/lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Trash2,
  Eye,
  Sparkles,
  Save,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Plus
} from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Skeleton component for loading states
const SkeletonSection = () => (
  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
    <CardHeader>
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton for sidebar
const SkeletonSidebar = () => (
  <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
    <CardHeader>
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-border">
      </div>
    </CardContent>
  </Card>
);

// Create a separate component for the content that uses useSearchParams
const CreateResumeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') ? parseInt(searchParams.get('template') || '0') : null;
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // State for form data
  const [resumeData, setResumeData] = useState({
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

  // State for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for AI generation loading
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState<{[key: number]: boolean}>({});
  const [isGeneratingEducation, setIsGeneratingEducation] = useState<{[key: number]: boolean}>({});
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);

  // Debug effect to log image preview changes
  useEffect(() => {
    console.log("Image preview updated:", imagePreview);
  }, [imagePreview]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Set selected template from URL parameter
  useEffect(() => {
    if (templateId) {
      setSelectedTemplate(templateId);
    }
  }, [templateId]);

  // Handle input changes for personal info
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = 'target' in e ? e.target : e;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    });
  };

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

  // Handle work experience changes
  const handleWorkExperienceChange = (id: number, field: string, value: string | boolean) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  // Add new work experience
  const addWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...resumeData.workExperience,
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
    if (resumeData.workExperience.length > 1) {
      setResumeData({
        ...resumeData,
        workExperience: resumeData.workExperience.filter(exp => exp.id !== id)
      });
    }
  };

  // Handle education changes
  const handleEducationChange = (id: number, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  // Add new education
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
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
    if (resumeData.education.length > 1) {
      setResumeData({
        ...resumeData,
        education: resumeData.education.filter(edu => edu.id !== id)
      });
    }
  };

  // Handle skills changes
  const handleSkillsChange = (index: number, value: string) => {
    const newSkills = [...resumeData.skills];
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
      skills: [...resumeData.skills, ""]
    });
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (resumeData.skills.length > 1) {
      const newSkills = [...resumeData.skills];
      newSkills.splice(index, 1);
      setResumeData({
        ...resumeData,
        skills: newSkills
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!resumeData.personalInfo.firstName || !resumeData.personalInfo.lastName) {
      toast.error("Please enter your first and last name");
      setActiveSection("personal");
      return;
    }
    
    // Add image to resume data if available
    const resumeDataWithImage = {
      ...resumeData,
      basics: {
        name: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim(),
        label: resumeData.personalInfo.headline,
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
        summary: resumeData.personalInfo.summary,
        location: resumeData.personalInfo.location ? {
          address: resumeData.personalInfo.location,
        } : undefined,
        image: imagePreview || undefined
      }
    };
    
    // Save resume
    try {
      setSaving(true);
      
      const resumeTitle = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}'s Resume`;
      
      const { data, error } = await saveResume({
        title: resumeTitle,
        data: resumeDataWithImage,
        status: "Draft"
      });
      
      if (error) {
        console.error("Error saving resume:", error);
        toast.error("Error saving resume. Please try again.");
      } else if (data && data.length > 0) {
        toast.success("Resume saved successfully!");
        router.push(`/edit/${data[0].id}`);
      } else {
        toast.error("Error saving resume. Please try again.");
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      toast.error("Error saving resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle preview toggle
  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
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
            ...resumeData.personalInfo,
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
    setIsGeneratingExperience(prev => ({...prev, [id]: true}));
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
        
        const experience = resumeData.workExperience.find(exp => exp.id === id);
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
      setIsGeneratingExperience(prev => ({...prev, [id]: false}));
    }
  };

  const generateEducationWithAI = async (id: number) => {
    console.log("Generating education with AI for ID:", id); // Debug log
    setIsGeneratingEducation(prev => ({...prev, [id]: true}));
    try {
      // Find the index of the education entry being enhanced
      const educationIndex = resumeData.education.findIndex(edu => edu.id === id);
      if (educationIndex === -1) {
        toast.error("Education entry not found. Please try again.");
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
      setIsGeneratingEducation(prev => ({...prev, [id]: false}));
    }
  };

  const generateSkillsWithAI = async () => {
    console.log("Generating skills with AI..."); // Debug log
    setIsGeneratingSkills(true);
    try {
      // Check if work experience or education data exists
      if ((!resumeData.workExperience || resumeData.workExperience.length === 0 || 
           resumeData.workExperience.every(exp => !exp.company && !exp.position)) &&
          (!resumeData.education || resumeData.education.length === 0 || 
           resumeData.education.every(edu => !edu.institution && !edu.degree))) {
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
        skills = skills.map((skill: string) => {
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
        }).filter((skill: string) => typeof skill === 'string' && skill.length > 0);
        
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

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Button 
                asChild
                className="bg-black hover:bg-gray-800 text-white font-medium shadow-lg rounded-full px-6 py-3 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <Link href="/dashboard" className="flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <ThemeToggle className="bg-white/20 border-white/30 hover:bg-white/30" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Create Your Resume</h1>
                <p className="text-white/80 mt-2">
                  Build a professional resume in minutes with our easy-to-use editor
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full"
                  onClick={handlePreviewToggle}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Edit Resume" : "Preview Resume"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Always visible on larger screens, collapsible on mobile */}
            <div className="lg:col-span-1">
              {loading ? (
                <SkeletonSidebar />
              ) : (
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
                  <CardHeader>
                    <CardTitle>Resume Sections</CardTitle>
                    <CardDescription>
                      Click on a section to edit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant={activeSection === "personal" ? "default" : "outline"}
                        className={`w-full justify-start rounded-full ${
                          activeSection === "personal" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                        onClick={() => setActiveSection("personal")}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </Button>
                      <Button
                        variant={activeSection === "work" ? "default" : "outline"}
                        className={`w-full justify-start rounded-full ${
                          activeSection === "work" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                        onClick={() => setActiveSection("work")}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Work Experience
                      </Button>
                      <Button
                        variant={activeSection === "education" ? "default" : "outline"}
                        className={`w-full justify-start rounded-full ${
                          activeSection === "education" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                        onClick={() => setActiveSection("education")}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Education
                      </Button>
                      <Button
                        variant={activeSection === "skills" ? "default" : "outline"}
                        className={`w-full justify-start rounded-full ${
                          activeSection === "skills" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                        onClick={() => setActiveSection("skills")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Skills
                      </Button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-border">
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {showPreview ? (
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-purple-500" />
                      Resume Preview
                    </CardTitle>
                    <CardDescription>
                      {selectedTemplate ? "Using custom template" : "Default preview of your resume"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} imagePreview={imagePreview} />
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Personal Information Section */}
                  {loading ? (
                    <SkeletonSection />
                  ) : activeSection === "personal" && (
                    <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-purple-500" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Tell us about yourself
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="space-y-2 border border-dashed border-gray-300 p-4 rounded-lg bg-blue-50 dark:bg-gray-900">
                          <Label htmlFor="image-upload" className="font-bold dark:text-blue-50">Profile Image</Label>
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
                              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                            
                            {/* Upload Button */}
                            <div>
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="px-4 py-2 dark:bg-gray-800 bg-gray-200 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
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
                              value={resumeData.personalInfo.firstName}
                              onChange={handlePersonalInfoChange}
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={resumeData.personalInfo.lastName}
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
                            value={resumeData.personalInfo.headline}
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
                                value={resumeData.personalInfo.email}
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
                                value={resumeData.personalInfo.phone}
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
                              value={resumeData.personalInfo.location}
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
                            value={resumeData.personalInfo.summary}
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
                  {loading ? (
                    <SkeletonSection />
                  ) : activeSection === "work" && (
                    <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                          Work Experience
                        </CardTitle>
                        <CardDescription>
                          List your professional experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {resumeData.workExperience.map((exp, index) => (
                          <div key={exp.id} className="space-y-4 p-4 border border-border rounded-xl">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Experience #{index + 1}</h3>
                              {resumeData.workExperience.length > 1 && (
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
                  {loading ? (
                    <SkeletonSection />
                  ) : activeSection === "education" && (
                    <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                          Education
                        </CardTitle>
                        <CardDescription>
                          List your educational background
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {resumeData.education.map((edu, index) => (
                          <div key={edu.id} className="space-y-4 p-4 border border-border rounded-xl">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Education #{index + 1}</h3>
                              {resumeData.education.length > 1 && (
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
                  {loading ? (
                    <SkeletonSection />
                  ) : activeSection === "skills" && (
                    <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                          Skills
                        </CardTitle>
                        <CardDescription>
                          List your professional skills
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
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        </div>
                        {resumeData.skills.map((skill, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={skill}
                              onChange={(e) => handleSkillsChange(index, e.target.value)}
                              placeholder="e.g. JavaScript, Project Management, etc."
                            />
                            {resumeData.skills.length > 1 && (
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
                  {!loading && (
                    <div className="flex justify-between mt-8">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => router.push("/dashboard")}
                      >
                        Cancel
                      </Button>
                      <div className="space-x-3">
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
                              Save Resume
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Dock Component */}
      <DynamicDock currentPage="create" showLogout={false} />
    </ProtectedPage>
  );
};

// Wrapper component with Suspense
export default function CreateResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateResumeContent />
    </Suspense>
  );
}
