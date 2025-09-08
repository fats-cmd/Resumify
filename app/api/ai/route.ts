import { NextResponse } from 'next/server';
import { generateProfessionalSummary, generateWorkExperienceDescriptions, generateSkillsSuggestions } from '@/lib/groq';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('AI API route called with action:', action); // Debug log

    let result: string | string[] = '';

    switch (action) {
      case 'generateSummary':
        result = await generateProfessionalSummary(data.personalInfo);
        break;
      case 'generateExperience':
        result = await generateWorkExperienceDescriptions(data.workExperience);
        break;
      case 'generateSkills':
        result = await generateSkillsSuggestions(data.workExperience, data.education);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }

    console.log('AI API route completed with result:', typeof result === 'string' ? result.substring(0, 100) : result); // Debug log

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in AI API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}