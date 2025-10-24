import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing Puppeteer...");
    console.log("Platform:", process.platform);
    console.log("Architecture:", process.arch);
    console.log("Node version:", process.version);
    
    // Test if we can find Chrome executable
    let executablePath;
    try {
      executablePath = puppeteer.executablePath();
      console.log("Chrome executable path:", executablePath);
    } catch (e) {
      console.log("Could not find Chrome executable:", e.message);
    }
    
    // Test basic Puppeteer functionality with more comprehensive args
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath,
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
        "--safebrowsing-disable-auto-update",
        "--enable-automation",
        "--password-store=basic",
        "--use-mock-keychain",
      ],
      timeout: 60000,
    });

    console.log("Browser launched successfully");

    const page = await browser.newPage();
    console.log("New page created");

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    console.log("Viewport set");

    // Navigate to a simple HTML page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Puppeteer Test Page</h1>
          <p>This is a test to verify Puppeteer is working correctly.</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
    console.log("Content set");

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 5000 });
    console.log("Content loaded");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
      printBackground: true,
      timeout: 30000,
    });

    console.log("PDF generated, size:", pdfBuffer.length);

    await page.close();
    await browser.close();
    console.log("Browser closed");

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="puppeteer-test.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Puppeteer test error:", error);
    
    // Try to get more diagnostic information
    let chromeInfo = "Not available";
    try {
      chromeInfo = puppeteer.executablePath();
    } catch (e) {
      chromeInfo = `Error: ${e.message}`;
    }
    
    return NextResponse.json({
      error: "Puppeteer test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        puppeteerVersion: require('puppeteer/package.json').version,
        chromeExecutable: chromeInfo,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV,
        }
      }
    }, { status: 500 });
  }
}