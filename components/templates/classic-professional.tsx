"use client";

import React from "react";
import Image from "next/image";
import { ResumeData } from "@/types/resume";

interface ClassicProfessionalTemplateProps {
  data: ResumeData;
}

const ClassicProfessionalTemplate: React.FC<ClassicProfessionalTemplateProps> = ({ data }) => {
  console.log("ClassicProfessionalTemplate received data:", data);

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
  const languages = data.languages || [];
  const projects = data.projects || [];

  return (
    <div className="w-full h-full flex flex-col print:w-full print:h-auto">
      {/* Template Container - A4 size ratio */}
      <div className="w-full bg-white shadow-lg mx-auto print:shadow-none print:m-0" style={{ maxWidth: "1000px" }}>
        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 min-h-[1414px] print:min-h-0 print:h-auto">
          {/* Left Column - Blue Background */}
          <div className="col-span-1 bg-blue-800 text-white relative print:bg-blue-900 print:text-white">

            {/* Profile Image */}
            <div className="relative z-10 mx-auto mt-8 mb-6 md:mt-10 md:mb-8 print:mt-6 print:mb-4">
              <div className="w-32 h-32 rounded-full bg-white p-2 mx-auto overflow-hidden md:w-40 md:h-40 md:p-3 print:w-24 print:h-24 print:p-1">
                {data.basics?.image ? (
                  <Image
                    src={data.basics.image}
                    alt={data.basics?.name || "Profile"}
                    width={160}
                    height={160}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold md:text-3xl print:text-xl">
                    {data.basics?.name ? data.basics.name.charAt(0) : "R"}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-6 py-4 md:px-8 md:py-6 print:px-4 print:py-3">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 md:text-xl print:text-base">
                Contacts
              </h2>

              {/* Contact Details */}
              <div className="space-y-4 md:space-y-5 print:space-y-2">
                {/* Phone */}
                {data.basics?.phone && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 md:h-5 md:w-5 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <p className="text-sm md:text-base print:text-xs">{data.basics.phone}</p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {data.basics?.email && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 md:h-5 md:w-5 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <p className="text-sm break-all md:text-base print:text-xs">{data.basics.email}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {data.basics?.location && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 md:h-5 md:w-5 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm md:text-base print:text-xs">
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
                )}

                {/* Website */}
                {data.basics?.website && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 md:h-5 md:w-5 print:h-3 print:w-3 print:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm break-all md:text-base print:text-xs">{data.basics.website}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-blue-600 w-4/5 mx-auto my-6 md:my-8 print:my-3"></div>

            {/* Skills Section */}
            <div className="px-6 py-4 md:px-8 md:py-6 print:px-4 print:py-3">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 md:text-xl print:text-base">
                Skills
              </h2>

              <div className="space-y-3 md:space-y-4 print:space-y-2">
                {skillItems.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0 md:w-3 md:h-3 print:w-1.5 print:h-1.5 print:mr-2"></div>
                    <span className="text-sm md:text-base print:text-xs">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            {projects.length > 0 && (
              <>
                <div className="border-t border-blue-600 w-4/5 mx-auto my-6 md:my-8 print:my-3"></div>
                <div className="px-6 py-4 md:px-8 md:py-6 print:px-4 print:py-3">
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-4 md:text-xl print:text-base">
                    Projects
                  </h2>

                  <div className="space-y-4 md:space-y-6 print:space-y-2">
                    {projects.map((project, index) => (
                      <div key={index}>
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0 md:w-3 md:h-3 print:w-1.5 print:h-1.5 print:mr-2"></div>
                          <h3 className="font-bold text-sm md:text-base print:text-xs">{project.name}</h3>
                        </div>
                        <div className="ml-5 md:ml-6 print:ml-4">
                          {project.description && (
                            <p className="text-xs mt-1 md:text-sm print:text-xs">{project.description}</p>
                          )}
                          {project.url && (
                            <p className="text-xs mt-1 md:text-sm print:text-xs text-blue-300">{project.url}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Languages Section */}
            {languages.length > 0 && (
              <>
                <div className="border-t border-blue-600 w-4/5 mx-auto my-6 md:my-8 print:my-3"></div>
                <div className="px-6 py-4 md:px-8 md:py-6 print:px-4 print:py-3">
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-4 md:text-xl print:text-base">
                    Language
                  </h2>

                  <div className="space-y-4 md:space-y-6 print:space-y-2">
                    {languages.map((language, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium md:text-base print:text-xs">{language.language}</span>
                        </div>
                        <div className="w-full bg-blue-600 rounded-full h-1 md:h-1.5 print:h-0.5">
                          <div
                            className="bg-white h-1 rounded-full md:h-1.5 print:h-0.5"
                            style={{ width: `${language.fluency === 'Native' ? 100 : language.fluency === 'Fluent' ? 90 : language.fluency === 'Intermediate' ? 70 : 50}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Light Gray Background */}
          <div className="col-span-2 bg-gray-100 text-gray-800 relative print:bg-gray-50">

            {/* Header with Name and Title */}
            <div className="p-8 bg-white md:p-10 lg:p-12 print:p-6">
              <div className="mb-4 md:mb-6 print:mb-3">
                <h1 className="text-3xl font-bold mb-2 text-blue-800 md:text-4xl lg:text-5xl print:text-2xl">
                  {data.basics?.name ? (
                    <>
                      <span>{data.basics.name.split(' ').slice(0, -1).join(' ')}</span>{' '}
                      <span className="text-gray-500">{data.basics.name.split(' ').slice(-1).join(' ')}</span>
                    </>
                  ) : (
                    <>
                      <span>Your</span> <span className="text-gray-500">Name</span>
                    </>
                  )}
                </h1>
                <p className="text-lg tracking-wide uppercase text-gray-600 md:text-xl lg:text-2xl print:text-base">
                  {data.basics?.label || 'Designation Here'}
                </p>
              </div>
            </div>

            {/* About Me Section */}
            <div className="px-8 py-6 md:px-10 md:py-8 lg:px-12 lg:py-10 print:px-6 print:py-4">
              <div className="mb-6 md:mb-8 print:mb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-blue-800 border-b-2 border-blue-800 pb-2 md:text-2xl print:text-lg print:mb-2">
                  About Me
                </h2>

                <div className="mt-4 md:mt-6 print:mt-2">
                  {data.basics?.summary ? (
                    <div
                      className="rich-text-content text-gray-700 leading-relaxed text-sm md:text-base print:text-xs"
                      dangerouslySetInnerHTML={{ __html: data.basics.summary }}
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base print:text-xs">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi Lorem ipsum dolor sit amet, consectetur adipiscing elit
                    </p>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="mb-6 md:mb-8 print:mb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-blue-800 border-b-2 border-blue-800 pb-2 md:text-2xl print:text-lg print:mb-2">
                  Education
                </h2>

                <div className="space-y-6 md:space-y-8 print:space-y-3">
                  {educationItems.map((education, index) => (
                    <div key={index} className="relative pl-6 md:pl-8 print:pl-4">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-blue-800 md:w-4 md:h-4 print:w-2 print:h-2"></div>

                      <div>
                        <h3 className="text-lg font-bold md:text-xl print:text-base">{education.institution || 'ABC University'}</h3>
                        <p className="text-gray-600 text-sm md:text-base print:text-xs mt-1">
                          {education.studyType && education.area ? `${education.studyType} in ${education.area}` : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
                        </p>
                        {(education.startDate || education.endDate) && (
                          <p className="text-gray-500 text-sm mt-1 md:text-base print:text-xs">
                            {education.startDate && new Date(education.startDate).getFullYear()} - {education.endDate ? new Date(education.endDate).getFullYear() : 'Present'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div className="mb-6 md:mb-8 print:mb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-blue-800 border-b-2 border-blue-800 pb-2 md:text-2xl print:text-lg print:mb-2">
                  Experience
                </h2>

                <div className="space-y-6 md:space-y-8 print:space-y-3">
                  {workItems.map((work, index) => (
                    <div key={index} className="relative pl-6 md:pl-8 print:pl-4">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-blue-800 md:w-4 md:h-4 print:w-2 print:h-2"></div>

                      <div>
                        <h3 className="text-lg font-bold md:text-xl print:text-base">{work.position || 'Job Title'}</h3>
                        <p className="text-gray-600 font-medium text-sm md:text-base print:text-xs">{work.name || 'Company Name'}</p>
                        {(work.startDate || work.endDate) && (
                          <p className="text-gray-500 text-sm mt-1 md:text-base print:text-xs">
                            {work.startDate && new Date(work.startDate).getFullYear()} - {work.endDate ? new Date(work.endDate).getFullYear() : 'Present'}
                          </p>
                        )}
                        <div className="mt-3 md:mt-4 print:mt-2">
                          {work.summary ? (
                            <div
                              className="rich-text-content text-gray-700 text-sm md:text-base print:text-xs"
                              dangerouslySetInnerHTML={{ __html: work.summary }}
                            />
                          ) : (
                            <p className="text-gray-700 text-sm md:text-base print:text-xs">
                              Add your job responsibilities and achievements here...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicProfessionalTemplate;