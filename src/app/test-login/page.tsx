'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Loading component for Suspense fallback
function TestLoginLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      <p className="mb-4">Please wait while we load the test login page.</p>
    </div>
  );
}

// Main component content
function TestLoginContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Set a simple cookie directly
    document.cookie = "auth-token=test-token; path=/; max-age=86400";
    
    // Show success message
    alert('Login successful! Cookie set.');
    
    // Redirect to home
    router.push('/');
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Test Login Page</h1>
      <p className="mb-4">This is a simple test login page to debug cookie issues.</p>
      
      <form onSubmit={handleLogin} className="max-w-md">
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test@example.com"
            required
          />
        </div>
        
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Test Login'}
        </button>
      </form>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Debug Info</h2>
        <button 
          onClick={() => alert(document.cookie)}
          className="bg-gray-200 px-4 py-2 rounded mr-2"
        >
          Show Cookies
        </button>
        
        <button 
          onClick={() => {
            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            alert('Cookie cleared!');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Auth Cookie
        </button>
      </div>
    </div>
  );
}

// Export the component wrapped in Suspense
export default function TestLoginPage() {
  // We don't actually use searchParams here, but we need to wrap it in Suspense
  // because Next.js detected that we're using useSearchParams() somewhere
  const searchParams = useSearchParams();
  
  return (
    <Suspense fallback={<TestLoginLoading />}>
      <TestLoginContent />
    </Suspense>
  );
}
