'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingRequests();
      // Poll for new requests every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/auth/pending-requests');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data.requests || []);
        setPendingCount(data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const res = await fetch('/api/auth/pending-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' })
      });

      if (res.ok) {
        await fetchPendingRequests();
        alert('User approved successfully!');
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      const res = await fetch('/api/auth/pending-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject' })
      });

      if (res.ok) {
        await fetchPendingRequests();
        alert('User rejected successfully!');
      }
    } catch (error) {
      console.error('Failed to reject user:', error);
      alert('Failed to reject user');
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
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <h1 className="text-base md:text-xl font-bold text-gray-900 ml-12 lg:ml-0 truncate">
          <span className="hidden sm:inline">Construction Cost Management</span>
          <span className="sm:hidden">CCM</span>
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <>
              {/* Bell Icon for Admin */}
              {user.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                    {pendingCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown - Responsive width */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-screen max-w-sm md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 mx-2 md:mx-0">
                      <div className="p-3 md:p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Pending User Requests</h3>
                        <p className="text-xs md:text-sm text-gray-500">{pendingCount} users waiting for approval</p>
                      </div>

                      <div className="max-h-72 md:max-h-96 overflow-y-auto">
                        {pendingRequests.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No pending requests
                          </div>
                        ) : (
                          pendingRequests.map((request) => (
                            <div key={request._id} className="p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm md:text-base">{request.name}</p>
                                  <p className="text-xs md:text-sm text-gray-500 truncate">{request.email}</p>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                                    {request.role}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mb-2 md:mb-3">
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(request._id)}
                                  className="flex-1 px-2 md:px-3 py-1.5 bg-green-500 text-white text-xs md:text-sm rounded hover:bg-green-600 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request._id)}
                                  className="flex-1 px-2 md:px-3 py-1.5 bg-red-500 text-white text-xs md:text-sm rounded hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => router.push('/profile')}
                className="text-xs md:text-sm hover:bg-gray-50 p-1.5 md:p-2 rounded-lg transition-colors hidden sm:block"
              >
                <p className="font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">{user.name}</p>
                <p className="text-gray-500 capitalize">{user.role}</p>
              </button>
              <Button variant="outline" onClick={handleLogout} className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}
