import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/Dashboard';
import NewProposal from './pages/Student/NewProposal';
import FacultyDashboard from './pages/Faculty/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import MyProjects from './pages/Student/MyProjects';
import ProjectDetails from './pages/Student/ProjectDetails';
import FacultyProjectDetails from './pages/Faculty/ProjectDetails';
import Milestones from './pages/Student/Milestones';
import ReviewQueue from './pages/Faculty/ReviewQueue';
import FacultyMyProjects from './pages/Faculty/MyProjects';
import Reviews from './pages/Faculty/Reviews';
import Workload from './pages/Faculty/Workload';
import MyGroups from './pages/Student/MyGroups';
import GroupDetails from './pages/Student/GroupDetails';
import Allocations from './pages/Admin/Allocations';
import Users from './pages/Admin/Users';
import Analytics from './pages/Admin/Analytics';
import AppShell from './components/layout/AppShell';
import { Toaster } from 'react-hot-toast';
import Spinner from './components/ui/Spinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AppShell>{children}</AppShell>;
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
          <Toaster position="top-right" />
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
                <MyProjects />
              </ProtectedRoute>
            } />
            <Route path="/student/projects/:id" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="/student/groups" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyGroups />
              </ProtectedRoute>
            } />
            <Route path="/student/groups/:id" element={
              <ProtectedRoute allowedRoles={['student']}>
                <GroupDetails />
              </ProtectedRoute>
            } />
            <Route path="/student/new-proposal" element={
              <ProtectedRoute allowedRoles={['student']}>
                <NewProposal />
              </ProtectedRoute>
            } />
            <Route path="/student/milestones" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Milestones />
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
                <FacultyMyProjects />
              </ProtectedRoute>
            } />
            <Route path="/faculty/projects/:id" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="/faculty/reviews" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <Reviews />
              </ProtectedRoute>
            } />
            <Route path="/faculty/review-queue" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <ReviewQueue />
              </ProtectedRoute>
            } />
            <Route path="/faculty/workload" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <Workload />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/allocations" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Allocations />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Analytics />
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
