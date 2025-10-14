import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Test PDF API - Starting test');
  
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');
  const userId = searchParams.get('userId');

  console.log('Test PDF API - Received parameters:', { resumeId, userId });

  // Simple test response
  return NextResponse.json({ 
    message: 'Test PDF API working',
    resumeId, 
    userId,
    timestamp: new Date().toISOString()
  });
}