// Form validation helpers

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes) => {
  const fileType = file.type;
  const fileExt = file.name.split('.').pop().toLowerCase();
  
  const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'];
  
  if (allowedTypes) {
    return allowedTypes.includes(fileType) || allowedTypes.includes(fileExt);
  }
  
  return allowedExtensions.includes(fileExt);
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: '#f44336' };
  if (strength <= 4) return { level: 'medium', color: '#ff9800' };
  return { level: 'strong', color: '#4caf50' };
};

export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(e => e.msg || e.message).join(', ');
  }
  if (typeof errors === 'object') {
    return Object.values(errors).join(', ');
  }
  return errors;
};
