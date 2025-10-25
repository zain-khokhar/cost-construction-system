'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please login.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[CLIENT] Submitting login form');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Important: Include cookies in request
      });

      console.log('[CLIENT] Login response status:', res.status);
      console.log('[CLIENT] Login response headers:', [...res.headers.entries()]);
      
      // Check specifically for Set-Cookie header
      const setCookie = res.headers.get('set-cookie');
      console.log('[CLIENT] Set-Cookie header:', setCookie);

      const data = await res.json();
      console.log('[CLIENT] Login response data:', data);

      if (!res.ok) {
        console.log('[CLIENT] Login failed:', data.error?.message);
        throw new Error(data.error?.message || 'Login failed');
      }

      console.log('[CLIENT] Login successful, navigating to home');
      
      // Small delay to ensure cookie is processed by browser
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[CLIENT] Performing hard navigation to /');
      // Force full navigation so the browser applies the Set-Cookie header
      // and server-side middleware sees the new cookie on the next request.
      // window.location.href = '/';
    } catch (err) {
      console.error('[CLIENT] Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">Construction Cost Management</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                {successMessage}
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Default admin: admin@example.com / Admin@123
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
