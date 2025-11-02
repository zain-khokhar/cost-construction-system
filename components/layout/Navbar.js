'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      // Force reload to clear cookie and redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 ml-12 lg:ml-0">Construction Cost Management</h1>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500 capitalize">{user.role}</p>
              </button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
