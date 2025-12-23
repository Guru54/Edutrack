// Helper utility functions

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const getDaysUntil = (date) => {
  const now = new Date();
  const future = new Date(date);
  const diffMs = future - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getProjectTypeLabel = (type) => {
  const types = {
    minor: 'Minor Project',
    major: 'Major Project'
  };
  return types[type] || type;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    proposed: '#2196F3',
    approved: '#4CAF50',
    in_progress: '#FF9800',
    completed: '#9C27B0',
    rejected: '#f44336',
    pending: '#757575',
    submitted: '#2196F3',
    needs_revision: '#FF9800'
  };
  return colors[status] || '#757575';
};

export const getStatusLabel = (status) => {
  const labels = {
    proposed: 'Proposed',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    pending: 'Pending',
    submitted: 'Submitted',
    needs_revision: 'Needs Revision'
  };
  return labels[status] || status;
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
