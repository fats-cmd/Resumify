"use client";

import React from "react";
import Image from "next/image";
import { ResumeData } from "@/types/resume";

interface ModernSplitTemplateProps {
  data: ResumeData;
}

const ModernSplitTemplate: React.FC<ModernSplitTemplateProps> = ({ data }) => {
  console.log("ModernSplitTemplate received data:", data);
  console.log("ModernSplitTemplate basics:", data.basics);
  console.log("ModernSplitTemplate work:", data.work);
  console.log("ModernSplitTemplate educationItems:", data.educationItems);
  console.log("ModernSplitTemplate skillItems:", data.skillItems);
  
  // Check if required data is present
  if (!data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error: No data provided to template</h2>
        <p>Please check the resume data structure.</p>
      </div>
    );
  }
  
  // Check if basics data is present
  if (!data.basics) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error: Missing basics data</h2>
        <p>The resume is missing basic information.</p>
      </div>
    );
  }

  // Ensure we have default values for all data arrays
  const workItems = data.work || [];
  const educationItems = data.educationItems || [];
  const skillItems = data.skillItems || [];
  const references = data.references || [];

  return (
    <div className="w-full h-full flex flex-col print:w-full print:h-auto">
      {/* Template Container - A4 size ratio */}
      <div className="w-full bg-white shadow-lg mx-auto print:shadow-none print:m-0" style={{ maxWidth: "1000px" }}>
        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 min-h-[1414px] print:min-h-0 print:h-auto">
          {/* Left Column - Dark Background */}
          <div className="col-span-1 bg-gray-800 text-white relative print:bg-black print:text-white">
            {/* Yellow diagonal corner */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[150px] border-t-amber-500 border-l-[150px] border-l-transparent transform -scale-x-100 print:border-t-[100px] print:border-l-[100px]"></div>
            
            {/* Profile Image */}
            <div className="relative z-10 mx-auto mt-8 mb-6 md:mt-10 md:mb-6 print:mt-6 print:mb-4">
              <div className="w-32 h-32 rounded-full bg-white p-2 mx-auto overflow-hidden md:w-48 md:h-48 md:p-3 print:w-24 print:h-24 print:p-1">
                {data.basics?.image ? (
                  <Image 
                    src={data.basics.image} 
                    alt={data.basics?.name || "Profile"} 
                    width={192}
                    height={192}
                    className="w-full h-full rounded-full object-cover print:w-24 print:h-24"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold md:text-4xl print:text-xl">
                    {data.basics?.name ? data.basics.name.charAt(0) : "R"}
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="px-6 py-3 md:px-8 md:py-4 print:px-4 print:py-2">
              {/* Section Header with Yellow Accent */}
              <div className="flex items-center mb-3 md:mb-4 print:mb-2">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Contact Me
                </h2>
              </div>
              
              {/* Contact Details */}
              <div className="space-y-3 md:space-y-4 print:space-y-2">
                {/* Phone */}
                {data.basics?.phone && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 md:h-5 md:w-5 md:mr-3 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <div>
                        <p className="text-xs md:text-sm print:text-xs">{data.basics.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Email */}
                {data.basics?.email && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 md:h-5 md:w-5 md:mr-3 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <p className="text-xs break-all md:text-sm print:text-xs">{data.basics.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Website */}
                {data.basics?.website && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 md:h-5 md:w-5 md:mr-3 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs break-all md:text-sm print:text-xs">{data.basics.website}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Location */}
                {data.basics?.location && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 md:h-5 md:w-5 md:mr-3 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs md:text-sm print:text-xs">
                          {[
                            data.basics.location.address,
                            data.basics.location.city,
                            data.basics.location.region,
                            data.basics.location.postalCode,
                            data.basics.location.countryCode
                          ].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-600 w-4/5 mx-auto my-4 md:my-6 print:my-2"></div>
            
            {/* References Section */}
            <div className="px-6 py-3 md:px-8 md:py-4 print:px-4 print:py-2">
              {/* Section Header with Yellow Accent */}
              <div className="flex items-center mb-3 md:mb-4 print:mb-2">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  References
                </h2>
              </div>
              
              {/* References */}
              <div className="space-y-4 md:space-y-6 print:space-y-2">
                {references.map((reference, index) => (
                  <div key={index} className="mb-3 md:mb-4 print:mb-2">
                    <div className="flex items-center mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                      <h3 className="font-bold uppercase text-xs md:text-sm print:text-xs">{reference.name}</h3>
                    </div>
                    <div className="ml-6 space-y-1 text-xs md:ml-8 md:space-y-1 md:text-sm print:ml-4 print:space-y-0 print:text-xs">
                      <p>{reference.position}</p>
                      <p>{reference.company}</p>
                      {reference.phone && <p>Tel: {reference.phone}</p>}
                      {reference.email && <p>Email: {reference.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-600 w-4/5 mx-auto my-4 md:my-6 print:my-2"></div>
            
            {/* Education Section */}
            <div className="px-6 py-3 md:px-8 md:py-4 print:px-4 print:py-2">
              {/* Section Header with Yellow Accent */}
              <div className="flex items-center mb-3 md:mb-4 print:mb-2">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Education
                </h2>
              </div>
              
              {/* Education Items */}
              <div className="space-y-4 md:space-y-6 print:space-y-2">
                {educationItems.map((education, index) => (
                  <div key={index} className="mb-3 md:mb-4 print:mb-2">
                    <div className="flex items-center mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 md:w-2 md:h-2 md:mr-3 print:w-1 print:h-1 print:mr-2"></div>
                      <h3 className="font-bold uppercase text-xs md:text-sm print:text-xs">{education.institution}</h3>
                    </div>
                    <div className="ml-6 space-y-1 text-xs md:ml-8 md:space-y-1 md:text-sm print:ml-4 print:space-y-0 print:text-xs">
                      <p className="font-medium uppercase">{education.studyType} {education.area}</p>
                      <p>{education.startDate && new Date(education.startDate).getFullYear()} - {education.endDate && new Date(education.endDate).getFullYear()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - White Background with Content */}
          <div className="col-span-2 bg-white text-gray-800 relative print:bg-white">
            {/* Yellow bottom corner */}
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[150px] border-b-amber-500 border-l-[150px] border-l-transparent print:border-b-[100px] print:border-l-[100px]"></div>
            
            {/* Header with Name and Title */}
            <div className="p-6 bg-gray-100 border-b border-gray-200 md:p-8 lg:p-10 print:p-4 print:bg-gray-50">
              <div className="relative pl-4 border-l-2 border-amber-500 md:pl-6 md:border-l-3 lg:pl-8 lg:border-l-4 print:pl-3 print:border-l">
                <h1 className="text-2xl font-bold mb-1 md:text-3xl lg:text-5xl print:text-xl">
                  <span className="text-gray-800">{data.basics?.name?.split(' ').slice(0, -1).join(' ') || 'Your'}</span>{' '}
                  <span className="text-amber-500">{data.basics?.name?.split(' ').slice(-1).join(' ') || 'Name'}</span>
                </h1>
                <p className="text-base tracking-wide uppercase text-gray-600 md:text-lg lg:text-xl print:text-sm">{data.basics?.label || 'Your Profession'}</p>
              </div>
            </div>
            
            {/* About Me Section */}
            <div className="p-6 md:p-8 lg:p-10 print:p-4">
              {/* Section Header with Yellow Accent */}
              <div className="flex items-center mb-3 md:mb-4 print:mb-2">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  About Me
                </h2>
              </div>
              
              {/* Summary */}
              <div className="pl-4 mb-5 md:pl-6 md:mb-6 lg:pl-8 lg:mb-8 print:pl-3 print:mb-3">
                {data.basics?.summary ? (
                  <div 
                    className="text-gray-700 leading-relaxed text-xs md:text-sm lg:text-base print:text-xs"
                    dangerouslySetInnerHTML={{ __html: data.basics.summary }}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm lg:text-base print:text-xs">Add your professional summary here...</p>
                )}
              </div>
              
              {/* Job Experience */}
              <div className="flex items-center mb-3 mt-6 md:mb-4 md:mt-8 lg:mt-10 print:mb-2 print:mt-4">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Job Experience
                </h2>
              </div>
              
              {/* Work Experience */}
              <div className="space-y-4 md:space-y-6 lg:space-y-8 pl-4 md:pl-6 lg:pl-8 print:space-y-2 print:pl-3">
                {workItems.map((work, index) => (
                  <div key={index} className="relative pl-4 border-l border-gray-200 md:pl-6 lg:pl-8 print:pl-3">
                    {/* Timeline dot */}
                    <div className="absolute left-[-4px] top-1 w-1.5 h-1.5 rounded-full bg-amber-500 md:left-[-5px] md:w-2 md:h-2 print:left-[-3px] print:w-1 print:h-1"></div>
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start print:flex-col">
                      <div>
                        <h3 className="text-sm font-bold uppercase md:text-base lg:text-lg print:text-sm">{work.position}</h3>
                        <p className="text-gray-600 italic text-xs md:text-sm lg:text-base print:text-xs">{work.name} / {work.location}</p>
                      </div>
                      <p className="text-right text-xs font-medium mt-1 md:mt-0 md:text-sm lg:text-sm print:text-xs print:mt-1 print:text-left">
                        {work.startDate && new Date(work.startDate).getFullYear()} - {work.endDate ? new Date(work.endDate).getFullYear() : 'Present'}
                      </p>
                    </div>
                    
                    <div className="mt-1 md:mt-2 print:mt-1">
                      {work.summary ? (
                        <div 
                          className="text-gray-700 text-xs md:text-sm lg:text-base print:text-xs"
                          dangerouslySetInnerHTML={{ __html: work.summary }}
                        />
                      ) : (
                        <p className="text-gray-700 text-xs md:text-sm lg:text-base print:text-xs">Add your job responsibilities and achievements here...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Skills Section */}
              <div className="flex items-center mb-3 mt-6 md:mb-4 md:mt-8 lg:mt-10 print:mb-2 print:mt-4">
                <div className="w-4 h-8 bg-amber-500 mr-2 md:w-5 md:h-10 md:mr-3 print:w-3 print:h-6 print:mr-2"></div>
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center md:text-lg lg:text-xl print:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500 md:h-5 md:w-5 md:mr-2 print:h-3 print:w-3 print:mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Skills
                </h2>
              </div>
              
              {/* Skills List */}
              <div className="pl-4 grid grid-cols-1 gap-y-2 gap-x-4 md:pl-6 md:grid-cols-2 md:gap-y-3 md:gap-x-6 lg:pl-8 lg:grid-cols-2 lg:gap-y-4 lg:gap-x-8 print:pl-3 print:grid-cols-2 print:gap-y-1 print:gap-x-3">
                {skillItems.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-xs md:text-sm lg:text-base print:text-xs">{skill.name}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 lg:h-2.5 print:h-1">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full md:h-2 lg:h-2.5 print:h-1" 
                        style={{ width: `${skill.level ? parseInt(skill.level) * 10 : 50}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSplitTemplate;