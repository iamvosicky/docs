'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const [cookies, setCookies] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie);
    
    // Parse cookies to find auth token
    const cookieArray = document.cookie.split(';');
    const authCookie = cookieArray.find(cookie => cookie.trim().startsWith('auth-token='));
    
    if (authCookie) {
      setAuthToken(authCookie.split('=')[1]);
    } else {
      setAuthToken(null);
    }
  }, []);

  const handleSetCookie = () => {
    // Set a simple auth cookie
    document.cookie = "auth-token=debug-token; path=/; max-age=86400";
    
    // Refresh the page
    window.location.reload();
  };

  const handleClearCookie = () => {
    // Clear the auth cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Refresh the page
    window.location.reload();
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Current Authentication State</h2>
        <div className="mb-4">
          <p className="font-semibold">Auth Token:</p>
          <p className="bg-gray-100 p-2 rounded">{authToken || 'Not authenticated'}</p>
        </div>
        
        <div className="mb-4">
          <p className="font-semibold">All Cookies:</p>
          <p className="bg-gray-100 p-2 rounded overflow-x-auto">{cookies || 'No cookies'}</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleSetCookie}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Set Auth Cookie
          </button>
          
          <button 
            onClick={handleClearCookie}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Auth Cookie
          </button>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Navigation</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleGoToLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login Page
          </button>
          
          <button 
            onClick={handleGoToHome}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
