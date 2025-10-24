import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log("Simple PDF Generation Request - Resume ID:", id);

  try {
    // Get auth token from cookies or headers
    const cookieStore = await cookies();
    const authToken =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      cookieStore.get("sb-access-token")?.value;

    if (!authToken) {
      console.error("No authentication token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Create authenticated Supabase client
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

    // Verify user session
    const {
      data: { user },
      error: userError,
    } = await authenticatedSupabase.auth.getUser(authToken);

    if (userError || !user) {
      console.error("User verification failed:", userError?.message);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    // Convert ID to integer
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID format" },
        { status: 400 },
      );
    }

    // Get resume data
    const { data: resumeList, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title, user_id, data")
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (resumeError || !resumeList || resumeList.length === 0) {
      console.error("Resume not found:", resumeError?.message);
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 },
      );
    }

    const resume = resumeList[0];

    // Instead of using Puppeteer, return a client-side PDF generation page
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const resumeUrl = `${baseUrl}/resume/${id}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Generate PDF - ${resume.title}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .loading { 
          text-align: center; 
          padding: 40px; 
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        iframe {
          width: 100%;
          height: 600px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .actions {
          margin-top: 20px;
          text-align: center;
        }
        button {
          background: #007cba;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin: 0 10px;
        }
        button:hover {
          background: #005a8b;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Generate PDF: ${resume.title}</h1>
        
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p>Loading resume content...</p>
        </div>
        
        <iframe id="resume-frame" src="${resumeUrl}" style="display: none;" onload="frameLoaded()"></iframe>
        
        <div class="actions" id="actions" style="display: none;">
          <button onclick="generatePDF()" id="pdf-btn">Generate PDF</button>
          <button onclick="window.close()">Close</button>
        </div>
      </div>
      
      <script>
        function frameLoaded() {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('resume-frame').style.display = 'block';
          document.getElementById('actions').style.display = 'block';
        }
        
        function generatePDF() {
          const btn = document.getElementById('pdf-btn');
          btn.disabled = true;
          btn.textContent = 'Generating PDF...';
          
          try {
            const iframe = document.getElementById('resume-frame');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Find the resume content in the iframe
            const resumeContent = iframeDoc.querySelector('[data-testid="resume-content"], .resume-content, #resume-preview') || iframeDoc.body;
            
            const opt = {
              margin: 0.5,
              filename: '${resume.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume"}_${id}.pdf',
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
            
            html2pdf().set(opt).from(resumeContent).save().then(() => {
              btn.disabled = false;
              btn.textContent = 'Generate PDF';
            }).catch((error) => {
              console.error('PDF generation error:', error);
              alert('Error generating PDF. Please try again.');
              btn.disabled = false;
              btn.textContent = 'Generate PDF';
            });
            
          } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
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
    console.error("Simple PDF generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}