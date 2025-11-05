'use client';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppLayout - Consistent layout wrapper with Sidebar + Navbar for authenticated pages
 * Wraps page content with the standard application layout structure
 * Fully responsive: Mobile-first with hamburger menu, tablet optimized, desktop with fixed sidebar
 */
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main content area - responsive margin for sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
