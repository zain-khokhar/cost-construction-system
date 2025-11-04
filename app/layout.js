'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import AIChatbot from '@/components/AIChatbot';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Define public routes that don't need Sidebar/Navbar
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        {isPublicRoute ? (
          // Public pages without Sidebar/Navbar
          children
        ) : (
          // Authenticated pages with Sidebar/Navbar
          <div className="flex min-h-screen">
            <Sidebar />
            {/* Main content area with margin for fixed sidebar */}
            <div className="flex-1 flex flex-col lg:ml-64">
              <Navbar />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
            {/* AI Chatbot - Available on all authenticated pages */}
            <AIChatbot />
          </div>
        )}
      </body>
    </html>
  );
}
