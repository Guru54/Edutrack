import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>EduTrack</h1>
        </Link>
        
        {user && (
          <nav className="nav-menu">
            <span className="user-info">
              {user.fullName} ({user.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
