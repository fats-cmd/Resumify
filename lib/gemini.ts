import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { ResumeData } from "@/types/resume";

// Initialize the Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || "";
console.log("Gemini API Key present:", !!apiKey); // Debug log
console.log("Gemini API Key length:", apiKey.length); // Debug log
console.log("Gemini API Key starts with AIza:", apiKey.startsWith("AIza")); // Debug log
console.log("Gemini API Key value (first 10 chars):", apiKey.substring(0, 10)); // Debug log

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
} else if (apiKey === "your_actual_api_key_here") {
  console.warn("GEMINI_API_KEY appears to be a placeholder. Please update it with a valid API key from Google AI Studio.");
} else if (apiKey.length < 30) {
  console.warn("GEMINI_API_KEY appears to be too short. Please ensure you're using a valid API key from Google AI Studio.");
} else if (!apiKey.startsWith("AIza")) {
  console.warn("GEMINI_API_KEY format is invalid. It should start with 'AIza'. Please check your key.");
} else {
  console.log("Gemini API Key appears to be valid"); // Debug log
}

// Try a different approach to initialize the GoogleGenerativeAI client
console.log("Initializing GoogleGenerativeAI with API key present:", !!apiKey);

// Check if we're in a browser or server environment
const isBrowser = typeof window !== 'undefined';
console.log("Running in browser environment:", isBrowser);

let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("GoogleGenerativeAI initialized successfully");
} catch (error) {
  console.error("Error initializing GoogleGenerativeAI:", error);
  // Fallback to empty key if initialization fails
  genAI = new GoogleGenerativeAI("");
}

// Get the model - using the correct model name
console.log("Getting generative model: gemini-1.5-flash");
const model: GenerativeModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  // Add generation config
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

// Log model initialization
console.log("Gemini model initialized:", !!model); // Debug log
console.log("Model name:", model.model); // Debug log

/**
 * Test function to verify API key is working
 * @returns A simple test response
 */
export async function testApiKey(): Promise<string> {
  try {
    console.log("Testing API key with simple request");
    const prompt = "Say 'Hello, World!' in English.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error testing API key:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Error testing API key. Please check your API key and internet connection.";
  }
}

/**
 * Test function to verify API key is working with direct API call
 * @returns A simple test response
 */
export async function testApiKeyDirect(): Promise<string> {
  try {
    console.log("Testing API key with direct API call");
    
    // Check if API key is available
    if (!apiKey) {
      return "Error: API key not available";
    }
    
    // Make a direct API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Say 'Hello, World!' in English."
            }]
          }]
        })
      }
    );
    
    console.log("Direct API call response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Direct API call successful");
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found";
    } else {
      const errorData = await response.json();
      console.error("Direct API call failed:", errorData);
      return `Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
    }
  } catch (error) {
    console.error("Error testing API key with direct call:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Error testing API key with direct call. Please check your API key and internet connection.";
  }
}

/**
 * Generate a professional summary for a resume based on personal information
 * @param personalInfo - The personal information of the user
 * @returns A professional summary string
 */
export async function generateProfessionalSummary(personalInfo: ResumeData["personalInfo"]): Promise<string> {
  if (!personalInfo) {
    return "";
  }

  // Check if API key is valid before making request
  console.log("Checking API key in generateProfessionalSummary"); // Debug log
  console.log("API Key present:", !!apiKey); // Debug log
  console.log("API Key value (first 10 chars):", apiKey.substring(0, 10)); // Debug log
  
  // Only show warning in console, don't block the function
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not set. AI features may not work.");
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GEMINI_API_KEY appears to be a placeholder.");
  } else if (apiKey.length < 30) {
    console.warn("Warning: GEMINI_API_KEY appears to be too short.");
  } else {
    console.log("API key validation passed"); // Debug log
  }

  try {
    const prompt = `Generate a professional resume summary for a person with the following details:
      Name: ${personalInfo.firstName} ${personalInfo.lastName}
      Email: ${personalInfo.email}
      Phone: ${personalInfo.phone}
      Location: ${personalInfo.location}
      Headline: ${personalInfo.headline}
      
      The summary should be concise (2-3 sentences), professional, and highlight the person's value proposition.
      Do not include any markdown or special formatting, just plain text.`;

    console.log("Sending request to Gemini API with prompt:", prompt.substring(0, 100) + "..."); // Debug log
    
    // Add debugging for the model and API key
    console.log("Model object exists:", !!model);
    console.log("Model configuration:", model.model);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Received response from Gemini API"); // Debug log
    return response.text().trim();
  } catch (error) {
    console.error("Error generating professional summary:", error);
    
    // Add more detailed error logging
    if (error && typeof error === 'object') {
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
    
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Error generating professional summary. Please check your API key and internet connection.";
  }
}

/**
 * Generate work experience descriptions
 * @param workExperience - Array of work experience items
 * @returns Array of enhanced work experience descriptions
 */
export async function generateWorkExperienceDescriptions(workExperience: ResumeData["workExperience"]): Promise<string[]> {
  if (!workExperience || workExperience.length === 0) {
    return [];
  }

  // Check if API key is valid before making request
  console.log("Checking API key in generateWorkExperienceDescriptions"); // Debug log
  console.log("API Key present:", !!apiKey); // Debug log
  console.log("API Key value (first 10 chars):", apiKey.substring(0, 10)); // Debug log
  
  // Only show warning in console, don't block the function
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not set. AI features may not work.");
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GEMINI_API_KEY appears to be a placeholder.");
  } else if (apiKey.length < 30) {
    console.warn("Warning: GEMINI_API_KEY appears to be too short.");
  } else {
    console.log("API key validation passed"); // Debug log
  }

  try {
    const descriptions: string[] = [];
    
    for (const experience of workExperience) {
      const prompt = `Enhance the following work experience description to be more professional and impactful:
        Company: ${experience.company}
        Position: ${experience.position}
        Description: ${experience.description}
        
        Improve this description to highlight achievements, use action verbs, and quantify results where possible.
        Keep it concise (2-4 bullet points) and professional.
        Return ONLY the enhanced description without any introductory text, labels, or explanations.
        Do not include any markdown or special formatting, just plain text with each point separated by a newline.`;

      console.log("Sending request to Gemini API for work experience"); // Debug log
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("Received response from Gemini API for work experience"); // Debug log
      descriptions.push(response.text().trim());
    }
    
    return descriptions;
  } catch (error) {
    console.error("Error generating work experience descriptions:", error);
    if (error instanceof Error) {
      return [`Error: ${error.message}`];
    }
    return ["Error generating work experience descriptions. Please check your API key and internet connection."];
  }
}

/**
 * Generate skills suggestions based on work experience and education
 * @param workExperience - Array of work experience items
 * @param education - Array of education items
 * @returns Array of suggested skills
 */
export async function generateSkillsSuggestions(
  workExperience: ResumeData["workExperience"], 
  education: ResumeData["education"]
): Promise<string[]> {
  // Check if API key is valid before making request
  console.log("Checking API key in generateSkillsSuggestions"); // Debug log
  console.log("API Key present:", !!apiKey); // Debug log
  console.log("API Key value (first 10 chars):", apiKey.substring(0, 10)); // Debug log
  
  // Only show warning in console, don't block the function
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not set. AI features may not work.");
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GEMINI_API_KEY appears to be a placeholder.");
  } else if (apiKey.length < 30) {
    console.warn("Warning: GEMINI_API_KEY appears to be too short.");
  } else {
    console.log("API key validation passed"); // Debug log
  }

  try {
    let prompt = "Based on the following work experience and education, suggest relevant professional skills:\n\n";
    
    if (workExperience && workExperience.length > 0) {
      prompt += "Work Experience:\n";
      workExperience.forEach((exp, index) => {
        prompt += `${index + 1}. ${exp.position} at ${exp.company}\n`;
      });
    }
    
    if (education && education.length > 0) {
      prompt += "\nEducation:\n";
      education.forEach((edu, index) => {
        prompt += `${index + 1}. ${edu.degree} in ${edu.field} from ${edu.institution}\n`;
      });
    }
    
    prompt += "\nProvide 10-15 relevant skills as a comma-separated list. Focus on technical skills, soft skills, and industry-specific competencies.";
    
    console.log("Sending request to Gemini API for skills suggestions"); // Debug log
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Received response from Gemini API for skills suggestions"); // Debug log
    const skillsText = response.text().trim();
    
    // Split by comma and clean up each skill
    return skillsText.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
  } catch (error) {
    console.error("Error generating skills suggestions:", error);
    if (error instanceof Error) {
      return [error.message];
    }
    return ["Error generating skills suggestions. Please check your API key and internet connection."];
  }
}

/**
 * Generate a complete resume section
 * @param section - The section to generate (summary, experience, skills, etc.)
 * @param data - The resume data to use as context
 * @returns Generated content for the specified section
 */
export async function generateResumeSection(section: string, data: ResumeData): Promise<string | string[]> {
  switch (section) {
    case "summary":
      return await generateProfessionalSummary(data.personalInfo);
    case "experience":
      return await generateWorkExperienceDescriptions(data.workExperience);
    case "skills":
      return await generateSkillsSuggestions(data.workExperience, data.education);
    default:
      throw new Error(`Unsupported section: ${section}`);
  }
}