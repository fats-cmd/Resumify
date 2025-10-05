import Groq from "groq-sdk";
import { ResumeData } from "@/types/resume";

// Initialize the Groq client
const apiKey = process.env.GROQ_API_KEY || "";
console.log("Groq API Key present:", !!apiKey); // Debug log
console.log("Groq API Key length:", apiKey.length); // Debug log

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set. AI features will not work.");
} else if (apiKey === "your_actual_api_key_here") {
  console.warn("GROQ_API_KEY appears to be a placeholder. Please update it with a valid API key from Groq.");
} else if (apiKey.length < 30) {
  console.warn("GROQ_API_KEY appears to be too short. Please ensure you're using a valid API key from Groq.");
} else {
  console.log("Groq API Key appears to be valid"); // Debug log
}

// Initialize the Groq client
const groq = new Groq({ 
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Required for server-side usage through API routes
});

/**
 * Test function to verify API key is working
 * @returns A simple test response
 */
export async function testApiKey(): Promise<string> {
  try {
    console.log("Testing API key with simple request");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say 'Hello, World!' in English.",
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    return chatCompletion.choices[0]?.message?.content?.trim() || "No response";
  } catch (error) {
    console.error("Error testing API key:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Error testing API key. Please check your API key and internet connection.";
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
    console.warn("Warning: GROQ_API_KEY is not set. AI features may not work.");
    return "Error: GROQ_API_KEY is not set. Please configure your API key in the environment variables to use AI features.";
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GROQ_API_KEY appears to be a placeholder.");
    return "Error: GROQ_API_KEY appears to be a placeholder. Please update it with a valid API key from Groq.";
  } else if (apiKey.length < 30) {
    console.warn("Warning: GROQ_API_KEY appears to be too short.");
    return "Error: GROQ_API_KEY appears to be invalid. Please check your API key and ensure it's a valid key from Groq.";
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
      Return ONLY the summary content without any introductory phrases or labels.
      Do not include any markdown or special formatting, just plain text.`;

    console.log("Sending request to Groq API with prompt:", prompt.substring(0, 100) + "..."); // Debug log
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    console.log("Received response from Groq API"); // Debug log
    return chatCompletion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating professional summary:", error);
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        return "Error: Invalid API key. Please check your GROQ API key configuration.";
      } else if (error.message.includes('network')) {
        return "Error: Network error. Please check your internet connection and try again.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return "Error: API quota exceeded. Please check your GROQ plan limits.";
      } else if (error.message.includes('401')) {
        return "Error: Unauthorized. Please check your GROQ API key.";
      } else if (error.message.includes('403')) {
        return "Error: Forbidden. Please check your GROQ API key permissions.";
      } else if (error.message.includes('429')) {
        return "Error: Rate limit exceeded. Please wait before making another request.";
      } else if (error.message.includes('500') || error.message.includes('503')) {
        return "Error: Server error. Please try again later.";
      }
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
    console.warn("Warning: GROQ_API_KEY is not set. AI features may not work.");
    return ["Error: GROQ_API_KEY is not set. Please configure your API key in the environment variables to use AI features."];
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GROQ_API_KEY appears to be a placeholder.");
    return ["Error: GROQ_API_KEY appears to be a placeholder. Please update it with a valid API key from Groq."];
  } else if (apiKey.length < 30) {
    console.warn("Warning: GROQ_API_KEY appears to be too short.");
    return ["Error: GROQ_API_KEY appears to be invalid. Please check your API key and ensure it's a valid key from Groq."];
  } else {
    console.log("API key validation passed"); // Debug log
  }

  try {
    const descriptions: string[] = [];
    
    for (const experience of workExperience) {
      const prompt = `Transform the following work experience into a professional and impactful set of achievements. Return ONLY an HTML unordered list (<ul> with <li> elements) with 3-5 detailed bullet points, nothing else:

        Company: ${experience.company}
        Position: ${experience.position}
        Description: ${experience.description}
        
        For each bullet point, include:
        1. Specific action taken (use strong action verbs)
        2. Scope/scale of responsibility
        3. Technologies/tools used (if applicable)
        4. Quantifiable results and business impact
        5. Timeframe (if significant)
        
        Structure each point using the STAR method (Situation, Task, Action, Result) in a single, impactful sentence.
        
        Example of the expected format (return exactly like this, but with the actual content):
        <ul>
          <li>Led a cross-functional team of 5 developers in designing and implementing a React-based dashboard that improved data visualization, resulting in a 45% increase in user engagement and $250K in annual operational savings</li>
          <li>Spearheaded the migration of legacy systems to AWS cloud infrastructure, reducing server costs by 60% and improving system reliability to 99.99% uptime while mentoring 3 junior engineers through the transition</li>
          <li>Developed and executed a comprehensive performance optimization strategy that decreased page load times by 70% through implementation of code-splitting, lazy loading, and CDN integration, directly contributing to a 25% increase in conversion rates</li>
        </ul>`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      console.log("Received response from Groq API for work experience"); // Debug log
      descriptions.push(chatCompletion.choices[0]?.message?.content?.trim() || "");
    }
    
    return descriptions;
  } catch (error) {
    console.error("Error generating work experience descriptions:", error);
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        return ["Error: Invalid API key. Please check your GROQ API key configuration."];
      } else if (error.message.includes('network')) {
        return ["Error: Network error. Please check your internet connection and try again."];
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return ["Error: API quota exceeded. Please check your GROQ plan limits."];
      } else if (error.message.includes('401')) {
        return ["Error: Unauthorized. Please check your GROQ API key."];
      } else if (error.message.includes('403')) {
        return ["Error: Forbidden. Please check your GROQ API key permissions."];
      } else if (error.message.includes('429')) {
        return ["Error: Rate limit exceeded. Please wait before making another request."];
      } else if (error.message.includes('500') || error.message.includes('503')) {
        return ["Error: Server error. Please try again later."];
      }
      return [`Error: ${error.message}`];
    }
    return ["Error generating work experience descriptions. Please check your API key and internet connection."];
  }
}

/**
 * Generate education descriptions
 * @param education - Array of education items
 * @returns Array of enhanced education descriptions
 */
export async function generateEducationDescriptions(education: ResumeData["education"]): Promise<string[]> {
  if (!education || education.length === 0) {
    return [];
  }

  // Check if API key is valid before making request
  console.log("Checking API key in generateEducationDescriptions"); // Debug log
  console.log("API Key present:", !!apiKey); // Debug log
  console.log("API Key value (first 10 chars):", apiKey.substring(0, 10)); // Debug log
  
  // Only show warning in console, don't block the function
  if (!apiKey) {
    console.warn("Warning: GROQ_API_KEY is not set. AI features may not work.");
    return ["Error: GROQ_API_KEY is not set. Please configure your API key in the environment variables to use AI features."];
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GROQ_API_KEY appears to be a placeholder.");
    return ["Error: GROQ_API_KEY appears to be a placeholder. Please update it with a valid API key from Groq."];
  } else if (apiKey.length < 30) {
    console.warn("Warning: GROQ_API_KEY appears to be too short.");
    return ["Error: GROQ_API_KEY appears to be invalid. Please check your API key and ensure it's a valid key from Groq."];
  } else {
    console.log("API key validation passed"); // Debug log
  }

  try {
    const descriptions: string[] = [];
    
    for (const edu of education) {
      const prompt = `Generate a professional education description based on the following details:
        Institution: ${edu.institution || 'Not specified'}
        Degree: ${edu.degree || 'Not specified'}
        Field of Study: ${edu.field || 'Not specified'}
        
        Create a compelling description that highlights achievements, relevant coursework, projects, or skills gained during this educational experience.
        Return 2-3 bullet points that are concise and professional.
        Format as an HTML unordered list (<ul> with <li> elements).
        Focus on quantifiable accomplishments and specific skills developed.
        Example format:
        <ul>
          <li>Graduated with honors (GPA: 3.8/4.0) while leading the Computer Science Club</li>
          <li>Completed capstone project on [topic] that improved [result] by X%</li>
          <li>Gained expertise in [relevant skills] through hands-on coursework and projects</li>
        </ul>`;

      console.log("Sending request to Groq API for education description"); // Debug log
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      console.log("Received response from Groq API for education description"); // Debug log
      descriptions.push(chatCompletion.choices[0]?.message?.content?.trim() || "");
    }
    
    return descriptions;
  } catch (error) {
    console.error("Error generating education descriptions:", error);
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        return ["Error: Invalid API key. Please check your GROQ API key configuration."];
      } else if (error.message.includes('network')) {
        return ["Error: Network error. Please check your internet connection and try again."];
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return ["Error: API quota exceeded. Please check your GROQ plan limits."];
      } else if (error.message.includes('401')) {
        return ["Error: Unauthorized. Please check your GROQ API key."];
      } else if (error.message.includes('403')) {
        return ["Error: Forbidden. Please check your GROQ API key permissions."];
      } else if (error.message.includes('429')) {
        return ["Error: Rate limit exceeded. Please wait before making another request."];
      } else if (error.message.includes('500') || error.message.includes('503')) {
        return ["Error: Server error. Please try again later."];
      }
      return [`Error: ${error.message}`];
    }
    return ["Error generating education descriptions. Please check your API key and internet connection."];
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
    console.warn("Warning: GROQ_API_KEY is not set. AI features may not work.");
    return ["Error: GROQ_API_KEY is not set. Please configure your API key in the environment variables to use AI features."];
  } else if (apiKey === "your_actual_api_key_here") {
    console.warn("Warning: GROQ_API_KEY appears to be a placeholder.");
    return ["Error: GROQ_API_KEY appears to be a placeholder. Please update it with a valid API key from Groq."];
  } else if (apiKey.length < 30) {
    console.warn("Warning: GROQ_API_KEY appears to be too short.");
    return ["Error: GROQ_API_KEY appears to be invalid. Please check your API key and ensure it's a valid key from Groq."];
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
    
    prompt += "\nProvide ONLY a comma-separated list of 10-15 relevant skills. Return nothing else, just the skills. Focus on technical skills, soft skills, and industry-specific competencies. Do not include any introductory text, labels, or explanations.";
    
    console.log("Sending request to Groq API for skills suggestions"); // Debug log
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    console.log("Received response from Groq API for skills suggestions"); // Debug log
    const skillsText = chatCompletion.choices[0]?.message?.content?.trim() || "";
    
    // Split by comma and clean up each skill
    return skillsText.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
  } catch (error) {
    console.error("Error generating skills suggestions:", error);
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        return ["Error: Invalid API key. Please check your GROQ API key configuration."];
      } else if (error.message.includes('network')) {
        return ["Error: Network error. Please check your internet connection and try again."];
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return ["Error: API quota exceeded. Please check your GROQ plan limits."];
      } else if (error.message.includes('401')) {
        return ["Error: Unauthorized. Please check your GROQ API key."];
      } else if (error.message.includes('403')) {
        return ["Error: Forbidden. Please check your GROQ API key permissions."];
      } else if (error.message.includes('429')) {
        return ["Error: Rate limit exceeded. Please wait before making another request."];
      } else if (error.message.includes('500') || error.message.includes('503')) {
        return ["Error: Server error. Please try again later."];
      }
      return [`Error: ${error.message}`];
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
    case "education":
      return await generateEducationDescriptions(data.education);
    case "skills":
      return await generateSkillsSuggestions(data.workExperience, data.education);
    default:
      throw new Error(`Unsupported section: ${section}`);
  }
}