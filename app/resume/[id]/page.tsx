"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { DynamicDock } from "@/components/dynamic-dock";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getResumes } from "@/lib/supabase";
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
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Resume, ResumeData } from "@/types/resume";
import { getTemplateComponent, getTemplateById } from "@/components/template-registry";
import TemplatePreview from "@/components/template-preview";

export default function ResumePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Fetch the resume data from Supabase
  useEffect(() => {
    const fetchResume = async () => {
      if (!user || !id) return;
      
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
          const resume = data?.find((r: Resume) => r.id === parseInt(id as string));
          if (resume) {
            console.log("Fetched resume data:", resume);
            console.log("Resume templateId:", resume.data.templateId);
            console.log("Resume data structure:", JSON.stringify(resume.data, null, 2));
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
  }, [user, id, router]);

  const handleDownload = async () => {
    if (!resumeData) {
      toast.error("Resume data not available for download");
      return;
    }

    try {
      // Show loading toast
      toast.info("Preparing PDF for download...");
      
      // Create a completely isolated HTML document for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.minHeight = '297mm';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }
      
      // Write a completely clean HTML document with print-optimized styles
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              padding: 20px;
              width: 210mm;
              min-height: 297mm;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #000000;
              margin: 0 0 10px 0;
            }
            h1 {
              font-size: 28px;
              margin: 0 0 10px 0;
            }
            h2 {
              font-size: 20px;
              border-bottom: 1px solid #000000;
              padding-bottom: 5px;
              margin: 0 0 15px 0;
            }
            h3 {
              font-size: 16px;
              margin: 0 0 5px 0;
            }
            p {
              color: #000000;
              margin: 0 0 10px 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .contact-info {
              text-align: center;
              margin-bottom: 30px;
            }
            .experience-item, .education-item {
              margin-bottom: 20px;
            }
            .flex-between {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .text-muted {
              color: #333333;
            }
            
            /* Print-specific styles */
            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              body {
                margin: 0;
                padding: 20px;
                background-color: #ffffff;
                color: #000000;
              }
            }
          </style>
        </head>
        <body>
        </body>
        </html>
      `);
      iframeDoc.close();
      
      // Build the resume content in the iframe
      let html = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1>
            ${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}
          </h1>
          ${resumeData.personalInfo?.headline ? 
            `<p class="text-muted">${resumeData.personalInfo.headline}</p>` : ''}
        </div>
      `;
      
      // Contact information
      const contactInfo = [];
      if (resumeData.personalInfo?.email) contactInfo.push(`Email: ${resumeData.personalInfo.email}`);
      if (resumeData.personalInfo?.phone) contactInfo.push(`Phone: ${resumeData.personalInfo.phone}`);
      if (resumeData.personalInfo?.location) contactInfo.push(`Location: ${resumeData.personalInfo.location}`);
      
      if (contactInfo.length > 0) {
        html += `
          <div class="contact-info">
            <p>${contactInfo.join(' | ')}</p>
          </div>
        `;
      }
      
      // Summary
      if (resumeData.personalInfo?.summary) {
        html += `
          <div class="section">
            <h2>Summary</h2>
            <p>${resumeData.personalInfo.summary}</p>
          </div>
        `;
      }
      
      // Work Experience
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        html += `
          <div class="section">
            <h2>Work Experience</h2>
        `;
        
        resumeData.workExperience.forEach(exp => {
          html += `
            <div class="experience-item">
              <div class="flex-between">
                <h3>${exp.position}</h3>
                <p class="text-muted">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</p>
              </div>
              <p class="text-muted">${exp.company}</p>
              <p>${exp.description}</p>
            </div>
          `;
        });
        
        html += `</div>`;
      }
      
      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        html += `
          <div class="section">
            <h2>Education</h2>
        `;
        
        resumeData.education.forEach(edu => {
          html += `
            <div class="education-item">
              <div class="flex-between">
                <h3>${edu.degree}</h3>
                <p class="text-muted">${edu.startDate} - ${edu.endDate}</p>
              </div>
              <p class="text-muted">${edu.institution}</p>
              <p class="text-muted">${edu.field}</p>
              <p>${edu.description}</p>
            </div>
          `;
        });
        
        html += `</div>`;
      }
      
      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        html += `
          <div class="section">
            <h2>Skills</h2>
            <p>${resumeData.skills.join(', ')}</p>
          </div>
        `;
      }
      
      // Add the content to the iframe
      iframeDoc.body.innerHTML = html;
      
      // Sanitize filename for the print dialog
      const firstName = (resumeData.personalInfo?.firstName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
      const lastName = (resumeData.personalInfo?.lastName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${firstName}_${lastName}_Resume.pdf`;
      
      // Set the document title for the print dialog
      iframeDoc.title = filename;
      
      // Small delay to ensure content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Focus the iframe and trigger print
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up after a delay to allow printing
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        toast.dismiss();
        toast.success("Resume PDF download started. Check your browser's print dialog.");
      }, 2000);
      
    } catch (error) {
      console.error("Error preparing PDF:", error);
      toast.dismiss();
      
      // Clean up in case of error
      const iframe = document.querySelector('iframe[style*="position: absolute; top: -9999px;"]');
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to prepare resume for download. Please try again.");
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

  if (loading) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-background">
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
  const validTemplateId = resumeData.templateId && typeof resumeData.templateId === 'number' && resumeData.templateId > 0 
    ? resumeData.templateId 
    : null;

  console.log("Resume data templateId:", resumeData.templateId, "Valid templateId:", validTemplateId);

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
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          .pdf-content .p-8 {
            padding: 2rem !important;
          }
          .no-print, .no-print * {
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
      <div className="min-h-screen bg-background pb-20">
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
                  <Link href={`/edit/${id}`}>
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
          <div ref={resumeRef} className="pdf-content">
            {/* Debug information - Remove this in production */}
            <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded hidden">
              Template ID: {resumeData.templateId ?? 'null'} | Type: {typeof resumeData.templateId} | Valid Template ID: {validTemplateId ?? 'null'}
            </div>
            
            {/* Check if resume has a template ID and display using template */}
            {validTemplateId ? (
              <div className="rounded-lg shadow-lg">
                <TemplatePreview 
                  templateId={validTemplateId} 
                  resumeData={{
                    personalInfo: {
                      firstName: resumeData.personalInfo?.firstName || "",
                      lastName: resumeData.personalInfo?.lastName || "",
                      email: resumeData.personalInfo?.email || "",
                      phone: resumeData.personalInfo?.phone || "",
                      location: resumeData.personalInfo?.location || "",
                      headline: resumeData.personalInfo?.headline || "",
                      summary: resumeData.personalInfo?.summary || ""
                    },
                    workExperience: resumeData.workExperience || [],
                    education: resumeData.education || [],
                    skills: resumeData.skills || []
                  }} 
                  imagePreview={resumeData.basics?.image || null} 
                />
              </div>
            ) : (
              // Fallback to default display if no template
              <Card className="bg-card border-0 shadow-lg rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                {/* Quick Edit Button */}
                <Button 
                  asChild
                  size="sm"
                  className="absolute top-4 right-4 bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full h-10 w-10 p-0 no-print"
                >
                  <Link href={`/edit/${id}`}>
                    <Edit className="h-5 w-5" />
                  </Link>
                </Button>
                
                <CardContent className="p-8" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
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
                        <h1 className="text-3xl font-bold text-foreground">
                          {resumeData?.personalInfo?.firstName} {resumeData?.personalInfo?.lastName}
                        </h1>
                        <p className="text-lg text-muted-foreground mt-1">
                          {resumeData?.personalInfo?.headline}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{resumeData?.personalInfo?.email}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{resumeData?.personalInfo?.phone}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{resumeData?.personalInfo?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Full Width Summary */}
                    {resumeData?.personalInfo?.summary && (
                      <div className="mt-6">
                        <div 
                          className="text-foreground prose prose-sm max-w-none" 
                          dangerouslySetInnerHTML={{ __html: resumeData.personalInfo.summary }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Work Experience */}
                  {resumeData?.workExperience && resumeData.workExperience.length > 0 && (
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
                            <div 
                              className="text-foreground mt-2 prose prose-sm max-w-none" 
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
                            <div 
                              className="text-foreground mt-2 prose prose-sm max-w-none" 
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
            )}
          </div>
        
          {/* Dynamic Dock Component */}
          <DynamicDock currentPage="resume" showLogout={false} />
        </div>
      </div>
    </ProtectedPage>
  );
}
