"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dock, DockItem } from "@/components/ui/dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { saveResume, signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  LayoutDashboard, 
  LogOut,
  Home,
  Settings
} from "lucide-react";

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
        <div className="flex flex-col gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CreateResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle input changes for personal info
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save a resume.");
      return;
    }
    
    setSaving(true);
    
    try {
      // Save the resume data to Supabase
      const { data, error } = await saveResume(user.id, resumeData);
      
      if (error) {
        console.error("Error saving resume:", error);
        toast.error("Error saving resume. Please try again.");
      } else {
        console.log("Resume saved successfully:", data);
        toast.success("Resume saved successfully!");
        // Add a small delay before redirecting so user can see the toast
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      toast.error("Error saving resume. Please try again.");
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

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between w-full mb-8">
              <Link href="/dashboard" className="font-bold text-2xl sm:text-3xl flex items-center">
                <span className="text-white dark:text-white">
                  Resumify
                </span>
              </Link>
              <div>
                {loading ? (
                  <div className="h-7 w-14 bg-white/30 rounded-full animate-pulse"></div>
                ) : (
                  <ThemeToggle className="bg-white/20 border-white/30 hover:bg-white/20" />
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/30 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Create New Resume</h1>
                    <p className="text-white/80 mt-2">
                      Build your professional resume in minutes
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {loading ? (
                  <div className="h-10 w-40 bg-white/30 rounded animate-pulse"></div>
                ) : (
                  <Button 
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full"
                  >
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              {loading ? (
                <SkeletonSidebar />
              ) : (
                <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Resume Sections</CardTitle>
                    <CardDescription>
                      Fill in all sections to create a complete resume
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
                              Save Resume
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="w-full rounded-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
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
                        <Label htmlFor="summary">Professional Summary</Label>
                        <Textarea
                          id="summary"
                          name="summary"
                          value={resumeData.personalInfo.summary}
                          onChange={handlePersonalInfoChange}
                          placeholder="A brief summary of your professional background, skills, and career goals..."
                          rows={4}
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
                            <Label htmlFor={`description-${exp.id}`}>Description</Label>
                            <Textarea
                              id={`description-${exp.id}`}
                              value={exp.description}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleWorkExperienceChange(exp.id, "description", e.target.value)}
                              placeholder="Describe your responsibilities and achievements..."
                              rows={3}
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
                            <Label htmlFor={`eduDescription-${edu.id}`}>Description</Label>
                            <Textarea
                              id={`eduDescription-${edu.id}`}
                              value={edu.description}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEducationChange(edu.id, "description", e.target.value)}
                              placeholder="Additional details about your education..."
                              rows={2}
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