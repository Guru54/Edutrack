import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, milestoneAPI, fileAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatDate, getProjectTypeLabel } from '../../utils/helpers';

export default function FacultyProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });
  const [reviewModal, setReviewModal] = useState({ open: false, milestoneId: null, feedback: '', status: 'approved' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, milestonesRes] = await Promise.all([
        projectAPI.getById(id),
        milestoneAPI.getByProject(id)
      ]);
      
      const projectData = projectRes.data?.project || projectRes.data?.data || projectRes.data;
      setProject(projectData);
      
      const milestoneData = milestonesRes.data?.milestones || milestonesRes.data?.data || [];
      setMilestones(milestoneData);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await projectAPI.approve(id);
      showSuccess('Project proposal approved');
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve project');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessing(true);
      await projectAPI.reject(id, rejectModal.reason);
      showSuccess('Project proposal rejected');
      setRejectModal({ open: false, reason: '' });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject project');
    } finally {
      setProcessing(false);
    }
  };

  const handleReviewMilestone = async () => {
    if (!reviewModal.feedback.trim()) {
      showError('Please enter feedback before submitting');
      return;
    }
    try {
      setProcessing(true);
      await milestoneAPI.provideFeedback(reviewModal.milestoneId, {
        status: reviewModal.status,
        feedbackText: reviewModal.feedback
      });
      showSuccess('Milestone review submitted');
      setReviewModal({ open: false, milestoneId: null, feedback: '', status: 'approved' });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title || !milestoneForm.dueDate) {
      showError('Milestone title and due date are required');
      return;
    }
    try {
      setProcessing(true);
      await milestoneAPI.create(id, milestoneForm);
      showSuccess('Milestone added');
      setMilestoneForm({ title: '', dueDate: '', description: '' });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to add milestone');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="text-center py-10">
        <p className="text-gray-500">Project not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/faculty/projects')}>
          Back to Projects
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
          title="Go Back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">Project Details</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Proposal</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h2>
            <Badge status={project.status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {getProjectTypeLabel(project.projectType)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {project.academicYear} • Sem {project.semester}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {project.status === 'proposed' && (
            <>
              <Button 
                variant="success" 
                onClick={handleApprove}
                loading={processing}
                className="shadow-sm"
              >
                Approve Proposal
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setRejectModal({ ...rejectModal, open: true })}
                disabled={processing}
                className="shadow-sm"
              >
                Reject
              </Button>
            </>
          )}
          {project.proposalFile ? (
            <a 
              href={fileAPI.download(project.proposalFile._id || project.proposalFile)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors dark:bg-brand-900/30 dark:text-brand-200 border border-brand-100 dark:border-brand-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Proposal PDF
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
              No PDF attached
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b dark:border-gray-800">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Project Description</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b dark:border-gray-800">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Objectives & Outcomes</h3>
            </div>
            <div className="grid gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-xs text-brand-600 uppercase tracking-widest mb-2">Core Objectives</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.objectives || 'No objectives specified'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-xs text-brand-600 uppercase tracking-widest mb-2">Expected Outcomes</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.expectedOutcomes || 'No outcomes specified'}</p>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-3">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologyStack?.map((tech, i) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-xs font-bold border border-brand-100 dark:border-brand-800/50">
                      {tech}
                    </span>
                  )) || <span className="text-sm text-gray-400 italic">None specified</span>}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6 pb-2 border-b dark:border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Project Milestones</h3>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                {milestones.length} Total
              </span>
            </div>

            {/* Add Milestone Form */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New Milestone
              </h4>
              <form onSubmit={handleCreateMilestone} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Milestone Title"
                    placeholder="e.g., Literature Review"
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    required
                  />
                  <Input
                    label="Due Date"
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Description"
                  placeholder="What needs to be accomplished?"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  textarea
                  rows={2}
                />
                <Button type="submit" variant="primary" size="sm" className="w-full" disabled={processing}>
                  {processing ? 'Adding...' : 'Create Milestone'}
                </Button>
              </form>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 font-medium">No milestones created yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m._id} className="group border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-brand-300 dark:hover:border-brand-800 transition-all hover:shadow-md bg-white dark:bg-gray-900/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors">{m.title}</h4>
                          <Badge status={m.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Due: {formatDate(m.dueDate)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                    
                    {m.status !== 'pending' && (
                      <div className="mt-5 p-4 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl border border-brand-100/50 dark:border-brand-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Submission</span>
                          </div>
                          {m.fileIds && m.fileIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {m.fileIds.map((file) => (
                                <a
                                  key={file._id || file}
                                  href={fileAPI.download(file._id || file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-brand-100 dark:border-gray-700 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  {file.fileName || 'Download'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mb-3">Submitted on {formatDate(m.submissionDate)}</p>
                        
                        {m.submissionText && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">"{m.submissionText}"</p>
                        )}

                        {m.feedback && (
                          <div className="mt-3 pt-3 border-t border-brand-100 dark:border-brand-800/50">
                            <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">Faculty Feedback</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{m.feedback.feedbackText || m.feedback}"</p>
                          </div>
                        )}
                        
                        {m.status === 'submitted' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="mt-4 w-full shadow-md"
                            onClick={() => setReviewModal({ ...reviewModal, open: true, milestoneId: m._id })}
                          >
                            Review & Provide Feedback
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b dark:border-gray-800">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Group Details</h3>
            </div>
            {project.groupId ? (
              <div className="space-y-6">
                <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-800/50">
                  <h4 className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Team Name</h4>
                  <p className="text-xl font-black text-brand-900 dark:text-brand-100">{project.groupId.groupName}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Team Members</h4>
                  <div className="space-y-4">
                    {project.groupId.members?.map((m) => (
                      <div key={m.studentId?._id || m.studentId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
                          {(m.fullName || m.studentId?.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {m.fullName || m.studentId?.fullName || 'Unknown Student'}
                          </p>
                          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 italic">No group assigned yet.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b dark:border-gray-800">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Timeline</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatDate(project.submissionDate)}</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              
              {project.approvalDate && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Approved</span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatDate(project.approvalDate)}</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Activity</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatDate(project.updatedAt)}</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ ...rejectModal, open: false })}
        title="Reject Project Proposal"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please provide a reason for rejecting this proposal. This will be sent to the students.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            placeholder="e.g. Scope is too narrow, technology stack not suitable..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectModal({ ...rejectModal, open: false })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={processing}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Milestone Review Modal */}
      <Modal
        open={reviewModal.open}
        onClose={() => setReviewModal({ ...reviewModal, open: false })}
        title="Review Milestone Submission"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
              value={reviewModal.status}
              onChange={(e) => setReviewModal({ ...reviewModal, status: e.target.value })}
            >
              <option value="approved">Approve</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
          <Textarea
            label="Feedback"
            value={reviewModal.feedback}
            onChange={(e) => setReviewModal({ ...reviewModal, feedback: e.target.value })}
            placeholder="Provide feedback to the students..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReviewModal({ ...reviewModal, open: false })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReviewMilestone} loading={processing}>
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
