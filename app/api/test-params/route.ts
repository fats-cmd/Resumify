import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');
  const userId = searchParams.get('userId');

  console.log('Test API - Received parameters:', { resumeId, userId });

  // Return the parameters for debugging
  return NextResponse.json({ 
    resumeId, 
    userId,
    resumeIdType: typeof resumeId,
    userIdType: typeof userId,
    resumeIdParsed: resumeId ? parseInt(resumeId, 10) : null,
    resumeIdParsedType: typeof (resumeId ? parseInt(resumeId, 10) : null)
  });
}