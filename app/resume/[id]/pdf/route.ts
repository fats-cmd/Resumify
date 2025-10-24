import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the resume exists and belongs to the user
    // Convert ID to integer for database lookup
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID format" },
        { status: 400 },
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title, user_id")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const resumeUrl = `${baseUrl}/resume/${id}`;

    // Launch browser with optimized settings
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });

    // Add authentication cookie/header if needed
    if (authHeader) {
      await page.setExtraHTTPHeaders({
        Authorization: authHeader,
      });
    }

    // Navigate to the resume page
    await page.goto(resumeUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for the resume content to load
    await page
      .waitForSelector(
        '[data-testid="resume-content"], .resume-content, #resume-preview',
        {
          timeout: 10000,
        },
      )
      .catch(() => {
        // If specific selectors don't exist, wait for general content
        console.log("Resume selectors not found, waiting for general content");
      });

    // Add print-specific styles
    await page.addStyleTag({
      content: `
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

          /* Hide navigation, sidebar, and other non-resume elements */
          nav,
          .sidebar,
          .dock,
          .dynamic-dock,
          .navbar,
          header:not(.resume-header),
          footer:not(.resume-footer),
          .no-print {
            display: none !important;
          }

          /* Ensure resume content takes full page */
          .resume-content,
          #resume-preview,
          [data-testid="resume-content"] {
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            max-width: none !important;
            width: 100% !important;
          }

          /* Optimize typography for print */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            break-inside: avoid;
          }

          p {
            orphans: 3;
            widows: 3;
          }

          /* Ensure proper page breaks */
          .page-break {
            page-break-before: always;
          }

          .avoid-break {
            break-inside: avoid;
          }
        }
      `,
    });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      timeout: 30000,
    });

    await browser.close();

    // Get resume title for filename
    const filename = `${resume.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume"}_${id}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
