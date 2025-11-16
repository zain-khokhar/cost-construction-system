'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState, useEffect, createContext, useContext } from 'react';

// Create sidebar context
const SidebarContext = createContext();

// Hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Sidebar provider component
export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        try {
          setIsCollapsed(JSON.parse(savedState));
        } catch (error) {
          console.error('Error parsing sidebar state:', error);
          localStorage.removeItem('sidebarCollapsed');
        }
      }
    }
  }, []);

  // Save state when it changes
  const handleSetCollapsed = (collapsed) => {
    setIsCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }
  };
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed, mounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: '/dashboard.ico' },
  { href: '/projects', label: 'Projects', icon: '/layers.ico' },
  { href: '/vendors', label: 'Vendors', icon: '/vendor.ico' },
  { href: '/reports', label: 'Reports', icon: '/report_1.ico' },
  { href: '/settings/currency', label: 'Currency Settings', icon: '/user.ico' },
  { href: '/profile', label: 'Profile', icon: '/user.ico' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isCollapsed, setIsCollapsed, mounted: sidebarMounted } = useSidebar();
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
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed top-2 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-md ${isMobileOpen ? "left-48" : "left-4"}`}
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
          {isMobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden lg:flex fixed top-4 z-50 p-2 rounded-md bg-blue-800 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ${
          isCollapsed ? 'left-20' : 'left-60'
        }`}
        aria-label="Toggle sidebar"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          'fixed top-0 left-0 h-screen bg-blue-900 border-r border-blue-800 transition-all duration-300 z-40 flex flex-col overflow-x-hidden',
          // Mobile: fixed width, slide in/out
          'lg:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop: dynamic width based on collapsed state
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          'w-64' // Mobile always full width
        )}
      >
        {/* Company Name Header - Only render after mount to avoid hydration mismatch */}
        {sidebarMounted && mounted && companyName && !isCollapsed && (
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-blue-800">
            <h2 className="text-base md:text-lg font-bold text-white truncate">
              {companyName}
            </h2>
            <p className="text-xs text-blue-200 mt-1">Construction Management</p>
          </div>
        )}

        {/* Collapsed header - just logo/icon */}
        {sidebarMounted && mounted && isCollapsed && (
          <div className="px-3 py-4 border-b border-blue-800 flex justify-center">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          </div>
        )}

        <nav className={clsx(
          "overflow-y-auto overflow-x-hidden transition-all duration-300 flex-1",
          isCollapsed ? "px-2" : "px-3 md:px-4"
        )}>
          <div className="py-3 md:py-4">
            <ul className="space-y-1 md:space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center rounded hover:bg-blue-800 transition-all duration-300 text-sm md:text-base group relative',
                    isCollapsed ? 'px-2 py-3 justify-center min-h-[48px]' : 'px-3 md:px-4 py-2 md:py-2.5 gap-3',
                    pathname === item.href ? 'bg-blue-700 text-white font-medium' : 'text-blue-100 hover:text-white'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon.startsWith('/') ? (
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className={clsx(
                        "brightness-0 invert transition-all duration-300 flex-shrink-0 quality-100",
                        isCollapsed ? "w-6 h-6" : "w-5 h-5 md:w-6 md:h-6"
                      )}
                    />
                  ) : (
                    <span className={clsx(
                      "transition-all duration-300 flex-shrink-0",
                      isCollapsed ? "text-xl" : "text-lg md:text-xl"
                    )}>{item.icon}</span>
                  )}
                  
                  {/* Label - hidden when collapsed on desktop */}
                  {!isCollapsed && (
                    <span className="transition-all duration-300 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 ml-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
