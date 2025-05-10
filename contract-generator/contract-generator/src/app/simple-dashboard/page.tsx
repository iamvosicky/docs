'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/simple-auth-provider';

export default function SimpleDashboardPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/simple-login');
    }
  }, [isAuthenticated, router]);

  // If not authenticated, show loading state
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Simple Dashboard</h1>
      <p className="mb-4">This is a protected page that requires authentication.</p>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-bold mb-2">Authentication Status</h2>
        <p className="mb-2">
          <span className="font-semibold">Status:</span>{' '}
          <span className="text-green-600">Authenticated</span>
        </p>
      </div>
      
      <button 
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Dashboard Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold mb-2">Item {item}</h3>
              <p className="text-gray-600">This is a sample dashboard item.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
