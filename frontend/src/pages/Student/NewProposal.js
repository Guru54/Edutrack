import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, userAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { isGroupLeader } from '../../utils/group';

const NewProposal = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Minor Project',
    description: '',
    objectives: '',
    technologyStack: '',
    expectedOutcomes: '',
    academicYear: '2024-25',
    semester: '',
    guideId: '',
    groupId: ''
  });
  const [file, setFile] = useState(null);
  const [guides, setGuides] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchGuides = useCallback(async () => {
    try {
      setGuidesLoading(true);
      const response = await userAPI.getGuides();
      setGuides(response.data.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch guides');
    } finally {
      setGuidesLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const fetchGroups = useCallback(async () => {
    if (!user?.id) return;
    try {
      setGroupsLoading(true);
      const res = await userAPI.getUserGroups(user.id);
      const fetched = res.data.groups || [];
      setGroups(fetched);
      if (fetched.length > 0) {
        setFormData((prev) => {
          if (prev.groupId) return prev;
          return { ...prev, groupId: fetched[0]._id };
        });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setGroupsLoading(false);
    }
  }, [showError, user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const selectedGroup = groups.find((g) => g._id === formData.groupId);
  const isLeader = isGroupLeader(selectedGroup, user?.id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        showError('Only PDF, DOC, and DOCX files are allowed');
        e.target.value = '';
        return;
      }

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
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    else if (formData.title.trim().length < 10) newErrors.title = 'Project title must be at least 10 characters';

    if (!formData.projectType) newErrors.projectType = 'Project type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 50) newErrors.description = 'Description must be at least 50 characters';

    if (!formData.objectives.trim()) newErrors.objectives = 'Objectives are required';
    else if (formData.objectives.trim().length < 30) newErrors.objectives = 'Objectives must be at least 30 characters';

    if (!formData.technologyStack.trim()) newErrors.technologyStack = 'Technology stack is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.guideId) newErrors.guideId = 'Please select a guide';
    if (!formData.groupId) newErrors.groupId = 'Please select a group';
    if (formData.groupId && selectedGroup && !isLeader) {
      newErrors.groupId = 'Only the group leader can submit a proposal';
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
      const submitData = new FormData();
      const optionalFields = ['expectedOutcomes'];
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value !== '' || optionalFields.includes(key)) {
            submitData.append(key, value);
          }
        }
      });
      if (file) submitData.append('proposalDocument', file);

      await projectAPI.create(submitData);
      showSuccess('Project proposal submitted successfully!');
      setTimeout(() => navigate('/student/projects'), 1200);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">New Proposal</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Submit your project idea</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Provide detailed information so faculty can review and approve quickly.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Project Title"
              name="title"
              placeholder="Enter your project title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
            />
            <Select
              label="Group"
              name="groupId"
              value={formData.groupId}
              onChange={handleInputChange}
              error={errors.groupId}
              disabled={groupsLoading}
            >
              <option value="">{groupsLoading ? 'Loading groups...' : 'Select a group'}</option>
              {groups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.groupName} ({group.members?.length || 0} members)
                </option>
              ))}
            </Select>
          </div>

          {selectedGroup && !isLeader && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Only the group leader can submit a proposal. Please ask your leader to submit.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Project Type"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              error={errors.projectType}
            >
              <option value="Minor Project">Minor Project</option>
              <option value="Major Project">Major Project</option>
            </Select>
          </div>

          <Textarea
            label="Description"
            name="description"
            rows={5}
            placeholder="Describe your project in detail"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
          />

          <Textarea
            label="Objectives"
            name="objectives"
            rows={4}
            placeholder="What are the main objectives of this project?"
            value={formData.objectives}
            onChange={handleInputChange}
            error={errors.objectives}
          />

          <Input
            label="Technology Stack"
            name="technologyStack"
            placeholder="e.g., React, Node.js, MongoDB, Express"
            value={formData.technologyStack}
            onChange={handleInputChange}
            error={errors.technologyStack}
            hint="Enter comma-separated technologies"
          />

          <Textarea
            label="Expected Outcomes"
            name="expectedOutcomes"
            rows={3}
            placeholder="What results do you expect from this project?"
            value={formData.expectedOutcomes}
            onChange={handleInputChange}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              error={errors.academicYear}
            >
              <option value="2023-24">2023-24</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </Select>
            <Select
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              error={errors.semester}
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Select Guide"
              name="guideId"
              value={formData.guideId}
              onChange={handleInputChange}
              error={errors.guideId}
              disabled={guidesLoading}
            >
              <option value="">{guidesLoading ? 'Loading guides...' : 'Select a guide'}</option>
              {guides.map(guide => (
                <option key={guide._id} value={guide._id}>
                  {guide.fullName} - {guide.department} ({guide.currentProjects} active projects)
                </option>
              ))}
            </Select>

            <div className="space-y-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <CloudArrowUpIcon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium">Upload Proposal (optional)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              </label>
              {file && (
                <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-sm dark:bg-gray-800">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/student/dashboard')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={loading || (selectedGroup && !isLeader)}>
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </Card>
      {guidesLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          Loading guides...
        </div>
      )}
    </div>
  );
};

export default NewProposal;
