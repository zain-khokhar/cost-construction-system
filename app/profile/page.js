'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getRoleDisplayName, getRoleDescription } from '@/lib/roles';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Separate state for profile and password forms
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
        console.log('User data:', data.data.user); // Debug log
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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Profile form handlers
  const handleNameChange = (e) => {
    setProfileForm(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e) => {
    setProfileForm(prev => ({ ...prev, email: e.target.value }));
  };

  const handleStartEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileForm({
      name: user.name,
      email: user.email,
    });
    setError('');
    setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileForm.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!profileForm.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setUser(prev => ({ ...prev, ...data.data.user }));
        setEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  // Password form handlers
  const handleCurrentPasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
  };

  const handleNewPasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
  };

  const handleConfirmPasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
  };

  const handleStartPasswordChange = () => {
    setChangingPassword(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  const handleCancelPasswordChange = () => {
    setChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setSuccess('Password updated successfully!');
      } else {
        setError(data.error?.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to update password');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-red-600">Failed to load profile</div>
    );
  }

  return (
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

      {/* Personal Information Card */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          
          {!editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{getRoleDescription(user.role)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <p className="text-gray-900">{user.company?.name || 'N/A'}</p>
              </div>
              
              {user.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company ID (Share with new employees)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={user.company._id || user.company.id || 'Loading...'} 
                      readOnly 
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                    />
                    <button
                      onClick={() => {
                        const companyId = user.company._id || user.company.id;
                        if (companyId) {
                          navigator.clipboard.writeText(companyId);
                          setSuccess('Company ID copied to clipboard!');
                          setTimeout(() => setSuccess(''), 3000);
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Share this ID with employees who want to join your company during signup.</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              <Button onClick={handleStartEdit}>
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={profileForm.name}
                onChange={handleNameChange}
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={handleEmailChange}
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

      {/* Password Change Card */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          
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
  );
}
