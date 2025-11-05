'use client';

import { useState, useEffect, useCallback } from 'react';
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
  
  // FIXED: Separate state for profile and password forms
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Memoized fetch profile function
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (data.ok) {
        setUser(data.data.user);
        setProfileForm({
          name: data.data.user.name,
          email: data.data.user.email,
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
  }, []);

  // FIXED: Separate handler for profile update
  const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess('Profile updated successfully');
        setUser(data.data.user);
        setEditing(false);
      } else {
        setError(data.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  }, [profileForm]);

  // FIXED: Separate handler for password update
  const handlePasswordUpdate = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password change
    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setError('New password is required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name, // Keep existing name
          email: user.email, // Keep existing email
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess('Password updated successfully');
        setChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error?.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to update password');
      console.error(err);
    }
  }, [passwordForm, user]);

  // Memoized change handlers for profile form
  const handleProfileNameChange = useCallback((e) => {
    setProfileForm(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleProfileEmailChange = useCallback((e) => {
    setProfileForm(prev => ({ ...prev, email: e.target.value }));
  }, []);

  // Memoized change handlers for password form
  const handleCurrentPasswordChange = useCallback((e) => {
    setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
  }, []);

  const handleNewPasswordChange = useCallback((e) => {
    setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
  }, []);

  // Memoized button handlers
  const handleEditProfile = useCallback(() => {
    setEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setProfileForm({
      name: user.name,
      email: user.email,
    });
    setError('');
  }, [user]);

  const handleStartPasswordChange = useCallback(() => {
    setChangingPassword(true);
  }, []);

  const handleCancelPasswordChange = useCallback(() => {
    setChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
  }, []);

  const handleCopyCompanyId = useCallback(() => {
    if (user?.company?._id) {
      navigator.clipboard.writeText(user.company._id);
      setSuccess('Company ID copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [user]);

  // Effect with proper dependency
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
                        onClick={handleCopyCompanyId}
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

                <Button onClick={handleEditProfile} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileNameChange}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileEmailChange}
                  required
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
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
              <Button onClick={handleStartPasswordChange}>
                Change Password
              </Button>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handleCurrentPasswordChange}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handleNewPasswordChange}
                  required
                  minLength={6}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  minLength={6}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={handleCancelPasswordChange}
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
