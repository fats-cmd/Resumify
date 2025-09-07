"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dock, DockItem } from "@/components/ui/dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getResumes, signOut } from "@/lib/supabase";
import { toast } from 'react-toastify';
import { 
  FileText, 
  Download, 
  Printer,
  Share2,
  Edit,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  LayoutDashboard, 
  LogOut,
  Home,
  Settings,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Resume, ResumeData } from "@/types/resume";

export default function ResumeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap the params promise
  const unwrappedParams = React.use(params);

  // Fetch the resume data from Supabase
  useEffect(() => {
    const fetchResume = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getResumes(user.id);
        
        if (error) {
          console.error("Error fetching resume:", error);
          toast.error("Error fetching resume. Please try again.");
          router.push("/dashboard");
        } else {
          const resume = data?.find((r: Resume) => r.id === parseInt(unwrappedParams.id));
          if (resume) {
            setResumeData(resume.data as ResumeData);
          } else {
            toast.error("Resume not found.");
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        toast.error("Error fetching resume. Please try again.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResume();
    }
  }, [user, unwrappedParams.id, router]);

  const handleDownload = () => {
    toast.success("Resume downloaded successfully!");
    // In a real app, this would trigger a PDF download
  };

  const handlePrint = () => {
    toast.info("Printing resume...");
    window.print();
  };

  const handleShare = () => {
    toast.success("Resume shared successfully!");
    // In a real app, this would open sharing options
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
            <div className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
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
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {resumeData.personalInfo?.firstName} {resumeData.personalInfo?.lastName}&apos;s Resume
                </h1>
                <p className="text-white/80 mt-2">
                  {resumeData.personalInfo?.headline}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button 
                  onClick={handleDownload}
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full"
                >
                  <Link href={`/edit/${unwrappedParams.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
          <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              {/* Personal Info */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  {resumeData.personalInfo?.firstName} {resumeData.personalInfo?.lastName}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {resumeData.personalInfo?.headline}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{resumeData.personalInfo?.email}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{resumeData.personalInfo?.phone}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{resumeData.personalInfo?.location}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-foreground">
                    {resumeData.personalInfo?.summary}
                  </p>
                </div>
              </div>

              {/* Work Experience */}
              {resumeData.workExperience && resumeData.workExperience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    Work Experience
                  </h2>
                  <div className="space-y-6">
                    {resumeData.workExperience.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-blue-500 pl-4 py-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{exp.position}</h3>
                            <p className="text-lg text-muted-foreground">{exp.company}</p>
                          </div>
                          <p className="text-muted-foreground mt-1 sm:mt-0">
                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                          </p>
                        </div>
                        <p className="text-foreground mt-2">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                    Education
                  </h2>
                  <div className="space-y-6">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-green-500 pl-4 py-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{edu.degree}</h3>
                            <p className="text-lg text-muted-foreground">{edu.institution}</p>
                            <p className="text-muted-foreground">{edu.field}</p>
                          </div>
                          <p className="text-muted-foreground mt-1 sm:mt-0">
                            {edu.startDate} - {edu.endDate}
                          </p>
                        </div>
                        <p className="text-foreground mt-2">
                          {edu.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="rounded-full px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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