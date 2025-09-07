'use client';

import { useState, useEffect } from 'react';

export default function ApiKeyTest() {
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Checking...');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Get the API key from environment variables
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    setApiKey(key);
    
    // Check if API key exists
    if (!key) {
      setApiKeyStatus('❌ API Key not found in environment variables');
      return;
    }
    
    if (key.length < 30) {
      setApiKeyStatus('❌ API Key appears too short');
      return;
    }
    
    if (!key.startsWith('AIza')) {
      setApiKeyStatus('❌ API Key format is invalid');
      return;
    }
    
    setApiKeyStatus('✅ API Key format looks correct');
  }, []);

  const testApiKey = async () => {
    setApiKeyStatus('Testing API key...');
    
    try {
      // Simple fetch request to check if the key works
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
                text: 'Say "Hello, World!"'
              }]
            }]
          })
        }
      );
      
      if (response.ok) {
        setApiKeyStatus('✅ API Key is working correctly!');
      } else {
        const errorData = await response.json();
        setApiKeyStatus(`❌ API Key test failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setApiKeyStatus(`❌ API Key test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">API Key Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API Key Status:</h2>
        <p className="p-4 bg-gray-100 rounded">{apiKeyStatus}</p>
      </div>
      
      {apiKey && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your API Key (first 10 chars):</h2>
          <p className="p-4 bg-gray-100 rounded font-mono">
            {apiKey.substring(0, 10)}...
          </p>
        </div>
      )}
      
      <button 
        onClick={testApiKey}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test API Key
      </button>
    </div>
  );
}