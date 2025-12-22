import React, { useState } from 'react';
import { fileAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { validateFileSize, validateFileType } from '../../utils/validators';
import { formatFileSize } from '../../utils/helpers';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, projectId, milestoneId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileSize(file)) {
      showError('File size must be less than 10MB');
      return;
    }

    if (!validateFileType(file)) {
      showError('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, ZIP');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (projectId) formData.append('projectId', projectId);
    if (milestoneId) formData.append('milestoneId', milestoneId);

    try {
      const response = await fileAPI.upload(formData);
      showSuccess('File uploaded successfully');
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.data.file);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="file-input-wrapper">
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
        />
        <label htmlFor="file-input" className="file-input-label">
          {selectedFile ? selectedFile.name : 'Choose file'}
        </label>
      </div>

      {selectedFile && (
        <div className="file-info">
          <span className="file-size">{formatFileSize(selectedFile.size)}</span>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-upload"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
