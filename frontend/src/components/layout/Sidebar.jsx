import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentPlusIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  InboxIcon,
  PresentationChartBarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navByRole = {
  student: [
    { label: 'Dashboard', icon: HomeIcon, to: '/student/dashboard' },
    { label: 'New Proposal', icon: DocumentPlusIcon, to: '/student/new-proposal' },
    { label: 'My Projects', icon: ClipboardDocumentListIcon, to: '/student/projects' },
    { label: 'Milestones', icon: Squares2X2Icon, to: '/student/milestones' }
  ],
  faculty: [
    { label: 'Dashboard', icon: HomeIcon, to: '/faculty/dashboard' },
    { label: 'Review Queue', icon: InboxIcon, to: '/faculty/review-queue' },
    { label: 'My Projects', icon: ClipboardDocumentListIcon, to: '/faculty/projects' },
    { label: 'Milestone Reviews', icon: PresentationChartBarIcon, to: '/faculty/reviews' },
    { label: 'Workload', icon: WrenchScrewdriverIcon, to: '/faculty/workload' }
  ],
  admin: [
    { label: 'Dashboard', icon: HomeIcon, to: '/admin/dashboard' },
    { label: 'Allocations', icon: AcademicCapIcon, to: '/admin/allocations' },
    { label: 'Users', icon: UserGroupIcon, to: '/admin/users' },
    { label: 'Analytics', icon: ChartBarIcon, to: '/admin/analytics' }
  ]
};

export default function Sidebar({ role = 'student', open, onClose }) {
  const links = navByRole[role] || [];
  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg transition-transform dark:bg-gray-950 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-lg font-bold text-brand-700 dark:text-brand-400">EduTrack</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role} panel</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
                  isActive && 'bg-brand-50 text-brand-700 hover:bg-brand-50 dark:bg-brand-900/30 dark:text-brand-200'
                )
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 px-4 py-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          © {new Date().getFullYear()} EduTrack
        </div>
      </div>
    </aside>
  );
}
