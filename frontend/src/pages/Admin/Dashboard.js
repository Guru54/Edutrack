import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';
import Loading from '../../../components/common/Loading';
import '../Student/Dashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading analytics..." />;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {analytics && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{analytics.overview.totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analytics.overview.totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analytics.overview.totalFaculty}</div>
              <div className="stat-label">Faculty</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analytics.overview.pendingReviews}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Recent Projects</h2>
            {analytics.recentProjects && analytics.recentProjects.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Group</th>
                      <th>Guide</th>
                      <th>Status</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentProjects.map(project => (
                      <tr key={project._id}>
                        <td>{project.title}</td>
                        <td>{project.groupId?.groupName || 'N/A'}</td>
                        <td>{project.guideId?.fullName || 'Not Assigned'}</td>
                        <td>
                          <span className="status-badge">{project.status}</span>
                        </td>
                        <td>{project.projectType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No projects yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
