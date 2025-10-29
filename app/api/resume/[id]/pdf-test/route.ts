import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log("PDF Test Request - Resume ID:", id);

  try {
    // Convert ID to integer
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID format" },
        { status: 400 },
      );
    }

    // Try to get auth token for user verification
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId = null;

    if (authToken) {
      try {
        // Create authenticated client to verify user
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

        const { data: { user } } = await authenticatedSupabase.auth.getUser(authToken);
        userId = user?.id;
      } catch (e) {
        console.log("Could not verify user, proceeding without auth");
      }
    }

    // Try different approaches to get resume data
    let resumeList = null;
    let resumeError = null;

    // First, try with service role key if available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceSupabase = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data, error } = await serviceSupabase
        .from("resumes")
        .select("id, title, user_id, data")
        .eq("id", resumeId);

      resumeList = data;
      resumeError = error;
      console.log("Service role query result:", { count: data?.length || 0, error: error?.message });
    }

    // If service role failed or not available, try with user auth
    if (!resumeList && userId) {
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

      const { data, error } = await authenticatedSupabase
        .from("resumes")
        .select("id, title, user_id, data")
        .eq("id", resumeId)
        .eq("user_id", userId);

      resumeList = data;
      resumeError = error;
      console.log("Authenticated query result:", { count: data?.length || 0, error: error?.message });
    }

    // If still no results, try a basic query (might fail due to RLS)
    if (!resumeList) {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, user_id, data")
        .eq("id", resumeId);

      resumeList = data;
      resumeError = error;
      console.log("Basic query result:", { count: data?.length || 0, error: error?.message });
    }

    console.log("Final resume lookup result:", {
      found: !!resumeList && resumeList.length > 0,
      count: resumeList?.length || 0,
      error: resumeError?.message,
      userId: userId,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAuthToken: !!authToken,
    });

    let resume;

    if (resumeError || !resumeList || resumeList.length === 0) {
      console.log("Resume not found, using sample data for testing");
      // Use sample data for testing when resume can't be found
      resume = {
        id: resumeId,
        title: `Test Resume ${resumeId}`,
        user_id: userId || 'test-user',
        data: {
          personalInfo: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            location: "New York, NY",
            headline: "Software Engineer",
            summary: "Results-driven software engineer with expertise in developing scalable and efficient software solutions. Proven track record of delivering high-quality projects with strong attention to detail and commitment to excellence."
          },
          workExperience: [
            {
              id: 1,
              company: "Tech Solutions Inc.",
              position: "Senior Software Engineer",
              startDate: "2020-01-01",
              endDate: "",
              current: true,
              description: "Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%."
            }
          ],
          education: [
            {
              id: 1,
              institution: "University of Technology",
              degree: "Bachelor of Science",
              field: "Computer Science",
              startDate: "2014-09-01",
              endDate: "2018-05-01",
              description: "Graduated Magna Cum Laude"
            }
          ],
          skills: ["JavaScript", "Python", "React", "Node.js", "PostgreSQL"]
        }
      };
    } else {
      resume = resumeList[0];
    }

    // Get the template ID from resume data
    const templateId = resume.data?.templateId || 1; // Default to Classic Professional

    // Return a page that renders the actual template and generates PDF
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>PDF Test - ${resume.title}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .resume-content {
          background: white;
          padding: 40px;
          border: 1px solid #ddd;
          margin: 20px 0;
        }
        button {
          background: #007cba;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px;
        }
        button:hover { background: #005a8b; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .success { color: green; margin: 10px 0; }
        .error { color: red; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>PDF Test Generator</h1>
        <p>Resume: <strong>${resume.title}</strong></p>
        <p>Resume ID: <strong>${resumeId}</strong></p>

        <button onclick="generatePDF()" id="pdf-btn">Generate PDF</button>
        <button onclick="window.close()">Close</button>

        <div id="message"></div>

        <div class="resume-content" id="resume-content">
          <h1>${resume.data?.personalInfo?.firstName || 'John'} ${resume.data?.personalInfo?.lastName || 'Doe'}</h1>
          <p><strong>Email:</strong> ${resume.data?.personalInfo?.email || 'john@example.com'}</p>
          <p><strong>Phone:</strong> ${resume.data?.personalInfo?.phone || '(555) 123-4567'}</p>
          <p><strong>Location:</strong> ${resume.data?.personalInfo?.location || 'City, State'}</p>

          <h2>Professional Summary</h2>
          <p>${resume.data?.personalInfo?.summary || 'Professional summary goes here...'}</p>

          <h2>Work Experience</h2>
          ${resume.data?.workExperience?.map((exp: { position?: string; company?: string; startDate?: string; endDate?: string; current?: boolean; description?: string }) => `
            <div style="margin-bottom: 20px;">
              <h3>${exp.position || 'Job Title'}</h3>
              <p><strong>${exp.company || 'Company Name'}</strong> | ${exp.startDate || 'Start'} - ${exp.current ? 'Present' : (exp.endDate || 'End')}</p>
              <div>${exp.description || 'Job description goes here...'}</div>
            </div>
          `).join('') || '<p>No work experience added yet.</p>'}

          <h2>Education</h2>
          ${resume.data?.education?.map((edu: { degree?: string; field?: string; institution?: string; startDate?: string; endDate?: string }) => `
            <div style="margin-bottom: 20px;">
              <h3>${edu.degree || 'Degree'} in ${edu.field || 'Field'}</h3>
              <p><strong>${edu.institution || 'Institution'}</strong> | ${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</p>
            </div>
          `).join('') || '<p>No education added yet.</p>'}

          <h2>Skills</h2>
          <p>${resume.data?.skills?.filter((s: string) => s.trim()).join(', ') || 'No skills added yet.'}</p>
        </div>
      </div>

      <script>
        function showMessage(text, isError = false) {
          const messageDiv = document.getElementById('message');
          messageDiv.innerHTML = '<div class="' + (isError ? 'error' : 'success') + '">' + text + '</div>';
        }

        function generatePDF() {
          const btn = document.getElementById('pdf-btn');
          btn.disabled = true;
          btn.textContent = 'Generating PDF...';
          showMessage('Generating PDF, please wait...');

          try {
            const element = document.getElementById('resume-content');
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

            html2pdf().set(opt).from(element).save().then(() => {
              btn.disabled = false;
              btn.textContent = 'Generate PDF';
              showMessage('PDF generated successfully!');
            }).catch((error) => {
              console.error('PDF generation error:', error);
              showMessage('Error generating PDF: ' + error.message, true);
              btn.disabled = false;
              btn.textContent = 'Generate PDF';
            });

          } catch (error) {
            console.error('PDF generation error:', error);
            showMessage('Error generating PDF: ' + error.message, true);
            btn.disabled = false;
            btn.textContent = 'Generate PDF';
          }
        }
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
    console.error("PDF test error:", error);

    return NextResponse.json(
      {
        error: "PDF test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        details: String(error),
      },
      { status: 500 },
    );
  }
}