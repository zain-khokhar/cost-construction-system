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
      <div className="min-h-screen bg-gray-50 sm:bg-white">
        <div className="bg-white border-b border-gray-200 sm:hidden sticky top-0 z-10">
          <div className="px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <div className="text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4">
              <div className="animate-spin rounded-full h-full w-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 sm:bg-white">
        <div className="bg-white border-b border-gray-200 sm:hidden sticky top-0 z-10">
          <div className="px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load profile</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4">There was an error loading your profile information.</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-white">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sm:hidden sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and security settings</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 sm:px-4 rounded-lg mb-4 text-sm sm:text-base">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-3 sm:px-4 rounded-lg mb-4 text-sm sm:text-base">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Personal Information Card */}
        <Card className="mb-4 sm:mb-6 shadow-sm sm:shadow-md">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Information</h3>
            </div>
            
            {!editing ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Avatar Section - Mobile Enhanced */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-100 sm:border-none">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm sm:text-base text-gray-600">{user.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Name</label>
                    <p className="text-base sm:text-lg text-gray-900 font-medium">{user.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="text-base sm:text-lg text-gray-900 break-all sm:break-normal">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Role & Permissions</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize w-fit">
                        {getRoleDisplayName(user.role)}
                      </span>
                      <p className="text-sm text-gray-600">{getRoleDescription(user.role)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Company</label>
                    <p className="text-base sm:text-lg text-gray-900">{user.company?.name || 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                    <p className="text-base sm:text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {user.company && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-2">Company ID (Share with new employees)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={user.company._id || user.company.id || 'Loading...'} 
                        readOnly 
                        className="flex-1 bg-white border border-blue-200 rounded-md px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy ID
                        </span>
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">Share this ID with employees who want to join your company during signup.</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    onClick={handleStartEdit}
                    className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <Input
                    label="Full Name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleNameChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={handleEmailChange}
                    required
                    placeholder="Enter your email address"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="w-full sm:w-auto sm:flex-1 min-w-[100px] border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto sm:flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Security Card */}
        <Card className="shadow-sm sm:shadow-md">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your account security and password</p>
              </div>
            </div>
            
            {!changingPassword ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600 mt-1">Last updated: {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Secured</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartPasswordChange}
                  variant="outline"
                  className="w-full sm:w-auto min-w-[160px] border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handleCurrentPasswordChange}
                    required
                    placeholder="Enter your current password"
                    className="w-full"
                  />
                  
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handleNewPasswordChange}
                    required
                    minLength={6}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full"
                  />
                  
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    minLength={6}
                    placeholder="Confirm your new password"
                    className="w-full"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Security Reminder</h4>
                      <p className="text-sm text-yellow-700 mt-1">Choose a strong password with at least 6 characters. You'll need to log in again after changing your password.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    variant="outline"
                    className="w-full sm:w-auto sm:flex-1 min-w-[100px] border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto sm:flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Update Password
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
