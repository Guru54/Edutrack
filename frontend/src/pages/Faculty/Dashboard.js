import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';
import Loading from '../../../components/common/Loading';
import { formatDate, getStatusColor, getStatusLabel } from '../../../utils/helpers';
import '../Student/Dashboard.css';

const FacultyDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const projectsRes = await projectAPI.getAll();
      const projectsData = projectsRes.data.projects || [];
      setProjects(projectsData);

      const statsData = {
        total: projectsData.length,
        pendingReview: projectsData.filter(p => p.status === 'proposed').length,
        approved: projectsData.filter(p => p.status === 'approved').length,
        inProgress: projectsData.filter(p => p.status === 'in_progress').length
      };
      setStats(statsData);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="dashboard">
      <h1>Faculty Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingReview}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Assigned Projects</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects assigned yet.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project._id} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span 
                    className="project-status"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span>Type: {project.projectType}</span>
                  <span>Submitted: {formatDate(project.submissionDate)}</span>
                </div>
                {project.groupId && (
                  <div className="project-guide">
                    <strong>Group:</strong> {project.groupId.groupName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
