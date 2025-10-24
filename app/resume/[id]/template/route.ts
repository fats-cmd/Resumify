import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getResumes } from "@/lib/supabase";

// Type definitions
interface WorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface TemplateData {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    summary?: string;
    location?: { address?: string };
    image?: string;
  };
  work?: Array<{
    name: string;
    position: string;
    startDate: string;
    endDate?: string;
    summary: string;
    location: string;
    highlights: string[];
  }>;
  educationItems?: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
  }>;
  skillItems?: Array<{
    name: string;
    level: string;
  }>;
  references?: Record<string, unknown>[];
  languages?: Record<string, unknown>[];
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Convert ID to integer
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID format" },
        { status: 400 },
      );
    }

    // Try to get auth token and user info
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "") ||
                  req.headers.get("x-supabase-auth") ||
                  req.cookies.get("sb-access-token")?.value;
    let userId = null;
    
    console.log("Attempting to fetch resume ID:", resumeId);
    console.log("Auth token present:", !!authToken);
    
    // Get user ID if auth token is available
    if (authToken) {
      try {
        const authenticatedSupabase = createClient(
          supabaseUrl,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          },
        );

        const { data: { user } } = await authenticatedSupabase.auth.getUser();
        userId = user?.id;
        console.log("User ID from token:", userId);
      } catch {
        console.log("Could not get user from token");
      }
    }
    
    // If we still don't have a user ID, try to get it from the request cookies
    if (!userId) {
      try {
        // Create a Supabase client that can read the session from cookies
        const cookieSupabase = createClient(
          supabaseUrl,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                // Get cookies from the request
                cookie: req.headers.get('cookie') || '',
              },
            },
          }
        );
        
        const { data: { user } } = await cookieSupabase.auth.getUser();
        userId = user?.id;
        console.log("User ID from cookies:", userId);
      } catch {
        console.log("Could not get user from cookies");
      }
    }

    let resume = null;
    
    // Try to get resume using the same method as the resume page
    if (userId) {
      try {
        console.log("Fetching resumes for user:", userId);
        const { data: allResumes, error } = await getResumes(userId);
        
        if (!error && allResumes) {
          const foundResume = allResumes.find((r) => r.id === resumeId);
          if (foundResume) {
            resume = foundResume;
            console.log("Found resume using getResumes:", foundResume.title);
          } else {
            console.log("Resume not found in user's resumes. Available IDs:", allResumes.map((r) => r.id));
            // If we have a user ID but can't find the resume, it might not belong to this user
            // In this case, we should not fall back to sample data if the resume exists for another user
            // Let's check if the resume exists at all (without user filter)
            const { data: resumeExists, error: existsError } = await supabase
              .from("resumes")
              .select("id")
              .eq("id", resumeId)
              .single();
              
            if (!existsError && resumeExists) {
              console.log("Resume exists but doesn't belong to this user. Showing access denied.");
              return NextResponse.json(
                { error: "Access denied. This resume doesn't belong to your account." },
                { status: 403 }
              );
            }
          }
        } else {
          console.log("Error fetching user resumes:", error?.message);
        }
      } catch (error) {
        console.log("Error using getResumes:", error);
      }
    }
    
    // If still no resume found, try direct database queries as fallback
    if (!resume) {
      console.log("Trying direct database queries as fallback");
      
      // Try service role first
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
        let query = serviceSupabase
          .from("resumes")
          .select("id, title, user_id, data")
          .eq("id", resumeId);
          
        // If we have a user ID, also check that the resume belongs to this user
        if (userId) {
          query = query.eq("user_id", userId);
        }
          
        const { data, error } = await query;
          
        if (!error && data && data.length > 0) {
          resume = data[0];
          console.log("Found resume using service role:", resume.title);
        } else {
          console.log("Service role query failed:", error?.message);
        }
      }
      
      // Try with anon key as last resort
      if (!resume) {
        let query = supabase
          .from("resumes")
          .select("id, title, user_id, data")
          .eq("id", resumeId);
          
        // If we have a user ID, also check that the resume belongs to this user
        if (userId) {
          query = query.eq("user_id", userId);
        }
          
        const { data, error } = await query;
          
        if (!error && data && data.length > 0) {
          resume = data[0];
          console.log("Found resume using anon key:", resume.title);
        } else {
          console.log("Anon key query failed:", error?.message);
        }
      }
    }
    
    if (!resume) {
      console.log("No resume found, using sample data");
      // Use sample data for testing
      resume = {
        id: resumeId,
        title: `[SAMPLE DATA] Resume ${resumeId} Not Found`,
        data: {
          templateId: 1, // Default to Classic Professional
          personalInfo: {
            firstName: "[SAMPLE]",
            lastName: "Data Not Found",
            email: "resume.not.found@example.com",
            phone: "(000) 000-0000",
            location: "Resume ID " + resumeId + " Not Found",
            headline: "Resume Not Found in Database",
            summary: "This is sample data because the resume with ID " + resumeId + " could not be found in the database. Please check if the resume exists and you have access to it."
          },
          workExperience: [
            {
              id: 1,
              company: "Tech Solutions Inc.",
              position: "Senior Software Engineer",
              startDate: "2020-01-01",
              endDate: "",
              current: true,
              description: "Led development of microservices architecture serving 1M+ users."
            }
          ],
          education: [
            {
              id: 1,
              institution: "University of Technology",
              degree: "Bachelor of Science",
              field: "Computer Science",
              startDate: "2014-09-01",
              endDate: "2018-05-01"
            }
          ],
          skills: ["JavaScript", "Python", "React", "Node.js"]
        }
      };
    } else {
      console.log("Found resume data:", JSON.stringify(resume.data, null, 2));
    }

    const templateId = resume.data?.templateId || 1;
    console.log("Using template ID:", templateId);
    
    // Transform data to template format - handle multiple possible data structures
    const resumeData = resume.data || {};
    
    // Try to get name from multiple possible locations
    const firstName = resumeData.personalInfo?.firstName || resumeData.basics?.name?.split(' ')[0] || 'John';
    const lastName = resumeData.personalInfo?.lastName || resumeData.basics?.name?.split(' ').slice(1).join(' ') || 'Doe';
    const fullName = resumeData.basics?.name || `${firstName} ${lastName}`;
    
    const templateData = {
      basics: {
        name: fullName,
        label: resumeData.personalInfo?.headline || resumeData.basics?.label || 'Professional',
        email: resumeData.personalInfo?.email || resumeData.basics?.email,
        phone: resumeData.personalInfo?.phone || resumeData.basics?.phone,
        summary: resumeData.personalInfo?.summary || resumeData.basics?.summary,
        location: resumeData.personalInfo?.location ? {
          address: resumeData.personalInfo.location,
        } : resumeData.basics?.location,
        image: resumeData.basics?.image
      },
      work: (resumeData.workExperience || resumeData.work || []).map((exp: WorkExperience | Record<string, unknown>) => ({
        name: (exp as WorkExperience).company || (exp as Record<string, unknown>).name,
        position: (exp as WorkExperience).position,
        startDate: (exp as WorkExperience).startDate || (exp as Record<string, unknown>).startDate,
        endDate: (exp as WorkExperience).current ? undefined : ((exp as WorkExperience).endDate || (exp as Record<string, unknown>).endDate),
        summary: (exp as WorkExperience).description || (exp as Record<string, unknown>).summary,
        location: (exp as Record<string, unknown>).location || "",
        highlights: (exp as WorkExperience).description ? [(exp as WorkExperience).description] : ((exp as Record<string, unknown>).highlights || []),
      })),
      educationItems: (resumeData.education || resumeData.educationItems || []).map((edu: Education | Record<string, unknown>) => ({
        institution: (edu as Education).institution || (edu as Record<string, unknown>).institution,
        area: (edu as Education).field || (edu as Record<string, unknown>).area,
        studyType: (edu as Education).degree || (edu as Record<string, unknown>).studyType,
        startDate: (edu as Education).startDate || (edu as Record<string, unknown>).startDate,
        endDate: (edu as Education).endDate || (edu as Record<string, unknown>).endDate,
      })),
      skillItems: (resumeData.skills || resumeData.skillItems || [])
        .filter((s: string | Record<string, unknown>) => typeof s === 'string' ? s.trim() : (s as Record<string, unknown>).name)
        .map((skill: string | Record<string, unknown>) => ({
          name: typeof skill === 'string' ? skill.trim() : (skill as Record<string, unknown>).name as string,
          level: typeof skill === 'object' ? (skill as Record<string, unknown>).level as string : "5",
        })),
      references: resumeData.references || [],
      languages: resumeData.languages || []
    };

    console.log("Transformed template data:", JSON.stringify(templateData, null, 2));

    // Return HTML page that renders the template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${resume.title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
              onerror="console.error('Failed to load html2pdf.js from CDN');"></script>
      <style>
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }

        /* Template-specific styles */
        .template-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media print {
          .template-container {
            box-shadow: none;
            max-width: none;
            width: 100%;
          }
        }

        /* Loading spinner styles */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body class="bg-gray-100">
      <div class="no-print p-4 ${resume && !resume.title.includes('[SAMPLE DATA]') ? 'bg-green-600' : 'bg-red-600'} text-white text-center">
        <h1 class="text-xl font-bold mb-2">Resume Template Preview</h1>
        <p class="mb-2">Template ID: ${templateId} | Resume: ${resume.title}</p>
        <p class="mb-2 text-sm">Name: ${templateData.basics?.name} | Email: ${templateData.basics?.email}</p>
        <p class="mb-4 text-xs ${resume && !resume.title.includes('[SAMPLE DATA]') ? 'bg-green-500' : 'bg-red-500'} px-2 py-1 rounded">
          ${resume && !resume.title.includes('[SAMPLE DATA]') ? '✅ Using Real Resume Data' : '⚠️ Using Sample Data - Resume ID ' + resumeId + ' Not Found'}
        </p>
        <button onclick="generatePDF()" id="pdf-btn" class="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center">
          <span id="pdf-btn-text">Generate PDF</span>
          <div id="pdf-loading-spinner" class="loading-spinner ml-2" style="display: none;"></div>
        </button>
        <button onclick="printResume()" class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-500 ml-2">
          Print Resume
        </button>
        <button onclick="window.close()" class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-400 ml-2">
          Close
        </button>
        <button onclick="toggleDebug()" class="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 ml-2 text-sm">
          Debug Data
        </button>
        <a href="/api/debug/resume/${resumeId}" target="_blank" class="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-400 ml-2 text-sm inline-block">
          Check DB
        </a>
      </div>
      
      <div id="debug-info" class="no-print p-4 bg-gray-100 text-black text-xs" style="display: none;">
        <h3 class="font-bold mb-2">Debug Information:</h3>
        <pre>${JSON.stringify(templateData, null, 2)}</pre>
      </div>
      
      <div id="resume-content" class="template-container">
        ${getTemplateHTML(templateId, templateData)}
      </div>
      
      <script>
        function toggleDebug() {
          const debugInfo = document.getElementById('debug-info');
          debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        }
        
        function printResume() {
          // Hide the control buttons and debug info for printing
          const controlElements = document.querySelectorAll('.no-print');
          controlElements.forEach(el => el.style.display = 'none');
          
          // Print the page
          window.print();
          
          // Show the control buttons again after printing
          setTimeout(() => {
            controlElements.forEach(el => el.style.display = '');
          }, 1000);
        }
        
        function generatePDF() {
          // Check if html2pdf is loaded
          if (typeof html2pdf === 'undefined') {
            alert('PDF library is still loading. Please wait a moment and try again.');
            console.error('html2pdf.js not loaded yet');
            return;
          }

          const btn = document.getElementById('pdf-btn');
          const btnText = document.getElementById('pdf-btn-text');
          const spinner = document.getElementById('pdf-loading-spinner');

          if (!btn || !btnText || !spinner) {
            alert('Error: Button elements not found');
            return;
          }

          btn.disabled = true;
          btnText.textContent = 'Generating PDF...';
          spinner.style.display = 'inline-block';

          const element = document.getElementById('resume-content');
          if (!element) {
            alert('Error: Resume content not found');
            resetPDFButton();
            return;
          }

          const opt = {
            margin: 0.5,
            filename: '${resume.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume"}_${resumeId}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            },
            jsPDF: {
              unit: 'in',
              format: 'a4',
              orientation: 'portrait'
            }
          };

          html2pdf().set(opt).from(element).save()
            .then(() => {
              resetPDFButton();
              alert('PDF generated successfully!');
            })
            .catch((error) => {
              console.error('PDF generation error:', error);
              alert('Error generating PDF: ' + (error.message || 'Unknown error occurred'));
              resetPDFButton();
            });

          function resetPDFButton() {
            btn.disabled = false;
            btnText.textContent = 'Generate PDF';
            spinner.style.display = 'none';
          }
        }

        // Wait for html2pdf to load
        function checkLibraryLoaded() {
          if (typeof html2pdf === 'undefined') {
            console.log('Waiting for html2pdf.js to load...');
            setTimeout(checkLibraryLoaded, 100);
          } else {
            console.log('html2pdf.js loaded successfully');
          }
        }

        // Check library loading on page load
        document.addEventListener('DOMContentLoaded', checkLibraryLoaded);
      </script>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });

  } catch (error) {
    console.error("Template rendering error:", error);

    return NextResponse.json(
      {
        error: "Template rendering failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to safely render HTML content
function renderHTMLContent(content: string | undefined | null): string {
  if (!content || typeof content !== 'string') return '';
  
  // If content contains HTML tags, return as-is for proper rendering
  // Otherwise, convert line breaks to <br> tags
  if (content.includes('<') && content.includes('>')) {
    return content;
  } else {
    return content.replace(/\n/g, '<br>');
  }
}

// Helper function to generate template HTML
function getTemplateHTML(templateId: number, data: TemplateData): string {
  switch (templateId) {
    case 1: // Classic Professional
      return generateClassicProfessionalHTML(data);
    case 8: // Modern Split
      return generateModernSplitHTML(data);
    case 10: // Minimalist Pro
      return generateMinimalistProHTML(data);
    default:
      return generateClassicProfessionalHTML(data);
  }
}

function generateClassicProfessionalHTML(data: TemplateData): string {
  return `
    <div class="grid grid-cols-3 min-h-screen">
      <!-- Left Column - Blue -->
      <div class="col-span-1 bg-blue-800 text-white p-8">
        <!-- Profile Image -->
        <div class="w-32 h-32 rounded-full bg-white p-2 mx-auto mb-6 overflow-hidden">
          ${data.basics?.image ? 
            `<img src="${data.basics.image}" alt="Profile" class="w-full h-full rounded-full object-cover">` :
            `<div class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
              ${data.basics?.name ? data.basics.name.charAt(0) : 'R'}
            </div>`
          }
        </div>
        
        <!-- Contact -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-600 pb-2">Contact</h2>
        <div class="space-y-3 mb-8">
          ${data.basics?.phone ? `<div class="flex items-center"><span class="mr-2 text-blue-600 font-bold">Phone:</span><span class="text-sm">${data.basics.phone}</span></div>` : ''}
          ${data.basics?.email ? `<div class="flex items-center"><span class="mr-2 text-blue-600 font-bold">Email:</span><span class="text-sm">${data.basics.email}</span></div>` : ''}
          ${data.basics?.location?.address ? `<div class="flex items-center"><span class="mr-2 text-blue-600 font-bold">Address:</span><span class="text-sm">${data.basics.location.address}</span></div>` : ''}
        </div>
        
        <!-- Skills -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-600 pb-2">Skills</h2>
        <div class="space-y-2 mb-8">
          ${data.skillItems?.map((skill) => `
            <div class="flex items-center">
              <div class="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span class="text-sm">${typeof skill === 'string' ? skill : (skill as Record<string, unknown>).name}</span>
            </div>
          `).join('') || '<p class="text-sm">No skills listed</p>'}
        </div>
        
        <!-- Education -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-600 pb-2">Education</h2>
        <div class="space-y-4">
          ${data.educationItems?.map((edu: Record<string, unknown>) => `
            <div>
              <h3 class="font-bold text-sm uppercase">${edu.institution || 'University'}</h3>
              <p class="text-sm">${edu.studyType || 'Degree'} ${edu.area ? 'in ' + edu.area : ''}</p>
              <p class="text-sm">${edu.startDate ? new Date(edu.startDate as string).getFullYear() : ''} - ${edu.endDate ? new Date(edu.endDate as string).getFullYear() : 'Present'}</p>
            </div>
          `).join('') || '<p class="text-sm">No education listed</p>'}
        </div>
      </div>
      
      <!-- Right Column - Light Gray -->
      <div class="col-span-2 bg-gray-50 p-8">
        <!-- Header -->
        <div class="bg-white p-8 mb-8 rounded-lg">
          <h1 class="text-4xl font-bold text-blue-800 mb-2">
            ${data.basics?.name || 'Your Name'}
          </h1>
          <p class="text-xl text-gray-600 uppercase tracking-wide">${data.basics?.label || 'Professional Title'}</p>
          <div class="w-16 h-1 bg-blue-800 mt-2"></div>
        </div>
        
        <!-- Profile -->
        <div class="mb-8">
          <h2 class="text-xl font-bold uppercase tracking-wider mb-4 text-blue-800 border-b-2 border-blue-800 pb-2">Profile</h2>
          <div class="text-gray-700 leading-relaxed">${renderHTMLContent(data.basics?.summary || 'Professional summary goes here...')}</div>
        </div>
        
        <!-- Work Experience -->
        <div class="mb-8">
          <h2 class="text-xl font-bold uppercase tracking-wider mb-4 text-blue-800 border-b-2 border-blue-800 pb-2">Work Experience</h2>
          <div class="space-y-6">
            ${data.work?.map((work: Record<string, unknown>) => `
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h3 class="text-lg font-bold">${work.name || 'Company Name'}</h3>
                    <p class="text-gray-600 font-medium">${work.position || 'Job Title'}</p>
                  </div>
                  <p class="text-sm text-gray-500">
                    ${work.startDate ? new Date(work.startDate as string).getFullYear() : ''} - ${work.endDate ? new Date(work.endDate as string).getFullYear() : 'Present'}
                  </p>
                </div>
                <div class="text-gray-700">${renderHTMLContent((work.summary as string) || 'Job description goes here...')}</div>
              </div>
            `).join('') || '<p class="text-gray-700">No work experience listed</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateModernSplitHTML(data: TemplateData): string {
  return `
    <div class="grid grid-cols-3 min-h-screen bg-gray-100">
      <!-- Left Column - Dark with Yellow Accents -->
      <div class="col-span-1 bg-gray-800 text-white p-8 relative">
        <!-- Yellow corner -->
        <div class="absolute top-0 right-0 w-0 h-0 border-t-[100px] border-t-yellow-500 border-l-[100px] border-l-transparent transform -scale-x-100"></div>
        
        <!-- Profile Image -->
        <div class="w-32 h-32 rounded-full bg-white p-2 mx-auto mb-6 overflow-hidden relative z-10">
          ${data.basics?.image ? 
            `<img src="${data.basics.image}" alt="Profile" class="w-full h-full rounded-full object-cover">` :
            `<div class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
              ${data.basics?.name ? data.basics.name.charAt(0) : 'R'}
            </div>`
          }
        </div>
        
        <!-- Contact Me -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="w-4 h-8 bg-yellow-500 mr-3"></div>
            <h2 class="text-lg font-bold uppercase tracking-wider">Contact Me</h2>
          </div>
          <div class="space-y-3">
            ${data.basics?.phone ? `<div class="flex items-center"><div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div><span class="text-sm">${data.basics.phone}</span></div>` : ''}
            ${data.basics?.email ? `<div class="flex items-center"><div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div><span class="text-sm">${data.basics.email}</span></div>` : ''}
            ${data.basics?.location?.address ? `<div class="flex items-center"><div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div><span class="text-sm">${data.basics.location.address}</span></div>` : ''}
          </div>
        </div>
        
        <!-- Education -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="w-4 h-8 bg-yellow-500 mr-3"></div>
            <h2 class="text-lg font-bold uppercase tracking-wider">Education</h2>
          </div>
          <div class="space-y-4">
            ${data.educationItems?.map((edu: Record<string, unknown>) => `
              <div>
                <div class="flex items-center mb-1">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 class="font-bold text-sm uppercase">${edu.institution || 'University'}</h3>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium uppercase">${edu.studyType || 'Degree'} ${edu.area || ''}</p>
                  <p class="text-sm">${edu.startDate ? new Date(edu.startDate as string).getFullYear() : ''} - ${edu.endDate ? new Date(edu.endDate as string).getFullYear() : 'Present'}</p>
                </div>
              </div>
            `).join('') || '<p class="text-sm">No education listed</p>'}
          </div>
        </div>
        
        <!-- Bottom yellow corner -->
        <div class="absolute bottom-0 right-0 w-0 h-0 border-b-[100px] border-b-yellow-500 border-l-[100px] border-l-transparent"></div>
      </div>
      
      <!-- Right Column -->
      <div class="col-span-2 bg-gray-100 relative">
        <!-- Header -->
        <div class="bg-gray-100 p-8 border-b border-gray-200">
          <div class="pl-4 border-l-4 border-yellow-500">
            <h1 class="text-4xl font-bold mb-1">
              <span class="text-gray-800">${data.basics?.name?.split(' ').slice(0, -1).join(' ') || 'Your'}</span>
              <span class="text-yellow-500">${data.basics?.name?.split(' ').slice(-1).join(' ') || 'Name'}</span>
            </h1>
            <p class="text-lg tracking-wide uppercase text-gray-600">${data.basics?.label || 'Professional Title'}</p>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-8">
          <!-- About Me -->
          <div class="mb-8">
            <div class="flex items-center mb-4">
              <div class="w-4 h-8 bg-yellow-500 mr-3"></div>
              <h2 class="text-xl font-bold uppercase tracking-wider text-gray-800">About Me</h2>
            </div>
            <div class="pl-4">
              <div class="text-gray-700 leading-relaxed">${renderHTMLContent(data.basics?.summary || 'Professional summary goes here...')}</div>
            </div>
          </div>
          
          <!-- Job Experience -->
          <div class="mb-8">
            <div class="flex items-center mb-4">
              <div class="w-4 h-8 bg-yellow-500 mr-3"></div>
              <h2 class="text-xl font-bold uppercase tracking-wider text-gray-800">Job Experience</h2>
            </div>
            <div class="space-y-6 pl-4">
              ${data.work?.map((work: Record<string, unknown>) => `
                <div class="relative pl-6 border-l border-gray-200">
                  <div class="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h3 class="text-lg font-bold">${(work as Record<string, unknown>).position || 'Job Title'}</h3>
                      <p class="text-gray-600 italic">${(work as Record<string, unknown>).name || 'Company'}</p>
                    </div>
                    <p class="text-sm font-medium">
                      ${(work as Record<string, unknown>).startDate ? new Date((work as Record<string, unknown>).startDate as string).getFullYear() : ''} - ${(work as Record<string, unknown>).endDate ? new Date((work as Record<string, unknown>).endDate as string).getFullYear() : 'Present'}
                    </p>
                  </div>
                  <div class="text-gray-700">${renderHTMLContent((work as Record<string, unknown>).summary as string || 'Job description goes here...')}</div>v>
                </div>
              `).join('') || '<p class="text-gray-700">No work experience listed</p>'}
            </div>
          </div>
          
          <!-- Skills -->
          <div>
            <div class="flex items-center mb-4">
              <div class="w-4 h-8 bg-yellow-500 mr-3"></div>
              <h2 class="text-xl font-bold uppercase tracking-wider text-gray-800">Skills</h2>
            </div>
            <div class="grid grid-cols-2 gap-4 pl-4">
              ${data.skillItems?.map((skill: Record<string, unknown>) => `
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="font-medium text-sm">${typeof skill === 'string' ? skill : (skill as Record<string, unknown>).name}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: ${(typeof skill === 'object' && skill !== null) ? (skill as Record<string, unknown>).level ? parseInt((skill as Record<string, unknown>).level as string) * 10 : 50 : 50}%"></div>
                  </div>
                </div>
              `).join('') || '<p class="text-gray-700">No skills listed</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateMinimalistProHTML(data: TemplateData): string {
  return `
    <div class="grid grid-cols-3 min-h-screen bg-white">
      <!-- Left Column - Stone/Olive -->
      <div class="col-span-1 bg-stone-600 text-white p-8">
        <!-- Contact -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-stone-400 pb-2">Contact</h2>
        <div class="space-y-4 mb-8">
          ${data.basics?.phone ? `<div class="flex items-start"><span class="mr-3 text-amber-500 font-bold">Phone:</span><span class="text-sm">${data.basics.phone}</span></div>` : ''}
          ${data.basics?.email ? `<div class="flex items-start"><span class="mr-3 text-amber-500 font-bold">Email:</span><span class="text-sm break-all">${data.basics.email}</span></div>` : ''}
          ${data.basics?.location?.address ? `<div class="flex items-start"><span class="mr-3 text-amber-500 font-bold">Address:</span><span class="text-sm">${data.basics.location.address}</span></div>` : ''}
        </div>
        
        <!-- Education -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-stone-400 pb-2">Education</h2>
        <div class="space-y-6 mb-8">
          ${data.educationItems?.map((edu: Record<string, unknown>) => `
            <div>
              <h3 class="font-bold text-sm uppercase tracking-wide">${edu.institution || 'University'}</h3>
              <p class="text-sm mt-1">${(edu as Record<string, unknown>).startDate ? new Date((edu as Record<string, unknown>).startDate as string).getFullYear() : ''} - ${(edu as Record<string, unknown>).endDate ? new Date((edu as Record<string, unknown>).endDate as string).getFullYear() : 'Present'}</p>
              <p class="text-sm mt-1">${edu.studyType || 'Degree'} ${edu.area ? 'of ' + edu.area : ''}</p>
            </div>
          `).join('') || '<p class="text-sm">No education listed</p>'}
        </div>
        
        <!-- Skills -->
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 border-b border-stone-400 pb-2">Skills</h2>
        <div class="space-y-2">
          ${data.skillItems?.map((skill: Record<string, unknown>) => `
            <div class="flex items-center">
              <div class="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span class="text-sm">${(skill as Record<string, unknown>).name}</span>
            </div>
          `).join('') || '<p class="text-sm">No skills listed</p>'}
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="col-span-2 bg-gray-50 relative">
        <!-- Header with Profile -->
        <div class="bg-white p-8 mb-8">
          <div class="flex items-center mb-6">
            <!-- Profile Image -->
            <div class="mr-6">
              <div class="w-32 h-32 rounded-full bg-white p-1 overflow-hidden border-4 border-stone-600">
                ${data.basics?.image ? 
                  `<img src="${data.basics.image}" alt="Profile" class="w-full h-full rounded-full object-cover">` :
                  `<div class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                    ${data.basics?.name ? data.basics.name.charAt(0) : 'R'}
                  </div>`
                }
              </div>
            </div>
            
            <!-- Name and Title -->
            <div>
              <h1 class="text-4xl font-bold mb-2 text-stone-600 uppercase tracking-wider">
                ${data.basics?.name ? 
                  `<span>${data.basics.name.split(' ').slice(0, -1).join(' ')}</span> <span class="text-gray-500">${data.basics.name.split(' ').slice(-1).join(' ')}</span>` :
                  '<span>Richard</span> <span class="text-gray-500">Sanchez</span>'
                }
              </h1>
              <p class="text-xl tracking-wide uppercase text-gray-600">${data.basics?.label || 'Marketing Manager'}</p>
              <div class="w-16 h-1 bg-stone-600 mt-2"></div>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="px-8">
          <!-- Profile -->
          <div class="mb-8">
            <h2 class="text-xl font-bold uppercase tracking-wider mb-4 text-stone-600 border-b border-gray-300 pb-2">Profile</h2>
            <div class="text-gray-700 leading-relaxed mt-4">${renderHTMLContent(data.basics?.summary || 'Professional summary goes here...')}</div>
          </div>
          
          <!-- Work Experience -->
          <div class="mb-8">
            <h2 class="text-xl font-bold uppercase tracking-wider mb-6 text-stone-600 border-b border-gray-300 pb-2">Work Experience</h2>
            <div class="space-y-8">
              ${data.work?.map((work: unknown) => `
                <div class="bg-white p-6 rounded-lg shadow-sm">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-lg font-bold">${(work as Record<string, unknown>).name || 'Company Name'}</h3>
                      <p class="text-gray-600 font-medium text-sm">${(work as Record<string, unknown>).position || 'Job Title'}</p>
                    </div>
                    <p class="text-sm font-medium text-gray-500">
                      ${(work as Record<string, unknown>).startDate ? new Date((work as Record<string, unknown>).startDate as string).getFullYear() : ''} - ${(work as Record<string, unknown>).endDate ? new Date((work as Record<string, unknown>).endDate as string).getFullYear() : 'Present'}
                    </p>
                  </div>
                  <div class="mt-3">
                    <ul class="text-gray-700 text-sm space-y-1">
                      <li><div>• ${renderHTMLContent((work as Record<string, unknown>).summary as string || 'Job responsibilities and achievements go here...')}</div></li>
                    </ul>
                  </div>
                </div>
              `).join('') || '<p class="text-gray-700">No work experience listed</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}