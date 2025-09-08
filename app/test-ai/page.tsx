'use client';

import { useState } from 'react';
import { generateProfessionalSummary } from '@/lib/groq';

export default function TestAIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testAI = async () => {
    setLoading(true);
    try {
      const summary = await generateProfessionalSummary({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        location: 'New York, NY',
        headline: 'Software Engineer',
        summary: ''
      });
      setResult(summary);
    } catch (error) {
      console.error('Error testing AI:', error);
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">AI Test Page</h1>
      <button 
        onClick={testAI}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test AI Function'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}