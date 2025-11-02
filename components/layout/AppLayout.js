'use client';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppLayout - Consistent layout wrapper with Sidebar + Navbar for authenticated pages
 * Wraps page content with the standard application layout structure
 */
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      {/* Main content area with margin for fixed sidebar */}
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
