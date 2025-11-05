'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: User Info, 2: Company Selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    companyOption: 'new', // 'new' or 'existing'
    companyId: '',
    companyName: '',
    companyDomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoized reusable change handler for all form inputs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoized next step handler
  const handleNext = useCallback(() => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(2);
  }, [formData]);

  // Memoized back handler
  const handleBack = useCallback(() => {
    setStep(1);
    setError('');
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare the request body based on company option
      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.companyOption === 'new') {
        // Creating a new company
        if (!formData.companyName) {
          throw new Error('Company name is required');
        }
        body.companyName = formData.companyName;
        if (formData.companyDomain) {
          body.companyDomain = formData.companyDomain;
        }
      } else {
        // Joining an existing company
        if (!formData.companyId) {
          throw new Error('Please select a company');
        }
        body.companyId = formData.companyId;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // Important: Include cookies
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      // Check if user is pending approval
      if (data.data.status === 'pending') {
        // Show pending message and redirect to login
        alert(data.data.message || 'Your request has been sent to the company admin for approval.');
        router.push('/login');
        return;
      }

      // Use window.location for proper redirect with cookie
      window.location.href = '/login?registered=true';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">
            {step === 1 ? 'Create Account' : 'Company Information'}
          </h1>

          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Setup
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="companyOption"
                      value="new"
                      checked={formData.companyOption === 'new'}
                      onChange={handleChange}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Create a new company</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="companyOption"
                      value="existing"
                      checked={formData.companyOption === 'existing'}
                      onChange={handleChange}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Join an existing company</span>
                  </label>
                </div>
              </div>

              {formData.companyOption === 'new' ? (
                <>
                  <Input
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., ABC Construction Co."
                  />
                  <Input
                    label="Company Domain (Optional)"
                    name="companyDomain"
                    value={formData.companyDomain}
                    onChange={handleChange}
                    placeholder="e.g., abcconstruction.com"
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You will automatically become the <strong>Admin</strong> of this company.
                      You'll be able to invite other users and manage projects.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Company ID"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    required
                    placeholder="Enter company ID provided by your administrator"
                  />
                  <Select
                    label="Your Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={[
                      { value: 'viewer', label: 'Viewer (Read Only)' },
                      { value: 'manager', label: 'Manager (Log Expenses)' },
                    ]}
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your account request will be sent to the company admin for approval.
                      You'll be able to login after admin approves your request.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Contact your company administrator to get the Company ID.
                  </p>
                </>
              )}

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
