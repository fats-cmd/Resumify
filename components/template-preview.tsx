"use client";

import React from "react";
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
    }));

    const educationItems = data.education.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate,
    }));

    const skillItems = data.skills.map((skill) => ({
      name: skill,
      level: "5", // Default to medium proficiency
    }));

    return {
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
    };
  };

  const transformedData = transformResumeData(resumeData);
  
  if (!templateId) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-4">No Template Selected</h2>
        <p className="text-gray-600">
          Please select a template from the templates page or continue with the default format.
        </p>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(templateId);
  
  if (!TemplateComponent) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Template Not Found</h2>
        <p className="text-gray-600">
          The selected template could not be found. Please choose another template.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="max-h-[800px] overflow-auto">
        <TemplateComponent data={transformedData} />
      </div>
    </div>
  );
};

export default TemplatePreview;