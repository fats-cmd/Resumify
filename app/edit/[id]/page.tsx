"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { DynamicDock } from "@/components/dynamic-dock";

import { useAuth } from "@/components/auth-provider";
import { getResumes, updateResume } from "@/lib/supabase";
import { Resume, ResumeData } from "../../../types/resume";
import { toast } from "react-toastify";
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
  Check,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronsUpDown,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import TemplatePreview from "@/components/template-preview";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface FormResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
  };
  workExperience: {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }[];
  education: {
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
}

export default function EditResumePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [templateSelected, setTemplateSelected] = useState(true);
  const [templateId, setTemplateId] = useState<number | null>(null);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }

    const savedOpenState = localStorage.getItem("sidebarOpen");
    if (savedOpenState !== null) {
      setSidebarOpen(JSON.parse(savedOpenState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // State for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for form data
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
    },
    workExperience: [
      {
        id: 1,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false,
      },
    ],
    education: [
      {
        id: 1,
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    skills: [""],
  });

  // State for AI generation loading
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState<{
    [key: number]: boolean;
  }>({});
  const [isGeneratingEducation, setIsGeneratingEducation] = useState<{
    [key: number]: boolean;
  }>({});
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle preview toggle
  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // Transform ResumeData to FormResumeData for TemplatePreview
  const transformToFormResumeData = (data: ResumeData): FormResumeData => {
    return {
      personalInfo: {
        firstName: data.personalInfo?.firstName || "",
        lastName: data.personalInfo?.lastName || "",
        email: data.personalInfo?.email || "",
        phone: data.personalInfo?.phone || "",
        location: data.personalInfo?.location || "",
        headline: data.personalInfo?.headline || "",
        summary: data.personalInfo?.summary || "",
      },
      workExperience: data.workExperience || [
        {
          id: 1,
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
      education: data.education || [
        {
          id: 1,
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      skills: data.skills || [""],
    };
  };

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await getResumes(user.id);

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
          const resume = data?.find(
            (r: Resume) => r.id === parseInt(id as string),
          );
          if (resume) {
            setResumeData(resume.data as ResumeData);
            // Set template ID from resume data
            setTemplateId(resume.data.templateId || null);
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
            stack: err.stack,
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
  }, [user, id, router]);

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
    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Debug effect to log image preview changes
  useEffect(() => {
    console.log("Image preview updated:", imagePreview);
  }, [imagePreview]);

  // Handle input changes for personal info
  const handlePersonalInfoChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = "target" in e ? e.target : e;
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
          summary: "",
        }),
        [name]: value,
      },
    });
  };

  // Handle work experience changes
  const handleWorkExperienceChange = (
    id: number,
    field: string,
    value: string | boolean | Date | null | undefined,
  ) => {
    setResumeData({
      ...resumeData,
      workExperience: (resumeData.workExperience || []).map((exp) =>
        exp.id === id ? {
          ...exp,
          [field]: value instanceof Date ? format(value, 'yyyy-MM') : value
        } : exp,
      ),
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
          current: false,
        },
      ],
    });
  };

  // Remove work experience
  const removeWorkExperience = (id: number) => {
    const currentWorkExperience = resumeData.workExperience || [];
    if (currentWorkExperience.length > 1) {
      setResumeData({
        ...resumeData,
        workExperience: currentWorkExperience.filter((exp) => exp.id !== id),
      });
    }
  };

  // Handle education changes
  const handleEducationChange = (id: number, field: string, value: string | Date | null | undefined) => {
    setResumeData({
      ...resumeData,
      education: (resumeData.education || []).map((edu) =>
        edu.id === id ? {
          ...edu,
          [field]: value instanceof Date ? format(value, 'yyyy-MM') : value
        } : edu,
      ),
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
          description: "",
        },
      ],
    });
  };

  // Remove education
  const removeEducation = (id: number) => {
    const currentEducation = resumeData.education || [];
    if (currentEducation.length > 1) {
      setResumeData({
        ...resumeData,
        education: currentEducation.filter((edu) => edu.id !== id),
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
      skills: newSkills,
    });
  };

  // Add new skill
  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...(resumeData.skills || []), ""],
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
        skills: newSkills,
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
          location: resumeData.personalInfo?.location
            ? {
                address: resumeData.personalInfo.location,
              }
            : undefined,
          image: imagePreview || undefined,
        },
      };

      // Update the resume data in Supabase
      const { data, error } = await updateResume(
        parseInt(id as string),
        resumeDataWithImage,
      );

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

  // Get user's profile image or generate initials
  const getUserAvatar = () => {
    if (!user) return null;

    // Check if user has an avatar URL (uploaded image or custom avatar)
    const avatarUrl = user.user_metadata?.avatar_url;
    const customAvatar = user.user_metadata?.custom_image_avatar;

    // Add cache-busting parameter to avatar URL
    const cacheBustedAvatarUrl = avatarUrl
      ? `${avatarUrl}?t=${Date.now()}`
      : null;
    const displayAvatar = cacheBustedAvatarUrl || customAvatar;

    if (displayAvatar) {
      // Extract the base URL without cache-busting parameter for the Image component
      const [baseUrl] = displayAvatar.split("?t=");
      return (
        <Image
          src={baseUrl}
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
    const email = user.email || "";
    let initials = "";

    if (fullName) {
      const names = fullName.split(" ");
      initials =
        names[0].charAt(0) +
        (names.length > 1 ? names[names.length - 1].charAt(0) : "");
    } else if (email) {
      const emailParts = email.split("@");
      initials = emailParts[0].charAt(0);
    }

    return (
      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
        {initials.toUpperCase()}
      </div>
    );
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
            personalInfo: resumeData.personalInfo,
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.result) {
        // Check if the result is an error message
        if (
          typeof result.result === "string" &&
          result.result.startsWith("Error:")
        ) {
          toast.error(result.result);
          return;
        }

        // Clean up the result to remove any introductory phrases
        let cleanedResult = result.result;

        // Remove common introductory phrases
        cleanedResult = cleanedResult.replace(
          /^Here's a professional resume summary for.*?:\s*/i,
          "",
        );
        cleanedResult = cleanedResult.replace(
          /^Here is a professional.*?:\s*/i,
          "",
        );
        cleanedResult = cleanedResult.replace(
          /^Professional summary for.*?:\s*/i,
          "",
        );
        cleanedResult = cleanedResult.replace(/^Summary:\s*/i, "");

        // Sanitize the result to ensure it's proper HTML for the rich text editor
        let sanitizedResult = cleanedResult;
        if (
          typeof sanitizedResult === "string" &&
          !sanitizedResult.includes("<")
        ) {
          // If it's plain text, convert line breaks to HTML
          sanitizedResult = sanitizedResult.replace(/\n/g, "<br />");
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
              summary: "",
            }),
            summary: sanitizedResult,
          },
        });
        toast.success("Professional summary generated successfully!");
      } else {
        toast.error(
          result.error || "Failed to generate summary. Please try again.",
        );
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
    setIsGeneratingExperience((prevState) => ({
      ...prevState,
      [id]: true,
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
            workExperience: resumeData.workExperience,
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.result) {
        // Check if the result is an error message
        if (
          Array.isArray(result.result) &&
          result.result.length > 0 &&
          typeof result.result[0] === "string" &&
          result.result[0].startsWith("Error:")
        ) {
          toast.error(result.result[0]);
          return;
        }

        const experience = (resumeData.workExperience || []).find(
          (exp) => exp.id === id,
        );
        if (experience) {
          handleWorkExperienceChange(id, "description", result.result[0]);
          toast.success("Work experience description enhanced successfully!");
        }
      } else {
        toast.error(
          result.error ||
            "Failed to enhance work experience. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error enhancing work experience:", error);
      toast.error("Error enhancing work experience. Please try again.");
    } finally {
      setIsGeneratingExperience((prevState) => ({
        ...prevState,
        [id]: false,
      }));
    }
  };

  const generateEducationWithAI = async (id: number) => {
    console.log("Generating education with AI for ID:", id); // Debug log
    setIsGeneratingEducation((prevState) => ({
      ...prevState,
      [id]: true,
    }));
    try {
      // Find the index of the education entry being enhanced
      const educationIndex = (resumeData.education || []).findIndex(
        (edu) => edu.id === id,
      );
      if (educationIndex === -1) {
        toast.error("Education entry not found. Please try again.");
        setIsGeneratingEducation((prevState) => ({
          ...prevState,
          [id]: false,
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
            education: resumeData.education,
          },
        }),
      });

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        toast.error("Error enhancing education description. Please try again.");
        console.error("Non-JSON response received:", await response.text());
        setIsGeneratingEducation((prevState) => ({
          ...prevState,
          [id]: false,
        }));
        return;
      }

      const result = await response.json();

      if (response.ok && result.result) {
        // Check if the result is an error message
        if (
          Array.isArray(result.result) &&
          result.result.length > 0 &&
          typeof result.result[0] === "string" &&
          result.result[0].startsWith("Error:")
        ) {
          toast.error(result.result[0]);
          return;
        }

        // Make sure we have a result for the specific education entry
        if (
          Array.isArray(result.result) &&
          result.result.length > educationIndex
        ) {
          handleEducationChange(
            id,
            "description",
            result.result[educationIndex],
          );
          toast.success("Education description generated successfully!");
        } else {
          toast.error(
            "Failed to generate education description. Please try again.",
          );
        }
      } else {
        toast.error(
          result.error ||
            "Failed to enhance education description. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error enhancing education description:", error);
      toast.error("Error enhancing education description. Please try again.");
    } finally {
      setIsGeneratingEducation((prevState) => ({
        ...prevState,
        [id]: false,
      }));
    }
  };

  const generateSkillsWithAI = async () => {
    console.log("Generating skills with AI..."); // Debug log
    setIsGeneratingSkills(true);
    try {
      // Check if work experience or education data exists
      const hasWorkExperience = (resumeData.workExperience || []).some(
        (exp) => exp.company || exp.position,
      );
      const hasEducation = (resumeData.education || []).some(
        (edu) => edu.institution || edu.degree,
      );

      if (!hasWorkExperience && !hasEducation) {
        toast.error(
          "Please add your work experience and education details first.",
        );
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
            education: resumeData.education,
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.result) {
        // Check if the result is an error message (both string and array formats)
        if (
          typeof result.result === "string" &&
          result.result.startsWith("Error:")
        ) {
          toast.error(result.result);
          return;
        }

        if (
          Array.isArray(result.result) &&
          result.result.length > 0 &&
          typeof result.result[0] === "string" &&
          result.result[0].startsWith("Error:")
        ) {
          toast.error(result.result[0]);
          return;
        }

        // Post-process the skills to remove any introductory text
        let skills = Array.isArray(result.result)
          ? result.result
          : [result.result];

        // If we have a single string that contains commas, split it properly
        if (
          skills.length === 1 &&
          typeof skills[0] === "string" &&
          skills[0].includes(",")
        ) {
          skills = skills[0]
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0);
        }

        // Clean up each skill to remove any remaining introductory text or markdown
        skills = skills
          .map((skill: string | unknown) => {
            if (typeof skill === "string") {
              // Remove common introductory phrases
              return skill
                .replace(/^Here are.*?:\s*/i, "")
                .replace(/^Skills?:\s*/i, "")
                .replace(/^\d+\.\s*/, "") // Remove numbered lists
                .replace(/^\*\s*/, "") // Remove bullet points
                .replace(/^\-\s*/, "") // Remove dash bullet points
                .trim();
            }
            return skill;
          })
          .filter(
            (skill: string | unknown) =>
              typeof skill === "string" && skill.length > 0,
          ) as string[];

        setResumeData({
          ...resumeData,
          skills: skills,
        });
        toast.success("Skills suggestions generated successfully!");
      } else {
        toast.error(
          result.error || "Failed to generate skills. Please try again.",
        );
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
        <div className="h-screen flex bg-background">
          {/* Sidebar Skeleton */}
          <div
            className={`fixed inset-y-0 left-0 z-50 bg-background transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0 lg:h-screen ${
              sidebarCollapsed ? "w-16 lg:w-16" : "w-64 lg:w-80"
            }`}
          >
            <div className="h-full overflow-y-auto">
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
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"
            }`}
          >
            {/* Header Skeleton */}
            <div className="bg-[#F4F7FA] dark:bg-[#0C111D]">
              <div className="px-4 sm:px-6 lg:px-8 py-1">
                <div className="flex items-center justify-end w-full">
                  <div className="lg:hidden absolute left-4">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 gap-8">
                {/* Main Content Skeleton */}
                <div className="col-span-1">
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden animate-pulse">
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
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="flex bg-background flex-col">
        {/* Sidebar - Full Height */}
        <div
          className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? "w-16 lg:w-16" : "w-64 lg:w-80"} bg-background transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-all duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0 lg:h-screen`}
        >
          <div className="h-full overflow-y-auto">
            <div className="h-full">
              <Sidebar
                currentPage="edit"
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
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
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"}`}
        >
          {/* Header with gradient - NOT Fixed */}
          <div className="bg-[#F4F7FA] dark:bg-[#0C111D] flex-shrink-0">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus:ring-2 focus:ring-gray-500/50 rounded-full p-1">
                        {getUserAvatar()}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 mr-4 mt-2"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center px-2 py-2">
                        <div className="mr-2">{getUserAvatar()}</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium dark:text-white">
                            {user?.user_metadata?.full_name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-white">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push("/settings")}
                        className="cursor-pointer dark:text-white"
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/");
                        }}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 dark:text-red-400"
                      >
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    Edit Resume
                  </h1>
                  <p className="text-gray-700 mt-2 dark:text-white">
                    Update your professional resume
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center"></div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                      activeSection === "personal"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
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
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                      activeSection === "work"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
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
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                      activeSection === "education"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
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
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-1 md:mr-2 text-xs md:text-sm ${
                      activeSection === "skills"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    4
                  </div>
                  <span className="hidden sm:inline">Skills</span>
                  <span className="sm:hidden">Skills</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content - Full Width */}
              <div className="lg:col-span-4">
                {!templateSelected ? (
                  // Template Selection Grid - simplified version
                  <Card className="bg-card border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle>Select a Template</CardTitle>
                      <CardDescription>
                        Choose a professional template to update your resume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Current Template */}
                        <Card
                          className="cursor-pointer transition-all duration-300 hover:shadow-lg ring-2 ring-purple-500 shadow-lg"
                          onClick={() => {
                            setTemplateSelected(true);
                            toast.success("Template updated successfully!");
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-[#0C111D] flex items-center justify-center">
                              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Current Template
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Your current resume template
                                </p>
                              </div>
                              <div className="bg-purple-500 rounded-full p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Alternative Template */}
                        <Card
                          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                          onClick={() => {
                            setTemplateSelected(true);
                            toast.success("Template updated successfully!");
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-[#0C111D] flex items-center justify-center">
                              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Modern Template
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  A modern, clean design
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-1 rounded inline-block">
                              PREMIUM
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="mt-8 flex justify-center">
                        <Button
                          size="lg"
                          className="rounded-full px-8 py-6 text-lg"
                          onClick={() => setTemplateSelected(true)}
                        >
                          Continue with Current Template
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
                          Preview of your resume
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
                      <TemplatePreview
                        templateId={templateId}
                        resumeData={transformToFormResumeData(resumeData)}
                        imagePreview={imagePreview}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Section */}
                    {activeSection === "personal" && (
                      <Card className="bg-card border-0 shadow rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <User className="h-5 w-5 mr-2 text-purple-500" />
                              Personal Information
                            </CardTitle>
                            <CardDescription>
                              Update your personal details
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={handlePreviewToggle}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Resume
                          </Button>
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
                                <label
                                  htmlFor="image-upload"
                                  className="cursor-pointer"
                                >
                                  <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                    {isUploading
                                      ? "Uploading..."
                                      : "Upload Image"}
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
                            <Label htmlFor="headline">
                              Professional Headline
                            </Label>
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
                              <Label htmlFor="summary">
                                Professional Summary
                              </Label>
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
                              onChange={(value) =>
                                handlePersonalInfoChange({
                                  target: { name: "summary", value },
                                } as React.ChangeEvent<HTMLTextAreaElement>)
                              }
                              placeholder="Write a brief summary of your professional background, skills, and career goals..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Work Experience Section */}
                    {activeSection === "work" && (
                      <Card className="bg-card border-0 shadow rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                              Work Experience
                            </CardTitle>
                            <CardDescription>
                              Update your professional experience
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={handlePreviewToggle}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Resume
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {(resumeData.workExperience || []).map(
                            (exp, index) => (
                              <div
                                key={exp.id}
                                className="space-y-4 p-4 border border-border rounded-xl"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium">
                                    Experience #{index + 1}
                                  </h3>
                                  {(resumeData.workExperience || []).length >
                                    1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        removeWorkExperience(exp.id)
                                      }
                                      className="rounded-full"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`company-${exp.id}`}>
                                      Company
                                    </Label>
                                    <Input
                                      id={`company-${exp.id}`}
                                      value={exp.company}
                                      onChange={(e) =>
                                        handleWorkExperienceChange(
                                          exp.id,
                                          "company",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Company Name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`position-${exp.id}`}>
                                      Position
                                    </Label>
                                    <Input
                                      id={`position-${exp.id}`}
                                      value={exp.position}
                                      onChange={(e) =>
                                        handleWorkExperienceChange(
                                          exp.id,
                                          "position",
                                          e.target.value,
                                        )
                                      }
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
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        exp.id,
                                        "current",
                                        e.target.checked,
                                      )
                                    }
                                    className="rounded"
                                  />
                                  <Label htmlFor={`current-${exp.id}`}>
                                    I currently work here
                                  </Label>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label htmlFor={`description-${exp.id}`}>
                                      Description
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        generateExperienceWithAI(exp.id)
                                      }
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
                                    onChange={(value) =>
                                      handleWorkExperienceChange(
                                        exp.id,
                                        "description",
                                        value,
                                      )
                                    }
                                    placeholder="Describe your responsibilities and achievements..."
                                  />
                                </div>
                              </div>
                            ),
                          )}

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
                      <Card className="bg-card border-0 shadow rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                              Education
                            </CardTitle>
                            <CardDescription>
                              Update your educational background
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={handlePreviewToggle}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Resume
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {(resumeData.education || []).map((edu, index) => (
                            <div
                              key={edu.id}
                              className="space-y-4 p-4 border border-border rounded-xl"
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">
                                  Education #{index + 1}
                                </h3>
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
                                  <Label htmlFor={`institution-${edu.id}`}>
                                    Institution
                                  </Label>
                                  <Input
                                    id={`institution-${edu.id}`}
                                    value={edu.institution}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        edu.id,
                                        "institution",
                                        e.target.value,
                                      )
                                    }
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

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Start Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !edu.startDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {edu.startDate ? format(new Date(edu.startDate), "MMM yyyy") : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={edu.startDate ? new Date(edu.startDate) : undefined}
                                        onSelect={(date) => handleEducationChange(edu.id, "startDate", date)}
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
                                          !edu.endDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {edu.endDate ? format(new Date(edu.endDate), "MMM yyyy") : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={edu.endDate ? new Date(edu.endDate) : undefined}
                                        onSelect={(date) => handleEducationChange(edu.id, "endDate", date)}
                                        initialFocus
                                        captionLayout="dropdown"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear() + 5}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label htmlFor={`eduDescription-${edu.id}`}>
                                    Description
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      generateEducationWithAI(edu.id)
                                    }
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
                                  onChange={(value) =>
                                    handleEducationChange(
                                      edu.id,
                                      "description",
                                      value,
                                    )
                                  }
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
                      <Card className="bg-card border-0 shadow rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                              Skills
                            </CardTitle>
                            <CardDescription>
                              Update your professional skills
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={handlePreviewToggle}
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
                          {(resumeData.skills || []).map((skill, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={skill}
                                onChange={(e) =>
                                  handleSkillsChange(index, e.target.value)
                                }
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
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex gap-3 w-full sm:w-auto sm:order-1 order-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setTemplateSelected(false)}
                        >
                          Change Template
                        </Button>
                      </div>
                      <div className="flex gap-2 sm:order-2 order-1">
                        <Button
                          type="button"
                          variant={
                            activeSection === "personal" ? "outline" : "default"
                          }
                          size="icon"
                          className={`rounded-full w-10 h-10 ${activeSection !== "personal" ? "bg-white text-purple-600 hover:bg-white/90" : ""}`}
                          onClick={() => {
                            let newSection = activeSection; // Default to current section
                            if (activeSection === "personal")
                              newSection = "skills";
                            else if (activeSection === "work")
                              newSection = "personal";
                            else if (activeSection === "education")
                              newSection = "work";
                            else if (activeSection === "skills")
                              newSection = "education";

                            console.log(
                              "Previous button clicked. Current section:",
                              activeSection,
                              "New section:",
                              newSection,
                            );
                            setActiveSection(newSection);
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant={
                            activeSection === "skills" ? "outline" : "default"
                          }
                          size="icon"
                          className={`rounded-full w-10 h-10 ${activeSection !== "skills" ? "bg-white text-purple-600 hover:bg-white/90" : ""}`}
                          onClick={() => {
                            let newSection = activeSection; // Default to current section
                            if (activeSection === "personal")
                              newSection = "work";
                            else if (activeSection === "work")
                              newSection = "education";
                            else if (activeSection === "education")
                              newSection = "skills";
                            else if (activeSection === "skills")
                              newSection = "personal";

                            console.log(
                              "Next button clicked. Current section:",
                              activeSection,
                              "New section:",
                              newSection,
                            );
                            if (newSection) setActiveSection(newSection);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        className="rounded-full w-full sm:w-auto sm:order-3 order-3 ml-auto"
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
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Dock Component */}
        <div className="mt-auto w-full flex justify-center items-center">
          <div className="w-full max-w-4xl flex justify-center">
            <DynamicDock currentPage="resume" showLogout={false} />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
