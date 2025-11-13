'use client';

import { useSidebar } from './Sidebar';
import clsx from 'clsx';

export default function MainContent({ children }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
      {children}
    </div>
  );
}