import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Return a simple HTML page that generates PDF client-side with sample data
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple PDF Test</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .resume-content { 
          background: white; 
          padding: 40px; 
          border: 1px solid #ddd; 
          margin: 20px 0;
          min-height: 600px;
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
        h1 { color: #333; border-bottom: 2px solid #007cba; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .job { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #007cba; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Simple PDF Test Generator</h1>
        <p>This is a test to verify PDF generation works without any authentication.</p>
        
        <button onclick="generatePDF()" id="pdf-btn">Generate Sample PDF</button>
        <button onclick="window.close()">Close</button>
        
        <div id="message"></div>
        
        <div class="resume-content" id="resume-content">
          <h1>John Doe</h1>
          <p><strong>Email:</strong> john.doe@example.com</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Location:</strong> New York, NY</p>
          
          <h2>Professional Summary</h2>
          <p>Results-driven software engineer with expertise in developing scalable and efficient software solutions. Proven track record of delivering high-quality projects with strong attention to detail and commitment to excellence. Skilled professional passionate about leveraging technology to drive business growth and innovation.</p>
          
          <h2>Work Experience</h2>
          
          <div class="job">
            <h3>Senior Software Engineer</h3>
            <p><strong>Tech Solutions Inc.</strong> | 2020 - Present</p>
            <ul>
              <li>Led development of microservices architecture serving 1M+ users</li>
              <li>Implemented CI/CD pipelines reducing deployment time by 60%</li>
              <li>Mentored junior developers and conducted code reviews</li>
              <li>Collaborated with product teams to deliver features on schedule</li>
            </ul>
          </div>
          
          <div class="job">
            <h3>Software Developer</h3>
            <p><strong>Digital Innovations LLC</strong> | 2018 - 2020</p>
            <ul>
              <li>Developed responsive web applications using React and Node.js</li>
              <li>Optimized database queries improving performance by 40%</li>
              <li>Participated in agile development processes</li>
              <li>Contributed to open-source projects and technical documentation</li>
            </ul>
          </div>
          
          <h2>Education</h2>
          <div class="job">
            <h3>Bachelor of Science in Computer Science</h3>
            <p><strong>University of Technology</strong> | 2014 - 2018</p>
            <p>Graduated Magna Cum Laude, GPA: 3.8/4.0</p>
          </div>
          
          <h2>Skills</h2>
          <p><strong>Programming Languages:</strong> JavaScript, Python, Java, TypeScript, Go</p>
          <p><strong>Frameworks & Libraries:</strong> React, Node.js, Express, Django, Spring Boot</p>
          <p><strong>Databases:</strong> PostgreSQL, MongoDB, Redis, MySQL</p>
          <p><strong>Tools & Technologies:</strong> Docker, Kubernetes, AWS, Git, Jenkins</p>
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
              filename: 'sample_resume_test.pdf',
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
              btn.textContent = 'Generate Sample PDF';
              showMessage('PDF generated successfully! Check your downloads folder.');
            }).catch((error) => {
              console.error('PDF generation error:', error);
              showMessage('Error generating PDF: ' + error.message, true);
              btn.disabled = false;
              btn.textContent = 'Generate Sample PDF';
            });
            
          } catch (error) {
            console.error('PDF generation error:', error);
            showMessage('Error generating PDF: ' + error.message, true);
            btn.disabled = false;
            btn.textContent = 'Generate Sample PDF';
          }
        }
        
        // Auto-generate PDF after 2 seconds for testing
        setTimeout(() => {
          showMessage('Auto-generating PDF in 2 seconds for testing...');
          setTimeout(generatePDF, 2000);
        }, 1000);
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
    console.error("Simple PDF test error:", error);

    return NextResponse.json(
      {
        error: "Simple PDF test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}