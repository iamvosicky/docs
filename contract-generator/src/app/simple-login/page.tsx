'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Set a simple cookie directly
    document.cookie = "auth-token=simple-login-token; path=/; max-age=86400";
    
    // Show success message
    alert('Login successful! Cookie set.');
    
    // Redirect to home
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Simple Login Page</h1>
      <p className="mb-4">This is a simple login page that doesn't use useSearchParams.</p>
      
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
        
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="********"
            required
          />
        </div>
        
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
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
