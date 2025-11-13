'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar, { SidebarProvider } from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
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
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              {/* Main content area with responsive margin for sidebar */}
              <MainContent>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
              </MainContent>
              {/* AI Chatbot - Available on all authenticated pages */}
              <AIChatbot />
            </div>
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}
