import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/projects', label: 'My Projects', icon: '📁' },
    { path: '/student/new-proposal', label: 'New Proposal', icon: '➕' },
    { path: '/student/groups', label: 'My Groups', icon: '👥' }
  ];

  const facultyLinks = [
    { path: '/faculty/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/faculty/projects', label: 'My Projects', icon: '📁' },
    { path: '/faculty/reviews', label: 'Pending Reviews', icon: '📝' }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/projects', label: 'All Projects', icon: '📁' },
    { path: '/admin/allocations', label: 'Allocations', icon: '🔄' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' }
  ];

  const getLinks = () => {
    if (user?.role === 'student') return studentLinks;
    if (user?.role === 'faculty') return facultyLinks;
    if (user?.role === 'admin') return adminLinks;
    return [];
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {getLinks().map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${isActive(link.path)}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
