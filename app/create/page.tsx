"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import ProtectedPage from "@/components/protected-page";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { DynamicDock } from "@/components/dynamic-dock";
import { DashboardFooter } from "@/components/dashboard-footer";
import TemplatePreview from "@/components/template-preview";
import CreateResumeTour from "@/components/create-resume-tour";

import { saveResume, supabase } from "@/lib/supabase";
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

  Plus,
  Check,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown
} from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Template data - simplified version for the create page
const templateData = [
  // Free Templates First
  {
    id: 1,
    name: "Classic Professional",
    description: "Professional blue and white layout with clear sections and timeline design",
    previewImage: "/classic-professional-preview.svg",
    isPremium: false,
    isFeatured: true
  },
  {
    id: 8,
    name: "Modern Split",
    description: "Bold two-column layout with accent colors and clean organization",
    previewImage: "/modern-split-preview.svg",
    isPremium: false,
    isFeatured: true
  },
  {
    id: 10,
    name: "Minimalist Pro",
    description: "Clean, minimalist design with olive sidebar and professional layout",
    previewImage: "/minimalist-pro-preview.svg",
    isPremium: false,
    isFeatured: false
  },
  // Premium Templates
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
    id: 9,
    name: "Corporate Elite",
    description: "Sophisticated design for senior executives and corporate professionals",
    previewImage: "/placeholder.svg",
    isPremium: true,
    isFeatured: true
  }
];

// Skeleton component for loading states
const SkeletonSection = () => (
  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
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
  const [templateSelected, setTemplateSelected] = useState(false); // New state to track if template is selected
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
      // Don't automatically proceed to form when coming from URL
      // User still needs to click continue button
    }
  }, [templateId]);

  // Handle template selection
  const handleTemplateSelect = (templateId: number | null) => {
    setSelectedTemplate(templateId);
    // Don't automatically proceed to form - user needs to click continue button
    // Update URL with template parameter for better UX
    if (templateId) {
      router.push(`/create?template=${templateId}`, { scroll: false });
    }
  };

  // Handle continue with selected template
  const handleContinueWithTemplate = () => {
    if (selectedTemplate !== null) {
      setTemplateSelected(true);
    }
  };

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

      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('resume-images')
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading image to Supabase:", error);
        toast.error("Error uploading image. Please try again.");
        return;
      }

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('resume-images')
        .getPublicUrl(fileName);

      // Set the public URL as the image preview
      setImagePreview(publicUrl);
      console.log("File uploaded successfully:", publicUrl);
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
  const handleWorkExperienceChange = (id: number, field: string, value: string | boolean | Date | null | undefined) => {
    // Don't update if value is undefined (happens when clicking the same date in the calendar)
    if (value === undefined) return;
    
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.map(exp => {
        if (exp.id === id) {
          // Format date to yyyy-MM for storage if it's a Date object
          const formattedValue = value instanceof Date ? format(value, 'yyyy-MM') : value;
          
          return { 
            ...exp, 
            [field]: formattedValue,
            // If setting current to true, clear the end date
            ...(field === 'current' && value === true ? { endDate: '' } : {})
          };
        }
        return exp;
      })
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
    
    // Use the same data structure as TemplatePreview for consistency
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
      },
      work: resumeData.workExperience.map((exp) => ({
        name: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.current ? undefined : exp.endDate,
        summary: exp.description,
        location: "",
        highlights: exp.description ? [exp.description] : [],
      })),
      educationItems: resumeData.education.map((edu) => ({
        institution: edu.institution,
        area: edu.field,
        studyType: edu.degree,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      skillItems: resumeData.skills.filter(skill => skill.trim() !== "").map((skill) => ({
        name: skill.trim(),
        level: "5", // Default to medium proficiency
      })),
      references: [], // Add empty references array
      // Add selected template ID to resume data
      templateId: selectedTemplate || undefined
    };
    
    // Save resume
    try {
      setSaving(true);
      
      const resumeTitle = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}'s Resume`;
      
      const { error } = await saveResume({
        title: resumeTitle,
        data: resumeDataWithImage,
        status: "Draft"
      });
      
      if (error) {
        console.error("Error saving resume:", error);
        toast.error("Error saving resume. Please try again.");
      } else {
        toast.success("Resume saved successfully!");
        // Redirect to the edit page for the newly created resume
        // Since we don't have the ID, we'll redirect to the dashboard
        // A better approach would be to get the ID from the response
        router.push("/my-resumes");
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
      <div className="h-screen flex bg-background flex-col">
        <CreateResumeTour />
        {/* Sidebar - Full Height */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-background transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0 lg:h-screen ${
          sidebarCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-80'
        }`}>
          <div className="h-full overflow-y-auto">
            {loading ? (
              // Sidebar Skeleton Loading
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
                      <Menu className="h-5 w-5" />
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
                <Sidebar 
                  currentPage="create" 
                  onClose={() => setSidebarOpen(false)} 
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
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
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'
        }`}>
          {/* Header with gradient - Fixed */}
          <div className="bg-[#F4F7FA] dark:bg-[#0C111D] flex-shrink-0" id="create-header">
            <div className="px-4 sm:px-6 lg:px-8 py-1">
              <div className="flex items-center justify-end w-full">
                <div className="lg:hidden absolute left-4">
                  <Image
                    src="/logo/resumify-logo.png"
                    alt="Resumify Logo"
                    width={120}
                    height={30}
                    className="object-contain"
                  />
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
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Create Your Resume</h1>
                  <p className="text-gray-700 mt-2 dark:text-white">
                    {templateSelected 
                      ? "Build a professional resume in minutes with our easy-to-use editor" 
                      : "Choose a template to get started"}
                  </p>
                </div>
                {/* Preview button moved to form actions */}
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Main Content Area */}
            <div className={templateSelected ? "lg:col-span-3" : "lg:col-span-4"}>
              {!templateSelected ? (
                // Template Selection Grid
                <Card className="bg-card border-0 rounded-2xl overflow-hidden" id="template-selection">
                  <CardHeader>
                    <CardTitle>Select a Template</CardTitle>
                    <CardDescription>
                      Choose a professional template to create your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templateData.map((template) => (
                        <Card 
                          key={template.id} 
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedTemplate === template.id 
                              ? "ring-2 ring-purple-500 shadow-lg" 
                              : ""
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-[#0C111D] flex items-center justify-center">
                              {template.previewImage ? (
                                <Image 
                                  src={template.previewImage} 
                                  alt={template.name}
                                  fill
                                  className="object-contain"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              ) : (
                                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {template.description}
                                </p>
                              </div>
                              {selectedTemplate === template.id && (
                                <div className="bg-purple-500 rounded-full p-1">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            {template.isPremium && (
                              <Badge className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
                                PREMIUM
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <Button 
                        size="lg" 
                        className="rounded-full px-8 py-6 text-lg"
                        disabled={selectedTemplate === null}
                        onClick={handleContinueWithTemplate}
                      >
                        Continue with Selected Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : showPreview ? (
                <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-purple-500" />
                        Resume Preview
                      </CardTitle>
                      <CardDescription>
                        {selectedTemplate ? `Using ${templateData.find(t => t.id === selectedTemplate)?.name} template` : "Preview of your resume"}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={handlePreviewToggle}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Edit Resume
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} imagePreview={imagePreview} />
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Tab Navigation - Circular Design */}
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center bg-gray-100 dark:bg-[#0C111D] rounded-full p-1 overflow-x-auto scrollbar-hide">
                      <button
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap ${
                          activeSection === "personal"
                            ? "bg-white dark:bg-[#0C111D] text-purple-600 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveSection("personal")}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                          activeSection === "personal"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }`}>
                          1
                        </div>
                        <span className="hidden sm:inline">Personal Info</span>
                        <span className="sm:hidden">Personal</span>
                      </button>
                      
                      <div className="w-2 md:w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
                      
                      <button
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap ${
                          activeSection === "work"
                            ? "bg-white dark:bg-[#0C111D] text-purple-600 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveSection("work")}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                          activeSection === "work"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }`}>
                          2
                        </div>
                        <span className="hidden sm:inline">Work Experience</span>
                        <span className="sm:hidden">Work</span>
                      </button>
                      
                      <div className="w-2 md:w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
                      
                      <button
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap ${
                          activeSection === "education"
                            ? "bg-white dark:bg-[#0C111D] text-purple-600 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveSection("education")}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                          activeSection === "education"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }`}>
                          3
                        </div>
                        <span className="hidden sm:inline">Education</span>
                        <span className="sm:hidden">Edu</span>
                      </button>
                      
                      <div className="w-2 md:w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
                      
                      <button
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap ${
                          activeSection === "skills"
                            ? "bg-white dark:bg-[#0C111D] text-purple-600 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveSection("skills")}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                          activeSection === "skills"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }`}>
                          4
                        </div>
                        <span className="hidden sm:inline">Skills</span>
                        <span className="sm:hidden">Skills</span>
                      </button>
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  {loading ? (
                    <SkeletonSection />
                  ) : activeSection === "personal" && (
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden" id="personal-info-section">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-purple-500" />
                            Personal Information
                          </CardTitle>
                          <CardDescription>
                            Tell us about yourself
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-full"
                          onClick={handlePreviewToggle}
                          id="preview-button"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Resume
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="space-y-2 border border-dashed border-gray-300 p-4 rounded-lg bg-blue-50 dark:bg-[#0C111D]">
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
                              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#0C111D] flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                            
                            {/* Upload Button */}
                            <div>
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="px-4 py-2 dark:bg-[#0C111D] bg-gray-200 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
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
                              id="ai-assistant"
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
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden" id="work-experience-section">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                            Work Experience
                          </CardTitle>
                          <CardDescription>
                            List your professional experience
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-full"
                          onClick={handlePreviewToggle}
                          id="preview-button"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Resume
                        </Button>
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
                                <Label>Start Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !exp.startDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {exp.startDate ? format(new Date(exp.startDate), "MMM yyyy") : <span>Pick a date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={exp.startDate ? new Date(exp.startDate) : undefined}
                                      onSelect={(date) => handleWorkExperienceChange(exp.id, "startDate", date)}
                                      initialFocus
                                      captionLayout="dropdown"
                                      fromYear={1900}
                                      toYear={new Date().getFullYear() + 5}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !exp.endDate && !exp.current && "text-muted-foreground",
                                        exp.current && "opacity-50"
                                      )}
                                      disabled={exp.current}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {exp.current ? (
                                        <span>Present</span>
                                      ) : exp.endDate ? (
                                        format(new Date(exp.endDate), "MMM yyyy")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={exp.endDate ? new Date(exp.endDate) : undefined}
                                      onSelect={(date) => handleWorkExperienceChange(exp.id, "endDate", date)}
                                      initialFocus
                                      captionLayout="dropdown"
                                      fromYear={1900}
                                      toYear={new Date().getFullYear() + 5}
                                    />
                                  </PopoverContent>
                                </Popover>
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
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden" id="education-section">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                            Education
                          </CardTitle>
                          <CardDescription>
                            List your educational background
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-full"
                          onClick={handlePreviewToggle}
                          id="preview-button"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Resume
                        </Button>
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
                                <Label>Degree</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between font-normal"
                                    >
                                      {edu.degree || "Select a degree"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Search degrees..." />
                                      <CommandEmpty>No degree found.</CommandEmpty>
                                      <CommandGroup>
                                        <CommandItem
                                          value="High School"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "High School")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "High School" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          High School
                                        </CommandItem>
                                        <CommandItem
                                          value="Associate's Degree"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "Associate's Degree")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "Associate's Degree" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          Associate's Degree
                                        </CommandItem>
                                        <CommandItem
                                          value="Bachelor's Degree"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "Bachelor's Degree")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "Bachelor's Degree" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          Bachelor's Degree
                                        </CommandItem>
                                        <CommandItem
                                          value="Master's Degree"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "Master's Degree")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "Master's Degree" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          Master's Degree
                                        </CommandItem>
                                        <CommandItem
                                          value="Doctorate (Ph.D.)"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "Doctorate (Ph.D.)")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "Doctorate (Ph.D.)" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          Doctorate (Ph.D.)
                                        </CommandItem>
                                        <CommandItem
                                          value="Professional Degree"
                                          onSelect={() => handleEducationChange(edu.id, "degree", "Professional Degree")}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${edu.degree === "Professional Degree" ? "opacity-100" : "opacity-0"}`}
                                          />
                                          Professional Degree (JD, MD, etc.)
                                        </CommandItem>
                                      </CommandGroup>
                                      <CommandSeparator />
                                      <CommandGroup>
                                        <CommandItem
                                          className="text-muted-foreground"
                                          onSelect={() => {
                                            const newDegree = prompt("Enter custom degree:");
                                            if (newDegree) {
                                              handleEducationChange(edu.id, "degree", newDegree);
                                            }
                                          }}
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add custom degree
                                        </CommandItem>
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Field of Study</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between font-normal"
                                      >
                                        {edu.field || "Select field of study"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0">
                                      <Command>
                                        <CommandInput placeholder="Search fields of study..." />
                                        <CommandEmpty>No field of study found.</CommandEmpty>
                                        <CommandGroup>
                                          <CommandItem
                                            value="Computer Science"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Computer Science")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Computer Science" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Computer Science
                                          </CommandItem>
                                          <CommandItem
                                            value="Business Administration"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Business Administration")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Business Administration" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Business Administration
                                          </CommandItem>
                                          <CommandItem
                                            value="Engineering"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Engineering")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Engineering" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Engineering
                                          </CommandItem>
                                          <CommandItem
                                            value="Marketing"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Marketing")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Marketing" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Marketing
                                          </CommandItem>
                                          <CommandItem
                                            value="Finance"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Finance")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Finance" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Finance
                                          </CommandItem>
                                          <CommandItem
                                            value="Psychology"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Psychology")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Psychology" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Psychology
                                          </CommandItem>
                                          <CommandItem
                                            value="Biology"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Biology")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Biology" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Biology
                                          </CommandItem>
                                          <CommandItem
                                            value="Mathematics"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Mathematics")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Mathematics" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Mathematics
                                          </CommandItem>
                                          <CommandItem
                                            value="English"
                                            onSelect={() => handleEducationChange(edu.id, "field", "English")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "English" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            English
                                          </CommandItem>
                                          <CommandItem
                                            value="History"
                                            onSelect={() => handleEducationChange(edu.id, "field", "History")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "History" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            History
                                          </CommandItem>
                                          <CommandItem
                                            value="Art"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Art")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Art" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Art
                                          </CommandItem>
                                          <CommandItem
                                            value="Design"
                                            onSelect={() => handleEducationChange(edu.id, "field", "Design")}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${edu.field === "Design" ? "opacity-100" : "opacity-0"}`}
                                            />
                                            Design
                                          </CommandItem>
                                        </CommandGroup>
                                        <CommandSeparator />
                                        <CommandGroup>
                                          <CommandItem
                                            className="text-muted-foreground"
                                            onSelect={() => {
                                              const newField = prompt("Enter custom field of study:");
                                              if (newField) {
                                                handleEducationChange(edu.id, "field", newField);
                                              }
                                            }}
                                          >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add custom field
                                          </CommandItem>
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateEducationWithAI(edu.id)}
                                  disabled={isGeneratingEducation[edu.id]}
                                  className="rounded-full whitespace-nowrap"
                                >
                                  {isGeneratingEducation[edu.id] ? (
                                    <>
                                      <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                                      <span className="hidden sm:inline">Generating</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">AI Suggest</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>Description</Label>
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
                                      Enhance with AI
                                    </>
                                  )}
                                </Button>
                              </div>
                              <RichTextEditor
                                value={edu.description}
                                onChange={(value) => handleEducationChange(edu.id, "description", value)}
                                placeholder="Describe your education, achievements, and relevant coursework..."
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
                    <Card className="bg-card border-0 rounded-2xl overflow-hidden" id="skills-section">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                            Skills
                          </CardTitle>
                          <CardDescription>
                            List your professional skills
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-full"
                          onClick={handlePreviewToggle}
                          id="preview-button"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Resume
                        </Button>
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
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex gap-2 sm:order-1 order-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setTemplateSelected(false)}
                        >
                          Change Template
                        </Button>

                        <Button
                          type="button"
                          variant="default"
                          className="rounded-full bg-white text-purple-600 hover:bg-white/90"
                          onClick={() => router.push("/dashboard")}
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="flex gap-2 sm:order-2 order-1">
                        <Button
                          type="button"
                          variant={activeSection === "personal" ? "outline" : "default"}
                          size="icon"
                          className={`rounded-full w-10 h-10 ${activeSection !== "personal" ? "bg-white text-purple-600 hover:bg-white/90" : ""}`}
                          onClick={() => {
                            if (activeSection === "work") setActiveSection("personal");
                            else if (activeSection === "education") setActiveSection("work");
                            else if (activeSection === "skills") setActiveSection("education");
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant={activeSection === "skills" ? "outline" : "default"}
                          size="icon"
                          className={`rounded-full w-10 h-10 ${activeSection !== "skills" ? "bg-white text-purple-600 hover:bg-white/90" : ""}`}
                          onClick={() => {
                            if (activeSection === "personal") setActiveSection("work");
                            else if (activeSection === "work") setActiveSection("education");
                            else if (activeSection === "education") setActiveSection("skills");
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button 
                        type="submit" 
                        className="rounded-full w-full sm:w-auto sm:order-3 order-3"
                        disabled={saving}
                        id="save-resume"
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
                  )}
                </form>
              )}
            </div>
          </div>
          
          {/* Dynamic Dock Component */}
          <div className="mt-auto w-full flex justify-center items-center">
            <div className="w-full max-w-4xl flex justify-center">
              <DynamicDock currentPage="create" showLogout={false} />
            </div>
          </div>
          
          {/* Footer */}
          <DashboardFooter />
        </div>
      </div>
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
