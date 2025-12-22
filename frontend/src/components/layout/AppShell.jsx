import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark(prev => !prev) };
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleDark } = useDarkMode();

  const role = useMemo(() => user?.role || 'student', [user]);

  return (
    <div className={clsx('min-h-screen', isDark && 'dark')}>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col">
          <Topbar
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            user={user}
            onLogout={logout}
            isDark={isDark}
            toggleDarkMode={toggleDark}
          />
          <main className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
