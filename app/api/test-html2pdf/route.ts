import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Return a simple HTML page that uses html2pdf.js on the client side
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>HTML2PDF Test</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .content { max-width: 800px; margin: 0 auto; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="content">
        <h1>HTML2PDF Test</h1>
        <p>This is a test to verify HTML2PDF is working.</p>
        <p>Click the button below to generate a PDF:</p>
        <button onclick="generatePDF()">Generate PDF</button>
        
        <div id="resume-content" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
          <h2>Sample Resume Content</h2>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          
          <h3>Experience</h3>
          <p>Software Developer at Tech Company (2020-Present)</p>
          <ul>
            <li>Developed web applications using React and Node.js</li>
            <li>Collaborated with cross-functional teams</li>
            <li>Implemented responsive design principles</li>
          </ul>
        </div>
      </div>
      
      <script>
        function generatePDF() {
          const element = document.getElementById('resume-content');
          const opt = {
            margin: 1,
            filename: 'test-resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(element).save();
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
    console.error("HTML2PDF test error:", error);
    
    return NextResponse.json({
      error: "HTML2PDF test failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}