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
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getResumes, updateResume } from "@/lib/supabase";
import { toast } from "react-toastify";
import {
  FileText,
  Download,
  Printer,
  Share2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  Menu,
  X,
  Save,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { Resume, ResumeData } from "@/types/resume";
import TemplatePreview from "@/components/template-preview";
import { Sidebar } from "@/components/sidebar";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Add these helper functions for resume editing
const handlePersonalInfoChange = (
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>,
  name: string,
  value: string,
) => {
  setResumeData((prev) => {
    if (!prev) return null;
    return {
      ...prev,
      personalInfo: {
        ...(prev.personalInfo || {
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
    };
  });
};

const handleWorkExperienceChange = (
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>,
  id: number,
  field: string,
  value: string | boolean,
) => {
  setResumeData((prev) => {
    if (!prev) return null;
    return {
      ...prev,
      workExperience: (prev.workExperience || []).map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    };
  });
};

const handleEducationChange = (
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>,
  id: number,
  field: string,
  value: string,
) => {
  setResumeData((prev) => {
    if (!prev) return null;
    return {
      ...prev,
      education: (prev.education || []).map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    };
  });
};

const handleSkillsChange = (
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>,
  index: number,
  value: string,
) => {
  setResumeData((prev) => {
    if (!prev) return null;
    const currentSkills = prev.skills || [""];
    const newSkills = [...currentSkills];
    newSkills[index] = value;
    return {
      ...prev,
      skills: newSkills,
    };
  });
};

export default function ResumePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState<{
    [key: number]: boolean;
  }>({});
  const [isGeneratingEducation, setIsGeneratingEducation] = useState<{
    [key: number]: boolean;
  }>({});
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Fetch the resume data from Supabase
  useEffect(() => {
    const fetchResume = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        const { data, error } = await getResumes(user.id);

        if (error) {
          console.error("Error fetching resume:", error);
          toast.error("Failed to load resume. Please try again later.");
          router.push("/dashboard");
        } else {
          const resume = data?.find(
            (r: Resume) => r.id === parseInt(id as string),
          );
          if (resume) {
            console.log("Fetched resume:", resume);
            console.log("Resume data:", resume.data);
            console.log("Resume templateId:", resume.data.templateId);
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

  // const handleDownload = async () => {
  //   if (!user || !id) {
  //     toast.error("You must be logged in to download a resume.");
  //     return;
  //   }

  //   try {
  //     // Show loading toast
  //     toast.info("Generating PDF...");

  //     // Debug logging
  //     console.log('Client - Download parameters:', {
  //       id,
  //       userId: user.id,
  //       idType: typeof id,
  //       userIdType: typeof user.id
  //     });

  //     // Test the parameters first
  //     const testResponse = await fetch(`/api/test-params?id=${id}&userId=${user.id}`);
  //     const testResult = await testResponse.json();
  //     console.log('Client - Test API result:', testResult);

  //     // Call the Puppeteer API to generate PDF
  //     const response = await fetch(`/api/generate-pdf?id=${id}&userId=${user.id}`);

  //     console.log('Client - API Response status:', response.status);
  //     console.log('Client - API Response headers:', [...response.headers.entries()]);

  //     if (!response.ok) {
  //       let errorData;
  //       try {
  //         errorData = await response.json();
  //       } catch (jsonError) {
  //         // If JSON parsing fails, try to get text
  //         try {
  //           const errorText = await response.text();
  //           console.error('Client - API Error (text):', errorText);
  //           errorData = { error: `HTTP ${response.status}: ${errorText || response.statusText}` };
  //         } catch (textError) {
  //           console.error('Client - API Error (failed to parse):', textError);
  //           errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
  //         }
  //       }

  //       console.error('Client - API Error:', errorData);
  //       throw new Error(errorData.error || "Failed to generate PDF");
  //     }

  //     // Get the PDF blob
  //     const blob = await response.blob();

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;

  //     // Generate filename
  //     const firstName = (resumeData?.personalInfo?.firstName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
  //     const lastName = (resumeData?.personalInfo?.lastName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  //     const filename = `${firstName}_${lastName}_Resume.pdf`;

  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();

  //     // Clean up
  //     setTimeout(() => {
  //       document.body.removeChild(a);
  //       window.URL.revokeObjectURL(url);
  //       toast.dismiss();
  //       toast.success("Resume PDF downloaded successfully!");
  //     }, 100);

  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     toast.dismiss();

  //     if (error instanceof Error) {
  //       toast.error(`Error: ${error.message}`);
  //     } else {
  //       toast.error("Failed to generate resume PDF. Please try again.");
  //     }
  //   }
  // };
  // React-PDF based PDF generation (high-quality vector PDF)
  const handleDownloadReactPDF = async () => {
    if (!resumeData) {
      toast.error("Resume data not available for PDF generation.");
      return;
    }

    try {
      toast.info("Generating high-quality PDF...");

      // Import react-pdf components dynamically
      const { ResumePDF } = await import("@/components/resume-pdf");
      const { pdf } = await import("@react-pdf/renderer");

      // Generate PDF blob from React component
      const blob = await pdf(<ResumePDF data={resumeData} templateId={validTemplateId} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename
      const firstName = (resumeData.personalInfo?.firstName || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');
      const lastName = (resumeData.personalInfo?.lastName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${firstName}_${lastName}_Resume_VectorPDF.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("High-quality PDF generated successfully!");

    } catch (error) {
      console.error("React-PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try the standard download.");
    }
  };

  const handlePrint = () => {
    toast.info("Preparing resume for printing...");

    // Add print-specific styles
    const printStyles = document.createElement("style");
    printStyles.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .pdf-content, .pdf-content * {
          visibility: visible;
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .pdf-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          box-shadow: none !important;
        }
        .pdf-content .absolute {
          display: none !important;
        }
        .no-print, .no-print * {
          display: none !important;
        }
        /* Hide browser default headers/footers */
        @page {
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Add no-print class to elements we don't want to print
    const header = document.querySelector("header");
    const dock = document.querySelector(".fixed.bottom-8");
    const buttons = document.querySelectorAll("button");

    if (header) header.classList.add("no-print");
    if (dock) dock.classList.add("no-print");
    buttons.forEach((button) => button.classList.add("no-print"));

    // Print after a short delay to ensure styles are applied
    setTimeout(() => {
      window.print();

      // Clean up after print
      setTimeout(() => {
        document.head.removeChild(printStyles);
        if (header) header.classList.remove("no-print");
        if (dock) dock.classList.remove("no-print");
        buttons.forEach((button) => button.classList.remove("no-print"));
      }, 1000);
    }, 500);
  };

  const handleShare = () => {
    toast.success("Resume shared successfully!");
    // In a real app, this would open sharing options
  };

  // Handle preview toggle
  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
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
    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Add new work experience
  const addWorkExperience = () => {
    if (!resumeData) return;
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
    if (!resumeData) return;
    const currentWorkExperience = resumeData.workExperience || [];
    if (currentWorkExperience.length > 1) {
      setResumeData({
        ...resumeData,
        workExperience: currentWorkExperience.filter((exp) => exp.id !== id),
      });
    }
  };

  // Add new education
  const addEducation = () => {
    if (!resumeData) return;
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
    if (!resumeData) return;
    const currentEducation = resumeData.education || [];
    if (currentEducation.length > 1) {
      setResumeData({
        ...resumeData,
        education: currentEducation.filter((edu) => edu.id !== id),
      });
    }
  };

  // Add new skill
  const addSkill = () => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      skills: [...(resumeData.skills || []), ""],
    });
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (!resumeData) return;
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

    if (!user || !resumeData) {
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
      }
    } catch (err) {
      console.error("Error updating resume:", err);
      toast.error("Error updating resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // AI Helper Functions
  const generateSummaryWithAI = async () => {
    if (!resumeData) return;
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

        setResumeData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            personalInfo: {
              ...(prev.personalInfo || {
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
          };
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
    if (!resumeData) return;
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
          handleWorkExperienceChange(
            resumeData,
            setResumeData,
            id,
            "description",
            result.result[0],
          );
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
    if (!resumeData) return;
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
            resumeData,
            setResumeData,
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
    if (!resumeData) return;
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

        setResumeData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            skills: skills,
          };
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

  // Show a message if resumeData is null (shouldn't happen due to the redirect above, but for safety)
  if (!resumeData) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden p-8">
            <CardContent className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Resume Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The requested resume could not be found.
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedPage>
    );
  }

  // Ensure templateId is a valid number
  const validTemplateId =
    resumeData.templateId &&
    typeof resumeData.templateId === "number" &&
    resumeData.templateId > 0
      ? resumeData.templateId
      : null;

  console.log("Resume templateId:", resumeData.templateId);
  console.log("Valid templateId:", validTemplateId);

  return (
    <ProtectedPage>
      <style jsx global>{`
        .pdf-content,
        .pdf-content * {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .pdf-content h1,
        .pdf-content h2,
        .pdf-content h3,
        .pdf-content h4,
        .pdf-content h5,
        .pdf-content h6 {
          color: #000000 !important;
        }
        .pdf-content p,
        .pdf-content span,
        .pdf-content div {
          color: #000000 !important;
        }
        .pdf-content .text-muted-foreground {
          color: #666666 !important;
        }

        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .pdf-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background-color: transparent !important; /* Allow template backgrounds to show */
          }
          .pdf-content .rounded-2xl {
            border-radius: 1rem !important;
          }
          .pdf-content .shadow-lg {
            box-shadow:
              0 10px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          .pdf-content .p-8 {
            padding: 2rem !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
          }
          .pdf-content .absolute {
            position: absolute !important;
          }
          /* Prevent browser from adding headers/footers */
          @page {
            margin: 0;
          }
          /* Preserve template background colors */
          .pdf-content .bg-gray-800 {
            background-color: #1f2937 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .pdf-content .bg-amber-500 {
            background-color: #f59e0b !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .pdf-content .text-white {
            color: #ffffff !important;
          }
        }
      `}</style>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 bg-background transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0 lg:h-screen ${
            sidebarCollapsed ? "w-16 lg:w-16" : "w-64 lg:w-80"
          }`}
        >
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
                <Sidebar
                  currentPage="resume"
                  onClose={() => setSidebarOpen(false)}
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={() =>
                    setSidebarCollapsed(!sidebarCollapsed)
                  }
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
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"
          }`}
        >
          {/* Header with gradient - Not Fixed */}
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
                  <button className="focus:outline-none focus:ring-2 focus:ring-gray-500/50 rounded-full p-1">
                    {getUserAvatar()}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {resumeData.personalInfo?.firstName}{" "}
                    {resumeData.personalInfo?.lastName}&apos;s Resume
                  </h1>
                  <p className="text-gray-700 mt-2 dark:text-white">
                    {resumeData.personalInfo?.headline}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button
                    onClick={handleDownloadReactPDF}
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="bg-background/80 text-foreground border-border hover:bg-accent rounded-full"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-background/80 text-foreground border-border hover:bg-accent rounded-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-background/80 text-foreground border-border hover:bg-accent rounded-full"
                  >
                    <Link href={`/edit/${id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto py-6">
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

              <div className="grid grid-cols-1 gap-8">
                {/* Main Content - Full Width */}
                <div className="col-span-1">
                  {showPreview ? (
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
                          templateId={validTemplateId}
                          resumeData={{
                            personalInfo: {
                              firstName:
                                resumeData.personalInfo?.firstName || "",
                              lastName: resumeData.personalInfo?.lastName || "",
                              email: resumeData.personalInfo?.email || "",
                              phone: resumeData.personalInfo?.phone || "",
                              location: resumeData.personalInfo?.location || "",
                              headline: resumeData.personalInfo?.headline || "",
                              summary: resumeData.personalInfo?.summary || "",
                            },
                            workExperience: resumeData.workExperience || [],
                            education: resumeData.education || [],
                            skills: resumeData.skills || [],
                          }}
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
                              <Label htmlFor="image-upload">
                                Profile Image
                              </Label>
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
                                  value={
                                    resumeData.personalInfo?.firstName || ""
                                  }
                                  onChange={(e) =>
                                    handlePersonalInfoChange(
                                      resumeData,
                                      setResumeData,
                                      "firstName",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="John"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  value={
                                    resumeData.personalInfo?.lastName || ""
                                  }
                                  onChange={(e) =>
                                    handlePersonalInfoChange(
                                      resumeData,
                                      setResumeData,
                                      "lastName",
                                      e.target.value,
                                    )
                                  }
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
                                onChange={(e) =>
                                  handlePersonalInfoChange(
                                    resumeData,
                                    setResumeData,
                                    "headline",
                                    e.target.value,
                                  )
                                }
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
                                    onChange={(e) =>
                                      handlePersonalInfoChange(
                                        resumeData,
                                        setResumeData,
                                        "email",
                                        e.target.value,
                                      )
                                    }
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
                                    onChange={(e) =>
                                      handlePersonalInfoChange(
                                        resumeData,
                                        setResumeData,
                                        "phone",
                                        e.target.value,
                                      )
                                    }
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
                                  value={
                                    resumeData.personalInfo?.location || ""
                                  }
                                  onChange={(e) =>
                                    handlePersonalInfoChange(
                                      resumeData,
                                      setResumeData,
                                      "location",
                                      e.target.value,
                                    )
                                  }
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
                                  handlePersonalInfoChange(
                                    resumeData,
                                    setResumeData,
                                    "summary",
                                    value,
                                  )
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
                                            resumeData,
                                            setResumeData,
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
                                            resumeData,
                                            setResumeData,
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
                                      <Label htmlFor={`startDate-${exp.id}`}>
                                        Start Date
                                      </Label>
                                      <Input
                                        id={`startDate-${exp.id}`}
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) =>
                                          handleWorkExperienceChange(
                                            resumeData,
                                            setResumeData,
                                            exp.id,
                                            "startDate",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`endDate-${exp.id}`}>
                                        End Date
                                      </Label>
                                      <Input
                                        id={`endDate-${exp.id}`}
                                        type="month"
                                        value={exp.endDate}
                                        onChange={(e) =>
                                          handleWorkExperienceChange(
                                            resumeData,
                                            setResumeData,
                                            exp.id,
                                            "endDate",
                                            e.target.value,
                                          )
                                        }
                                        disabled={exp.current}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`current-${exp.id}`}
                                      checked={exp.current}
                                      onChange={(e) =>
                                        handleWorkExperienceChange(
                                          resumeData,
                                          setResumeData,
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
                                        disabled={
                                          isGeneratingExperience[exp.id]
                                        }
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
                                          resumeData,
                                          setResumeData,
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
                                          resumeData,
                                          setResumeData,
                                          edu.id,
                                          "institution",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="University Name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`degree-${edu.id}`}>
                                      Degree
                                    </Label>
                                    <Input
                                      id={`degree-${edu.id}`}
                                      value={edu.degree}
                                      onChange={(e) =>
                                        handleEducationChange(
                                          resumeData,
                                          setResumeData,
                                          edu.id,
                                          "degree",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Bachelor's, Master's, etc."
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`field-${edu.id}`}>
                                    Field of Study
                                  </Label>
                                  <Input
                                    id={`field-${edu.id}`}
                                    value={edu.field}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        resumeData,
                                        setResumeData,
                                        edu.id,
                                        "field",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Computer Science, Business, etc."
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`eduStartDate-${edu.id}`}>
                                      Start Date
                                    </Label>
                                    <Input
                                      id={`eduStartDate-${edu.id}`}
                                      type="month"
                                      value={edu.startDate}
                                      onChange={(e) =>
                                        handleEducationChange(
                                          resumeData,
                                          setResumeData,
                                          edu.id,
                                          "startDate",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`eduEndDate-${edu.id}`}>
                                      End Date
                                    </Label>
                                    <Input
                                      id={`eduEndDate-${edu.id}`}
                                      type="month"
                                      value={edu.endDate}
                                      onChange={(e) =>
                                        handleEducationChange(
                                          resumeData,
                                          setResumeData,
                                          edu.id,
                                          "endDate",
                                          e.target.value,
                                        )
                                      }
                                    />
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
                                        resumeData,
                                        setResumeData,
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
                                    handleSkillsChange(
                                      resumeData,
                                      setResumeData,
                                      index,
                                      e.target.value,
                                    )
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
                        <div className="flex gap-2 sm:order-2 order-1">
                          <Button
                            type="button"
                            variant={
                              activeSection === "personal"
                                ? "outline"
                                : "default"
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
          <div className="mt-auto px-4 sm:px-6 lg:px-8">
            <DynamicDock currentPage="resume" showLogout={false} />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
