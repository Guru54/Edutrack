import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, allocationAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './NewProposal.css';

const NewProposal = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Minor Project',
    description: '',
    objectives: '',
    technologyStack: '',
    expectedOutcomes: '',
    academicYear: '2024-25',
    semester: '',
    guideId: ''
  });

  const [file, setFile] = useState(null);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch guides on component mount
  useEffect(() => {
    fetchGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGuides = async () => {
    try {
      setGuidesLoading(true);
      const response = await allocationAPI.getGuides();
      setGuides(response.data.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch guides');
    } finally {
      setGuidesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        showError('Only PDF, DOC, and DOCX files are allowed');
        e.target.value = '';
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Project title must be at least 10 characters';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.objectives.trim()) {
      newErrors.objectives = 'Objectives are required';
    } else if (formData.objectives.trim().length < 30) {
      newErrors.objectives = 'Objectives must be at least 30 characters';
    }

    if (!formData.technologyStack.trim()) {
      newErrors.technologyStack = 'Technology stack is required';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required';
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.guideId) {
      newErrors.guideId = 'Please select a guide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix all validation errors');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('projectType', formData.projectType);
      submitData.append('description', formData.description);
      submitData.append('objectives', formData.objectives);
      submitData.append('technologyStack', formData.technologyStack);
      submitData.append('expectedOutcomes', formData.expectedOutcomes);
      submitData.append('academicYear', formData.academicYear);
      submitData.append('semester', formData.semester);
      submitData.append('guideId', formData.guideId);
      
      if (file) {
        submitData.append('proposalDocument', file);
      }

      await projectAPI.create(submitData);

      showSuccess('Project proposal submitted successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student/projects');
      }, 2000);

    } catch (error) {
      setLoading(false);
      showError(error.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const handleCancel = () => {
    navigate('/student/dashboard');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="new-proposal">
      <div className="proposal-header">
        <h1>Submit New Project Proposal</h1>
        <p>Fill in all the required details to submit your project proposal</p>
      </div>

      <div className="proposal-card">
        <form onSubmit={handleSubmit} className="proposal-form">
          {/* Project Title */}
          <div className="form-group">
            <label htmlFor="title">
              Project Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your project title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Project Type */}
          <div className="form-group">
            <label htmlFor="projectType">
              Project Type <span className="required">*</span>
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className={errors.projectType ? 'error' : ''}
            >
              <option value="Minor Project">Minor Project</option>
              <option value="Major Project">Major Project</option>
            </select>
            {errors.projectType && <span className="error-message">{errors.projectType}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project in detail"
              rows="5"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Objectives */}
          <div className="form-group">
            <label htmlFor="objectives">
              Objectives <span className="required">*</span>
            </label>
            <textarea
              id="objectives"
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              placeholder="What are the main objectives of this project?"
              rows="4"
              className={errors.objectives ? 'error' : ''}
            />
            {errors.objectives && <span className="error-message">{errors.objectives}</span>}
          </div>

          {/* Technology Stack */}
          <div className="form-group">
            <label htmlFor="technologyStack">
              Technology Stack <span className="required">*</span>
            </label>
            <input
              type="text"
              id="technologyStack"
              name="technologyStack"
              value={formData.technologyStack}
              onChange={handleInputChange}
              placeholder="e.g., React, Node.js, MongoDB, Express"
              className={errors.technologyStack ? 'error' : ''}
            />
            {errors.technologyStack && <span className="error-message">{errors.technologyStack}</span>}
            <small className="field-hint">Enter comma-separated technologies</small>
          </div>

          {/* Expected Outcomes */}
          <div className="form-group">
            <label htmlFor="expectedOutcomes">
              Expected Outcomes
            </label>
            <textarea
              id="expectedOutcomes"
              name="expectedOutcomes"
              value={formData.expectedOutcomes}
              onChange={handleInputChange}
              placeholder="What results do you expect from this project?"
              rows="3"
            />
          </div>

          {/* Academic Year and Semester - Side by side */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="academicYear">
                Academic Year <span className="required">*</span>
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className={errors.academicYear ? 'error' : ''}
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
              {errors.academicYear && <span className="error-message">{errors.academicYear}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="semester">
                Semester <span className="required">*</span>
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className={errors.semester ? 'error' : ''}
              >
                <option value="">Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
              {errors.semester && <span className="error-message">{errors.semester}</span>}
            </div>
          </div>

          {/* Select Guide */}
          <div className="form-group">
            <label htmlFor="guideId">
              Select Guide <span className="required">*</span>
            </label>
            {guidesLoading ? (
              <div className="loading-guides">Loading guides...</div>
            ) : (
              <select
                id="guideId"
                name="guideId"
                value={formData.guideId}
                onChange={handleInputChange}
                className={errors.guideId ? 'error' : ''}
              >
                <option value="">Select a guide</option>
                {guides.map(guide => (
                  <option key={guide._id} value={guide._id}>
                    {guide.fullName} - {guide.department} ({guide.currentProjects} active projects)
                  </option>
                ))}
              </select>
            )}
            {errors.guideId && <span className="error-message">{errors.guideId}</span>}
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="proposalDocument">
              Upload Proposal Document
            </label>
            <input
              type="file"
              id="proposalDocument"
              name="proposalDocument"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <small className="field-hint">
              Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
            </small>
            {file && (
              <div className="file-preview">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Proposal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProposal;
