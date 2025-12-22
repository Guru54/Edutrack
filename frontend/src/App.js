import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Notification from './components/common/Notification';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/Dashboard';
import NewProposal from './pages/Student/NewProposal';
import FacultyDashboard from './pages/Faculty/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Notification />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/projects" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="page-placeholder">
                  <h1>My Projects</h1>
                  <p>Projects page - To be implemented with full project list and details</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/student/new-proposal" element={
              <ProtectedRoute allowedRoles={['student']}>
                <NewProposal />
              </ProtectedRoute>
            } />
            <Route path="/student/groups" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="page-placeholder">
                  <h1>My Groups</h1>
                  <p>Groups management - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/faculty/projects" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <div className="page-placeholder">
                  <h1>My Projects</h1>
                  <p>Assigned projects - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/faculty/reviews" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <div className="page-placeholder">
                  <h1>Pending Reviews</h1>
                  <p>Project reviews - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="page-placeholder">
                  <h1>All Projects</h1>
                  <p>All projects management - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/admin/allocations" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="page-placeholder">
                  <h1>Guide Allocations</h1>
                  <p>Allocation management - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="page-placeholder">
                  <h1>User Management</h1>
                  <p>User management - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="page-placeholder">
                  <h1>Analytics</h1>
                  <p>Detailed analytics - To be implemented</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={
              <div className="unauthorized">
                <h1>Unauthorized</h1>
                <p>You do not have permission to access this page.</p>
              </div>
            } />
            <Route path="*" element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
              </div>
            } />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
