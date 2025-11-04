'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getRoleDisplayName, getRoleDescription } from '@/lib/roles';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (data.ok) {
        setUser(data.data.user);
        setFormData({
          name: data.data.user.name,
          email: data.data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error?.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password change
    if (changingPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required');
        return;
      }
      if (!formData.newPassword) {
        setError('New password is required');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      if (changingPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess('Profile updated successfully');
        setUser(data.data.user);
        setEditing(false);
        setChangingPassword(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading...</div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-red-600">Failed to load profile</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* User Information Card */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            
            {!editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{user.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {getRoleDisplayName(user.role)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Company</label>
                  <p className="text-lg">{user.company?.name || 'N/A'}</p>
                </div>

                {user.role === 'admin' && user.company?._id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-blue-900 block mb-2">
                      Company ID (Share with new employees)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 font-mono text-sm">
                        {user.company._id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(user.company._id);
                          setSuccess('Company ID copied to clipboard!');
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Share this ID with employees who want to join your company during signup.
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Member Since</label>
                  <p className="text-lg">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <Button onClick={() => setEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Change Password Card */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            
            {!changingPassword ? (
              <Button onClick={() => setChangingPassword(true)}>
                Change Password
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false);
                      setFormData({
                        ...formData,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
