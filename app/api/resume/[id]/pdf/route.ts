import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase client for server-side use
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

  console.log("PDF Generation Request - Resume ID:", id);

  try {
    // Get auth token from cookies or headers
    const cookieStore = await cookies();
    
    // Log all available cookies for debugging
    const allCookies = Array.from(cookieStore.getAll());
    console.log("Available cookies:", allCookies.map(c => c.name));
    
    // Try to get auth token from various sources
    let authToken = req.headers.get("authorization")?.replace("Bearer ", "") ||
                   req.headers.get("x-supabase-auth");
    
    if (!authToken) {
      // Try different cookie names that Supabase might use
      const possibleCookieNames = [
        "sb-access-token",
        "supabase-auth-token", 
        "sb-auth-token",
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      ];
      
      for (const cookieName of possibleCookieNames) {
        const cookieValue = cookieStore.get(cookieName)?.value;
        if (cookieValue) {
          authToken = cookieValue;
          console.log(`Found auth token in cookie: ${cookieName}`);
          break;
        }
      }
    }
    
    // If still no token, try to parse Supabase session from cookies
    if (!authToken) {
      // Look for Supabase session cookies
      const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));
      console.log("Supabase-related cookies:", supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
      
      // Try to find session cookie and parse it
      for (const cookie of supabaseCookies) {
        try {
          if (cookie.value && cookie.value.includes('access_token')) {
            const parsed = JSON.parse(cookie.value);
            if (parsed.access_token) {
              authToken = parsed.access_token;
              console.log(`Found access token in parsed cookie: ${cookie.name}`);
              break;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    console.log("Final auth token present:", !!authToken);
    console.log("Auth token source:", authToken ? (req.headers.get("authorization") ? "header" : "cookie") : "none");

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

    console.log("User verification - Error:", userError?.message);
    console.log("User ID:", user?.id);

    if (userError || !user) {
      console.error("User verification failed:", userError?.message);
      return NextResponse.json(
        { error: "Invalid authentication token", details: userError?.message },
        { status: 401 },
      );
    }

    // Verify the resume exists and belongs to the user
    console.log("Looking up resume with ID:", id, "for user:", user.id);

    // Convert ID to integer for database lookup
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      console.error("Invalid resume ID:", id);
      return NextResponse.json(
        { error: "Invalid resume ID format" },
        { status: 400 },
      );
    }

    // First, let's check if the resume exists without .single() to avoid the coercion error
    const { data: resumeList, error: resumeListError } = await supabase
      .from("resumes")
      .select("id, title, user_id, data")
      .eq("id", resumeId)
      .eq("user_id", user.id);

    console.log("Resume list query result:", {
      count: resumeList?.length || 0,
      error: resumeListError?.message,
      resumeIds: resumeList?.map(r => r.id) || [],
    });

    let resume = null;
    let resumeError = resumeListError;

    if (resumeListError) {
      console.error("Resume list query error:", resumeListError);
    } else if (!resumeList || resumeList.length === 0) {
      console.log("No resume found for user");
      resumeError = { message: "Resume not found", code: "PGRST116" };
    } else if (resumeList.length > 1) {
      console.warn("Multiple resumes found with same ID:", resumeList.length);
      resume = resumeList[0]; // Take the first one
    } else {
      resume = resumeList[0];
    }

    console.log("Resume lookup - Error:", resumeError?.message);
    console.log("Resume found:", !!resume);
    console.log("Resume ID:", resume?.id);
    console.log("Resume user_id:", resume?.user_id);

    if (resumeError || !resume) {
      console.error("Resume lookup failed:", {
        error: resumeError?.message,
        code: resumeError?.code,
        searchId: resumeId,
        originalId: id,
        userId: user.id,
        resumeFound: !!resume,
      });

      // Try to find any resume with this ID (without user filter) for debugging
      const { data: anyResumeList, error: anyResumeError } = await supabase
        .from("resumes")
        .select("id, user_id")
        .eq("id", resumeId);

      const anyResume = anyResumeList && anyResumeList.length > 0 ? anyResumeList[0] : null;

      console.log("Debug - Resume exists but different user:", {
        exists: !!anyResume,
        actualUserId: anyResume?.user_id,
        requestedUserId: user.id,
        error: anyResumeError?.message,
      });

      // Return more detailed error information
      const errorResponse = {
        error: "Resume not found or access denied",
        message: resumeError?.message || "Resume not found",
        details: {
          resumeId: resumeId,
          originalId: id,
          userId: user.id,
          resumeExists: !!anyResume,
          belongsToUser: !!resume,
          actualUserId: anyResume?.user_id,
          errorCode: resumeError?.code,
          totalResumesWithId: anyResumeList?.length || 0,
          allUserIds: anyResumeList?.map(r => r.user_id) || [],
        },
      };

      console.error("Returning error response:", errorResponse);

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const resumeUrl = `${baseUrl}/resume/${id}`;

    // Launch browser with optimized settings for serverless
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-domain-reliability",
        "--disable-extensions",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-print-preview",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-default-browser-check",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
        "--enable-automation",
        "--password-store=basic",
        "--use-mock-keychain",
      ],
      timeout: 60000,
    });

    const page = await browser.newPage();

    try {
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2, // Higher DPI for better quality
      });

      // Add authentication cookies if available
      if (authToken) {
        await page.setCookie({
          name: "sb-access-token",
          value: authToken,
          domain: new URL(baseUrl).hostname,
        });
      }

      // Navigate to the resume page with retry logic
      let navigationSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!navigationSuccess && attempts < maxAttempts) {
        try {
          await page.goto(resumeUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });
          navigationSuccess = true;
        } catch (navError) {
          attempts++;
          console.warn(`Navigation attempt ${attempts} failed:`, navError);
          if (attempts >= maxAttempts) {
            throw navError;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Wait for the resume content to load with multiple selectors
      await Promise.race([
        page.waitForSelector('[data-testid="resume-content"]', {
          timeout: 15000,
        }),
        page.waitForSelector(".resume-content", { timeout: 15000 }),
        page.waitForSelector("#resume-preview", { timeout: 15000 }),
        page.waitForSelector(".template-preview", { timeout: 15000 }),
        // Fallback - wait for any content to appear
        page.waitForFunction(() => document.body.children.length > 0, {
          timeout: 15000,
        }),
      ]).catch(() => {
        console.log(
          "Resume selectors not found, proceeding with current content",
        );
      });

      // Add a small delay to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add comprehensive print-specific styles
      await page.addStyleTag({
        content: `
          @page {
            margin: 0.5in;
            size: A4;
          }

          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
            }

            /* Hide non-resume elements */
            nav, .nav, .navbar, .navigation,
            .sidebar, .side-bar,
            .dock, .dynamic-dock,
            header:not(.resume-header):not([class*="resume"]),
            footer:not(.resume-footer):not([class*="resume"]),
            .no-print,
            button:not(.resume-button),
            .floating-action-button,
            .fab,
            .toast,
            .notification,
            .modal,
            .overlay,
            .menu,
            .dropdown,
            [data-testid="sidebar"],
            [data-testid="navigation"],
            [data-testid="dock"] {
              display: none !important;
              visibility: hidden !important;
            }

            /* Ensure resume content is properly displayed */
            .resume-content,
            #resume-preview,
            [data-testid="resume-content"],
            .template-preview {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              max-width: none !important;
              width: 100% !important;
              background: white !important;
              display: block !important;
              visibility: visible !important;
            }

            /* Typography optimizations */
            h1, h2, h3, h4, h5, h6 {
              break-after: avoid;
              break-inside: avoid;
              margin-top: 0.5em;
              margin-bottom: 0.3em;
            }

            p {
              orphans: 3;
              widows: 3;
              margin-bottom: 0.5em;
            }

            ul, ol {
              margin-bottom: 0.5em;
            }

            li {
              break-inside: avoid;
              margin-bottom: 0.2em;
            }

            /* Page break controls */
            .page-break {
              page-break-before: always;
            }

            .avoid-break {
              break-inside: avoid;
            }

            /* Ensure images are properly sized */
            img {
              max-width: 100% !important;
              height: auto !important;
            }

            /* Fix any flexbox issues */
            .flex {
              display: block !important;
            }

            .grid {
              display: block !important;
            }
          }
        `,
      });

      // Generate PDF with optimal settings
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
        timeout: 60000,
      });

      // Clean up
      await page.close();
      await browser.close();

      // Generate filename
      const sanitizedTitle =
        resume.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") ||
        "resume";
      const filename = `${sanitizedTitle}_${id}.pdf`;

      return new NextResponse(Buffer.from(pdfBuffer), {
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
      await page.close();
      throw error;
    }
  } catch (error) {
    console.error("PDF generation error:", error);

    // Ensure browser is closed in case of error
    try {
      // Browser might already be closed, ignore errors here
    } catch (cleanupError) {
      console.warn("Browser cleanup error:", cleanupError);
    }

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
