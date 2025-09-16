"use client";

import React from "react";
import Image from "next/image";
import { getTemplateComponent } from "@/components/template-registry";
import { ResumeData } from "@/types/resume";

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

interface TemplatePreviewProps {
  templateId: number | null;
  resumeData: FormResumeData;
  imagePreview?: string | null; // Add image preview prop
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId, resumeData, imagePreview }) => {
  console.log("TemplatePreview props:", { templateId, resumeData, imagePreview });
  
  // Ensure templateId is a valid number
  const validTemplateId = templateId && typeof templateId === 'number' && templateId > 0 ? templateId : null;
  
  // Convert the resume data to the format expected by the template
  const transformResumeData = (data: FormResumeData): ResumeData => {
    // Transform from form data to template-compatible format
    const basics = {
      name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim(),
      label: data.personalInfo.headline,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      summary: data.personalInfo.summary,
      location: data.personalInfo.location ? {
        address: data.personalInfo.location,
      } : undefined,
      image: imagePreview || undefined // Use imagePreview instead of undefined
    };

    const work = data.workExperience.map((exp) => ({
      name: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.current ? undefined : exp.endDate,
      summary: exp.description,
      location: "",
      highlights: exp.description ? [exp.description] : [],
    }));

    const educationItems = data.education.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate,
    }));

    const skillItems = data.skills.filter(skill => skill.trim() !== "").map((skill) => ({
      name: skill.trim(),
      level: "5", // Default to medium proficiency
    }));

    const result = {
      basics,
      work,
      educationItems,
      skillItems,
      references: [], // Add empty references array
      // Original structure with conversion
      personalInfo: data.personalInfo,
      workExperience: data.workExperience,
      education: data.education,
      skills: data.skills,
      // Include templateId in the result for debugging
      templateId: validTemplateId || undefined
    };
    
    console.log("Transformed resume data:", result);
    return result;
  };

  const transformedData = transformResumeData(resumeData);
  
  // If no template is selected (null or undefined), show a message but still allow preview with default styling
  if (!validTemplateId) {
    console.log("No valid templateId, showing default preview");
    return (
      <div className="rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-bold mb-4 text-center">Default Preview</h2>
        <p className="text-gray-600 text-center mb-6">
          This is a default preview of your resume. Select a template for a more polished look.
        </p>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-6">
            {transformedData?.basics?.image ? (
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                <Image 
                  src={transformedData.basics.image} 
                  alt={transformedData.basics.name || "Profile"} 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-500">
                  {transformedData?.basics?.name ? transformedData.basics.name.charAt(0) : "R"}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold">{transformedData?.basics?.name || "Your Name"}</h1>
            <p className="text-gray-600">{transformedData?.basics?.label || "Professional Title"}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Contact Information</h2>
              <div className="space-y-2">
                {transformedData?.basics?.email && (
                  <p><span className="font-medium">Email:</span> {transformedData.basics.email}</p>
                )}
                {transformedData?.basics?.phone && (
                  <p><span className="font-medium">Phone:</span> {transformedData.basics.phone}</p>
                )}
                {transformedData?.basics?.location && (
                  <p><span className="font-medium">Location:</span> {transformedData.basics.location.address}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Summary</h2>
              <div 
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: transformedData?.basics?.summary || "Add your professional summary here..." }}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Work Experience</h2>
            <div className="space-y-4">
              {transformedData?.work?.map((work, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-bold">{work.position}</h3>
                  <p className="text-gray-600">{work.name} | {work.startDate} - {work.endDate || "Present"}</p>
                  <div 
                    className="mt-2 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: work.summary || "Add your job responsibilities and achievements here..." }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Education</h2>
            <div className="space-y-4">
              {transformedData?.educationItems?.map((edu, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-bold">{edu.institution}</h3>
                  <p className="text-gray-600">{edu.studyType} in {edu.area}</p>
                  <p className="text-gray-600">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {transformedData?.skillItems?.map((skill, index) => (
                <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(validTemplateId);
  console.log("Template component:", TemplateComponent);
  
  if (!TemplateComponent) {
    console.log("Template component not found for ID:", validTemplateId);
    return (
      <div className="rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Template Not Found</h2>
        <p className="text-gray-600">
          The selected template could not be found. Please choose another template.
        </p>
        <p className="text-gray-400 text-sm mt-4">Template ID: {validTemplateId}</p>
      </div>
    );
  }

  // Render the template component with error boundary
  try {
    return (
      <div className="rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none">
        <div className="overflow-auto print:overflow-visible">
          <TemplateComponent data={transformedData} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering template component:", error);
    return (
      <div className="rounded-lg shadow-lg p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Template Rendering Error</h2>
        <p>An error occurred while rendering the template.</p>
        <p className="text-sm mt-2">Template ID: {validTemplateId}</p>
      </div>
    );
  }
};

export default TemplatePreview;