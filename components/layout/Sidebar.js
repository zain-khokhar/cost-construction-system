'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/projects', label: 'Projects', icon: '🏗️' },
  { href: '/vendors', label: 'Vendors', icon: '🤝' },
  { href: '/reports', label: 'Reports', icon: '📈' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCompanyName();
  }, []);

  const fetchCompanyName = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCompanyName(data.data?.user?.company?.name || '');
      }
    } catch (error) {
      console.error('Failed to fetch company name:', error);
      setCompanyName('');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-md"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-40',
          'w-64',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'lg:translate-x-0'
        )}
      >
        {/* Company Name Header - Only render after mount to avoid hydration mismatch */}
        {mounted && companyName && (
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">
              {companyName}
            </h2>
            <p className="text-xs text-gray-600 mt-1">Construction Management</p>
          </div>
        )}

        <nav className="p-3 md:p-4 overflow-y-auto" style={{ height: mounted && companyName ? 'calc(100vh - 80px)' : '100vh' }}>
          <ul className="space-y-1 md:space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded hover:bg-gray-100 transition-colors text-sm md:text-base',
                    pathname === item.href ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  )}
                >
                  <span className="text-lg md:text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
