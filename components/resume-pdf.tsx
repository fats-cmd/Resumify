import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Circle } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';

// Helper function to decode HTML entities and strip HTML tags for PDF
function decodeAndStripHTML(content: string | undefined | null): string {
  if (!content || typeof content !== 'string') return '';

  // First decode HTML entities
  let decoded = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');

  // Then strip HTML tags and convert to plain text with bullet points
  return decoded
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
}

// Create styles for the PDF - Classic Professional design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 0,
  },
  leftColumn: {
    flexDirection: 'column',
    width: '33.33%',
    backgroundColor: '#1e40af', // blue-800
    color: '#ffffff',
    padding: 30,
  },
  rightColumn: {
    flexDirection: 'column',
    width: '66.67%',
    backgroundColor: '#f9fafb', // gray-50
    padding: 30,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#ffffff',
    padding: 8,
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileImageInner: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb', // blue-600
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 11,
  },
  contactIcon: {
    width: 12,
    marginRight: 8,
  },
  iconContainer: {
    width: 16,
    height: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 11,
    color: '#ffffff',
    flex: 1,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillBullet: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginRight: 12,
  },
  skillText: {
    fontSize: 11,
    color: '#ffffff',
  },
  educationItem: {
    marginBottom: 16,
  },
  educationInstitution: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  educationDetails: {
    fontSize: 10,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 30,
    marginBottom: 30,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af', // blue-800
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  divider: {
    width: 64,
    height: 4,
    backgroundColor: '#1e40af', // blue-800
  },
  contentSection: {
    marginBottom: 30,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af', // blue-800
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af', // blue-800
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  summary: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#6b7280',
  },
  workSection: {
    marginBottom: 30,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af', // blue-800
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af', // blue-800
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  job: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af', // blue-800
  },
  company: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'semibold',
  },
  date: {
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#6b7280',
  },
  jobContent: {
    marginTop: 12,
  },
  contactSection: {
    marginBottom: 30,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb', // blue-600
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  educationSection: {
    marginBottom: 30,
  },
  educationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  skillsSection: {
    marginBottom: 30,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  profileImageContainer: {
    marginRight: 0,
  },
  nameSection: {
    flex: 1,
  },
  nameAccent: {
    color: '#6b7280',
  },
  bulletList: {
    marginLeft: 0,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#6b7280',
  },
  bullet: {
    width: 8,
    marginRight: 8,
    marginTop: 2,
    fontSize: 8,
    color: '#374151',
  },
  bulletText: {
    flex: 1,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#6b7280',
  },
});

interface ResumePDFProps {
  data: ResumeData;
  templateId?: number | null;
}

// PDF Component - Classic Professional Template
export const ResumePDF: React.FC<ResumePDFProps> = ({ data, templateId }) => {
  // Extract and validate template ID
  const validTemplateId = templateId && typeof templateId === 'number' && templateId > 0 ? templateId : 1; // Default to Classic Professional

  // Transform data to match template expectations (same as TemplatePreview)
  const transformResumeData = (resumeData: ResumeData) => {
    const basics = {
      name: `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim(),
      label: resumeData.personalInfo?.headline || '',
      email: resumeData.personalInfo?.email || '',
      phone: resumeData.personalInfo?.phone || '',
      summary: resumeData.personalInfo?.summary || '',
      location: resumeData.personalInfo?.location ? {
        address: resumeData.personalInfo.location,
      } : undefined,
      image: resumeData.basics?.image || undefined
    };

    const work = resumeData.workExperience?.map((exp) => ({
      name: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.current ? undefined : exp.endDate,
      summary: decodeAndStripHTML(exp.description),
      location: "",
      highlights: exp.description ? [decodeAndStripHTML(exp.description)] : [],
    })) || [];

    const educationItems = resumeData.education?.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate,
    })) || [];

    const skillItems = resumeData.skills?.filter(skill => skill.trim() !== "").map((skill) => ({
      name: skill.trim(),
      level: "5",
    })) || [];

    return {
      basics,
      work,
      educationItems,
      skillItems,
      references: [],
      // Original structure
      personalInfo: resumeData.personalInfo,
      workExperience: resumeData.workExperience,
      education: resumeData.education,
      skills: resumeData.skills,
      templateId: validTemplateId
    };
  };

  const transformedData = transformResumeData(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Column - Contact & Skills & Education */}
        <View style={styles.leftColumn}>
          {/* Profile Image */}
          <View style={styles.profileImage}>
            {transformedData.basics?.image ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image
                src={transformedData.basics.image}
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                }}
              />
            ) : (
              <View style={styles.profileImageInner}>
                <Text style={styles.profileInitial}>
                  {transformedData.basics?.name ? transformedData.basics.name.charAt(0) : 'R'}
                </Text>
              </View>
            )}
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact</Text>
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.contactText}>{transformedData.basics?.phone || 'Phone'}</Text>
            </View>
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.contactText}>{transformedData.basics?.email || 'Email'}</Text>
            </View>
            {transformedData.basics?.location?.address && (
              <View style={styles.contactItem}>
                <View style={styles.iconContainer}>
                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.contactText}>{transformedData.basics.location.address}</Text>
              </View>
            )}
          </View>

          {/* Skills Section */}
          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>Skills</Text>
            <View style={styles.skillsList}>
              {transformedData.skillItems?.map((skill, index) => (
                <View key={index} style={styles.skill}>
                  <View style={styles.skillBullet}></View>
                  <Text style={styles.skillText}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Education Section */}
          <View style={styles.educationSection}>
            <Text style={styles.educationTitle}>Education</Text>
            {transformedData.educationItems?.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                <Text style={styles.educationDetails}>
                  {edu.studyType} {edu.area && `in ${edu.area}`}
                </Text>
                <Text style={styles.educationDetails}>
                  {edu.startDate && new Date(edu.startDate).getFullYear()} - {edu.endDate && new Date(edu.endDate).getFullYear()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column - Main Content */}
        <View style={styles.rightColumn}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.name}>
              {transformedData.basics?.name || 'Your Name'}
            </Text>
            <Text style={styles.title}>
              {transformedData.basics?.label || 'Professional Title'}
            </Text>
            <View style={styles.divider}></View>
          </View>

          {/* Profile Summary */}
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Profile</Text>
            <Text style={styles.summary}>
              {transformedData.basics?.summary ?
                String(transformedData.basics.summary).replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') :
                'Professional summary goes here...'
              }
            </Text>
          </View>

          {/* Work Experience */}
          <View style={styles.workSection}>
            <Text style={styles.workTitle}>Work Experience</Text>
            {transformedData.work?.map((work, index) => (
              <View key={index} style={styles.job}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{work.name || 'Company Name'}</Text>
                    <Text style={styles.company}>{work.position || 'Job Title'}</Text>
                  </View>
                  <Text style={styles.date}>
                    {work.startDate && new Date(work.startDate).getFullYear()} - {work.endDate ? new Date(work.endDate).getFullYear() : 'Present'}
                  </Text>
                </View>

                <View style={styles.jobContent}>
                  <Text style={styles.description}>
                    {work.summary ?
                      decodeAndStripHTML(work.summary) :
                      'Job description goes here...'
                    }
                  </Text>
                </View>
              </View>
            )) || (
              <View style={styles.job}>
                <Text style={styles.description}>No work experience listed</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResumePDF;
