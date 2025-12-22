import React from 'react';
import {
  Bars3CenterLeftIcon,
  MoonIcon,
  SunIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

export default function Topbar({ onToggleSidebar, user, onLogout, isDark, toggleDarkMode }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Bars3CenterLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">EduTrack</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Guest'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <span className="hidden sm:inline">{user?.fullName || user?.name || 'User'}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {user?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout} icon={PowerIcon}>
          Logout
        </Button>
      </div>
    </header>
  );
}
