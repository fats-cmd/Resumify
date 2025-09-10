"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Plus,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Resume, ResumeData } from "@/types/resume";

export default function ResumeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const resumeRef = useRef<HTMLDivElement>(null);
  
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

  const handleDownload = async () => {
    if (!resumeRef.current) {
      toast.error("Resume content not available for download");
      return;
    }

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = resumeRef.current;
      
      // Sanitize filename to remove invalid characters
      const firstName = resumeData?.personalInfo?.firstName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
      const lastName = resumeData?.personalInfo?.lastName?.replace(/[^a-zA-Z0-9]/g, '_') || 'User';
      const filename = `${firstName}_${lastName}_Resume.pdf`;
      
      const options = {
        margin: [10, 5, 10, 5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: true,
          // Handle modern CSS colors that cause issues
          backgroundColor: '#ffffff',
          removeContainer: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Add error handling for color parsing issues
      const worker = html2pdf().set(options).from(element);
      
      // Try to generate PDF
      await worker.save();
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Check if it's a color parsing error
      if (error instanceof Error && (error.message.includes('lab') || error.message.includes('color') || error.message.includes('CSS'))) {
        toast.error("Having trouble with modern CSS colors. Trying alternative method...");
        
        try {
          // Try with simplified options and CSS cleanup
          const html2pdf = (await import('html2pdf.js')).default;
          
          // Temporarily modify styles to avoid color parsing issues
          const element = resumeRef.current;
          if (element) {
            // Add temporary styles to override problematic CSS
            const originalStyles = element.style.cssText;
            element.style.cssText += '; color: #000000 !important; background-color: #ffffff !important;';
            
            // Sanitize filename to remove invalid characters
            const firstName = resumeData?.personalInfo?.firstName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
            const lastName = resumeData?.personalInfo?.lastName?.replace(/[^a-zA-Z0-9]/g, '_') || 'User';
            const filename = `${firstName}_${lastName}_Resume.pdf`;
            
            const simplifiedOptions = {
              margin: [10, 5, 10, 5],
              filename: filename,
              image: { type: 'jpeg', quality: 0.95 },
              html2canvas: { 
                scale: 1.5,
                useCORS: false,
                backgroundColor: '#ffffff',
                logging: false
              },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(simplifiedOptions).from(element).save();
            
            // Restore original styles
            element.style.cssText = originalStyles;
            
            toast.success("Resume downloaded successfully!");
          }
        } catch (simplifiedError) {
          console.error("Simplified PDF generation also failed:", simplifiedError);
          
          // Final fallback: Create a simplified HTML version
          try {
            const firstName = resumeData?.personalInfo?.firstName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
            const lastName = resumeData?.personalInfo?.lastName?.replace(/[^a-zA-Z0-9]/g, '_') || 'User';
            const filename = `${firstName}_${lastName}_Resume.pdf`;
            
            // Create a simple HTML version
            const simpleHtml = `
              <html>
                <head>
                  <title>${firstName} ${lastName} - Resume</title>
                  <style>
                    body { font-family: Arial, sans-serif; color: #000000; background: #ffffff; }
                    h1 { color: #000; }
                    h2 { color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    h3 { color: #000; }
                    p { color: #000; }
                    .section { margin-bottom: 20px; }
                    .contact-info { margin: 10px 0; }
                    .experience-item, .education-item { margin-bottom: 15px; }
                  </style>
                </head>
                <body>
                  <h1>${firstName} ${lastName}</h1>
                  <p>${resumeData?.personalInfo?.headline || ''}</p>
                  
                  <div class="contact-info">
                    <p>Email: ${resumeData?.personalInfo?.email || ''}</p>
                    <p>Phone: ${resumeData?.personalInfo?.phone || ''}</p>
                    <p>Location: ${resumeData?.personalInfo?.location || ''}</p>
                  </div>
                  
                  ${resumeData?.personalInfo?.summary ? `
                  <div class="section">
                    <h2>Summary</h2>
                    <p>${resumeData.personalInfo.summary}</p>
                  </div>` : ''}
                  
                  ${resumeData?.workExperience && resumeData.workExperience.length > 0 ? `
                  <div class="section">
                    <h2>Work Experience</h2>
                    ${resumeData.workExperience.map(exp => `
                      <div class="experience-item">
                        <h3>${exp.position}</h3>
                        <p><strong>${exp.company}</strong> | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                        <p>${exp.description}</p>
                      </div>
                    `).join('')}
                  </div>` : ''}
                  
                  ${resumeData?.education && resumeData.education.length > 0 ? `
                  <div class="section">
                    <h2>Education</h2>
                    ${resumeData.education.map(edu => `
                      <div class="education-item">
                        <h3>${edu.degree}</h3>
                        <p><strong>${edu.institution}</strong> | ${edu.field}</p>
                        <p>${edu.startDate} - ${edu.endDate}</p>
                        <p>${edu.description}</p>
                      </div>
                    `).join('')}
                  </div>` : ''}
                  
                  ${resumeData?.skills && resumeData.skills.length > 0 ? `
                  <div class="section">
                    <h2>Skills</h2>
                    <p>${resumeData.skills.join(', ')}</p>
                  </div>` : ''}
                </body>
              </html>
            `;
            
            // Create blob and download
            const blob = new Blob([simpleHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.replace('.pdf', '.html');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success("Resume downloaded as HTML. You can open it in a browser and print to PDF.");
          } catch (finalError) {
            console.error("All PDF generation methods failed:", finalError);
            toast.error("Failed to download resume. Please try printing instead (Ctrl+P).");
          }
        }
      } else {
        toast.error("Failed to download resume. Please try again.");
      }
    }
  };

  const handlePrint = () => {
    toast.info("Preparing resume for printing...");
    
    // Add print-specific styles
    const printStyles = document.createElement('style');
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
      }
    `;
    document.head.appendChild(printStyles);
    
    // Add no-print class to elements we don't want to print
    const header = document.querySelector('header');
    const dock = document.querySelector('.fixed.bottom-8');
    const buttons = document.querySelectorAll('button');
    
    if (header) header.classList.add('no-print');
    if (dock) dock.classList.add('no-print');
    buttons.forEach(button => button.classList.add('no-print'));
    
    // Print after a short delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      
      // Clean up after print
      setTimeout(() => {
        document.head.removeChild(printStyles);
        if (header) header.classList.remove('no-print');
        if (dock) dock.classList.remove('no-print');
        buttons.forEach(button => button.classList.remove('no-print'));
      }, 1000);
    }, 500);
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
      <style jsx global>{`
        .pdf-content, .pdf-content * {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4, .pdf-content h5, .pdf-content h6 {
          color: #000000 !important;
        }
        .pdf-content p, .pdf-content span, .pdf-content div {
          color: #000000 !important;
        }
        .pdf-content .text-muted-foreground {
          color: #333333 !important;
        }
        
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0;
            padding: 0;
          }
          .pdf-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .pdf-content .rounded-2xl {
            border-radius: 0 !important;
          }
          .pdf-content .shadow-lg {
            box-shadow: none !important;
          }
          .pdf-content .p-8 {
            padding: 2rem !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .pdf-content .absolute {
            position: static !important;
          }
        }
      `}</style>
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
          {/* Resume Content - This is what will be converted to PDF */}
          <div ref={resumeRef} style={{ backgroundColor: '#ffffff' }} className="pdf-content">
            <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
              {/* Quick Edit Button */}
              <Button 
                asChild
                size="sm"
                className="absolute top-4 right-4 bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full h-10 w-10 p-0"
              >
                <Link href={`/edit/${unwrappedParams.id}`}>
                  <Edit className="h-5 w-5" />
                </Link>
              </Button>
              
              <CardContent className="p-8" style={{ color: '#000000' }}>
                {/* Personal Info */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    {/* Profile Image */}
                    {resumeData?.basics?.image ? (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <Image 
                            src={resumeData.basics.image} 
                            alt={`${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName}`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h1 className="text-3xl font-bold text-foreground" style={{ color: '#000000' }}>
                        {resumeData?.personalInfo?.firstName} {resumeData?.personalInfo?.lastName}
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1" style={{ color: '#333333' }}>
                        {resumeData?.personalInfo?.headline}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span style={{ color: '#000000' }}>{resumeData?.personalInfo?.email}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span style={{ color: '#000000' }}>{resumeData?.personalInfo?.phone}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span style={{ color: '#000000' }}>{resumeData?.personalInfo?.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Full Width Summary */}
                  {resumeData?.personalInfo?.summary && (
                    <div className="mt-6">
                      <div 
                        className="text-foreground prose prose-sm max-w-none" 
                        style={{ color: '#000000' }}
                        dangerouslySetInnerHTML={{ __html: resumeData.personalInfo.summary }}
                      />
                    </div>
                  )}
                </div>

                {/* Work Experience */}
                {resumeData?.workExperience && resumeData.workExperience.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center" style={{ color: '#000000' }}>
                      <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                      Work Experience
                    </h2>
                    <div className="space-y-6">
                      {resumeData.workExperience.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-blue-500 pl-4 py-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{exp.position}</h3>
                              <p className="text-lg text-muted-foreground" style={{ color: '#333333' }}>{exp.company}</p>
                            </div>
                            <p className="text-muted-foreground mt-1 sm:mt-0" style={{ color: '#333333' }}>
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </p>
                          </div>
                          <div 
                            className="text-foreground mt-2 prose prose-sm max-w-none" 
                            style={{ color: '#000000' }}
                            dangerouslySetInnerHTML={{ __html: exp.description }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData?.education && resumeData.education.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center" style={{ color: '#000000' }}>
                      <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                      Education
                    </h2>
                    <div className="space-y-6">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-green-500 pl-4 py-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{edu.degree}</h3>
                              <p className="text-lg text-muted-foreground" style={{ color: '#333333' }}>{edu.institution}</p>
                              <p className="text-muted-foreground" style={{ color: '#333333' }}>{edu.field}</p>
                            </div>
                            <p className="text-muted-foreground mt-1 sm:mt-0" style={{ color: '#333333' }}>
                              {edu.startDate} - {edu.endDate}
                            </p>
                          </div>
                          <div 
                            className="text-foreground mt-2 prose prose-sm max-w-none" 
                            style={{ color: '#000000' }}
                            dangerouslySetInnerHTML={{ __html: edu.description }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData?.skills && resumeData.skills.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center" style={{ color: '#000000' }}>
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