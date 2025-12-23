import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { milestoneAPI, projectAPI, fileAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDate, getProjectTypeLabel } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, milestoneId: null });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        projectAPI.getById(id),
        milestoneAPI.getByProject(id)
      ]);
      
      const projectData = projectRes.data?.project || projectRes.data?.data || projectRes.data;
      setProject(projectData);
      
      const milestoneData = milestonesRes.data?.milestones || milestonesRes.data?.data || [];
      setMilestones(milestoneData);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitWork = async () => {
    if (!submissionFile || !feedbackModal.milestoneId) return;
    const data = new FormData();
    data.append('file', submissionFile);
    try {
      setSubmitting(true);
      await milestoneAPI.submit(feedbackModal.milestoneId, data);
      showSuccess('Submission uploaded');
      setFeedbackModal({ open: false, milestoneId: null });
      setSubmissionFile(null);
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
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
      <Card className="text-center">
        <p className="text-sm text-gray-500">Project not found.</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => navigate('/student/projects')}>Back to projects</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">Project Details</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
        </div>
        <Badge status={project.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Summary">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Type</span>
              <span>{getProjectTypeLabel(project.projectType)}</span>
            </div>
            <div className="flex justify-between"><span>Academic Year</span><span>{project.academicYear}</span></div>
            <div className="flex justify-between"><span>Semester</span><span>{project.semester}</span></div>
            <div className="flex justify-between"><span>Submitted</span><span>{formatDate(project.submissionDate)}</span></div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {project.proposalFile ? (
                <a 
                  href={fileAPI.download(project.proposalFile._id || project.proposalFile)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors dark:bg-brand-900/30 dark:text-brand-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Proposal PDF
                </a>
              ) : (
                <p className="text-xs text-center text-gray-400 italic">No proposal document uploaded</p>
              )}
            </div>
          </div>
        </Card>
        <Card title="Team Members">
          <div className="space-y-3">
            {project.groupId?.members?.map((member) => (
              <div key={member.studentId?._id || member.studentId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                    {(member.fullName || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{member.fullName}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {member.email} {member.studentId?.phone && `• ${member.studentId.phone}`}
                    </p>
                  </div>
                </div>
                <Badge status={member.role === 'leader' ? 'approved' : 'pending'}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Guide">
          {project.guideId ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.guideId.fullName}</p>
              <p className="text-gray-500 dark:text-gray-400">{project.guideId.department}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Awaiting guide allocation.</p>
          )}
        </Card>
        <Card title="Technology">
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(project.technologyStack) 
              ? project.technologyStack 
              : (project.technologyStack?.split(',') || [])
            ).map((tag, idx) => (
              <span key={`${idx}-${tag}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                {tag.trim()}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Objectives">
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
            {(project.objectives || '').split('.').filter(Boolean).map((obj, idx) => (
              <li key={`${idx}-${obj.trim().slice(0,20)}`}>{obj.trim()}</li>
            ))}
          </ul>
        </Card>
        <Card title="Expected Outcomes">
          <p className="text-sm text-gray-700 dark:text-gray-200">{project.expectedOutcomes || 'Not specified'}</p>
        </Card>
      </div>

      <Card title="Milestones" description="Track and submit milestone deliverables">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {milestones.map(ms => (
              <div key={ms._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ms.title}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(ms.dueDate)}</p>
                  </div>
                  <Badge status={ms.status || 'pending'} />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ms.description}</p>
                
                {ms.fileIds && ms.fileIds.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {ms.fileIds.map((file) => (
                      <a
                        key={file._id}
                        href={fileAPI.download(file._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {file.fileName || 'View Submission'}
                      </a>
                    ))}
                  </div>
                )}

                {ms.feedback && (
                  <div className="mt-3 rounded-lg bg-brand-50 p-2 dark:bg-brand-900/20">
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Feedback</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{ms.feedback.feedbackText || ms.feedback}"</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{ms.status === 'pending' ? 'Not submitted' : 'Submitted'}</span>
                  {ms.status === 'pending' || ms.status === 'needs_revision' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFeedbackModal({ open: true, milestoneId: ms._id })}
                    >
                      Submit work
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {milestones.length === 0 && <p className="text-sm text-gray-500">No milestones yet.</p>}
          </div>
        </div>
      </Card>

      <Modal
        open={feedbackModal.open}
        onClose={() => setFeedbackModal({ open: false, milestoneId: null })}
        title="Submit milestone work"
        description="Upload your deliverable or supporting document."
        primaryAction={{
          label: submitting ? 'Uploading...' : 'Upload',
          onClick: handleSubmitWork,
          loading: submitting
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setFeedbackModal({ open: false, milestoneId: null })
        }}
      >
        <div className="space-y-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip"
            onChange={e => setSubmissionFile(e.target.files?.[0])}
            className="text-sm"
          />
          {submissionFile && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Selected: {submissionFile.name}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
