import { NextResponse } from 'next/server';
import { getResumes } from '@/lib/supabase';
import { Resume } from '@/types/resume';

export async function GET(request: Request) {
  console.log('Debug Resume API - Starting debug');
  
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');
  const userId = searchParams.get('userId');

  console.log('Debug Resume API - Received parameters:', { resumeId, userId });

  if (!resumeId || !userId) {
    console.log('Debug Resume API - Missing parameters:', { resumeId, userId });
    return NextResponse.json({ error: 'Missing resume ID or user ID' }, { status: 400 });
  }

  // Ensure resumeId is a valid number
  const resumeIdNum = parseInt(resumeId, 10);
  if (isNaN(resumeIdNum)) {
    console.log('Debug Resume API - Invalid resume ID:', resumeId);
    return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
  }

  try {
    // Fetch resume data from Supabase
    console.log('Debug Resume API - Fetching resumes for user:', userId);
    const { data: resumes, error } = await getResumes(userId);
    
    if (error) {
      console.error('Debug Resume API - Error fetching resume:', error);
      return NextResponse.json({ error: 'Failed to fetch resume data', details: (error as Error).message }, { status: 500 });
    }

    console.log('Debug Resume API - Fetched resumes count:', resumes?.length);
    
    if (!resumes || resumes.length === 0) {
      console.log('Debug Resume API - No resumes found for user:', userId);
      return NextResponse.json({ error: 'No resumes found for user' }, { status: 404 });
    }

    // Log the structure of the first resume for debugging
    console.log('Debug Resume API - First resume structure:', JSON.stringify(resumes[0], null, 2));

    // Find the resume by ID
    const resume = resumes.find((r: Resume) => {
      console.log(`Debug Resume API - Comparing resume ID ${r.id} (${typeof r.id}) with ${resumeIdNum} (${typeof resumeIdNum})`);
      return r.id === resumeIdNum;
    });
    
    if (!resume) {
      console.log('Debug Resume API - Resume not found after search');
      console.log('Debug Resume API - Available resume IDs:', resumes.map((r: Resume) => ({ id: r.id, type: typeof r.id })));
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    console.log('Debug Resume API - Found resume:', resume.id);
    console.log('Debug Resume API - Resume data structure:', JSON.stringify(resume.data, null, 2));

    // Return the resume data for debugging
    return NextResponse.json({ 
      message: 'Resume found successfully',
      resumeId: resume.id,
      userId: resume.user_id,
      title: resume.title,
      data: resume.data,
      status: resume.status
    });
  } catch (error) {
    console.error('Debug Resume API - Error:', error);
    return NextResponse.json({ error: 'Failed to debug resume', details: (error as Error).message }, { status: 500 });
  }
}