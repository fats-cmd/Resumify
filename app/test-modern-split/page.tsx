"use client";

import React from "react";
import ModernSplitTemplate from "@/components/templates/modern-split";
import { ResumeData } from "@/types/resume";

export default function TestModernSplitPage() {
  // Sample resume data for testing
  const sampleResumeData: ResumeData = {
    basics: {
      name: "John Doe",
      label: "Senior Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      summary: "Experienced software engineer with 5+ years of experience in full-stack development.",
      location: {
        address: "New York, NY"
      }
    },
    work: [
      {
        name: "Tech Corp",
        position: "Senior Software Engineer",
        startDate: "2020-01-01",
        endDate: "2023-12-31",
        summary: "Led development of multiple web applications using React and Node.js.",
        location: "",
        highlights: []
      }
    ],
    educationItems: [
      {
        institution: "University of Technology",
        area: "Computer Science",
        studyType: "Bachelor of Science",
        startDate: "2016-09-01",
        endDate: "2020-05-31"
      }
    ],
    skillItems: [
      { name: "JavaScript", level: "5" },
      { name: "React", level: "5" },
      { name: "Node.js", level: "4" },
      { name: "Python", level: "3" }
    ],
    references: []
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Modern Split Template Test</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <ModernSplitTemplate data={sampleResumeData} />
      </div>
    </div>
  );
}