import { NextResponse } from 'next/server';
import { testApiKey } from '@/lib/groq';

export async function GET() {
  try {
    console.log('Testing Groq API key...');
    const result = await testApiKey();
    console.log('Groq API test result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Groq API key test completed',
      result: result
    });
  } catch (error) {
    console.error('Error testing Groq API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to test Groq API',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}