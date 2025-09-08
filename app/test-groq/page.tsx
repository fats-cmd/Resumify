'use client';

import { useState } from 'react';

export default function TestGroqPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const testGroq = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/test-groq');
      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error testing Groq:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Groq API Test</h1>
      <button 
        onClick={testGroq}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Groq API'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Success:</h2>
          <p>{result}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}