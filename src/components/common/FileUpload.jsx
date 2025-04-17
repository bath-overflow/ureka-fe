import React from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="file-upload">
      <label htmlFor="file-upload-input" className="file-upload-label">
        <div className="upload-icon">📄</div>
        <span>Upload PDF or other files</span>
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="file-input"
        />
      </label>
    </div>
  );
};

export default FileUpload; 