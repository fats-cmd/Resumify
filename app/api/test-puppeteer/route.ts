import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  console.log('Test Puppeteer API - Starting test');
  
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Simple HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test PDF</title>
      </head>
      <body>
        <h1>Test PDF Generation</h1>
        <p>This is a test PDF generated with Puppeteer.</p>
      </body>
      </html>
    `;
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    // Close browser
    await browser.close();
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"'
      }
    });
  } catch (error) {
    console.error('Test Puppeteer API - Error:', error);
    return NextResponse.json({ error: 'Failed to generate test PDF', details: (error as Error).message }, { status: 500 });
  }
}