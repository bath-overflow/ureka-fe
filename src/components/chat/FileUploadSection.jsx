import React from 'react';
import FileUpload from '../common/FileUpload';
import './FileUploadSection.css';

const FileUploadSection = ({ noteName, onBack, onFileUpload, uploadedFile, loading, error }) => {
  return (
    <div className="file-upload-section">
      <div className="note-header">
        <button onClick={onBack} className="back-button">
          ←
        </button>
        <h2>{noteName}</h2>
      </div>
      <FileUpload onFileUpload={onFileUpload} />
      {loading && <div className="loading">Uploading...</div>}
      {error && <div className="error">{error}</div>}
      {uploadedFile && (
        <div className="uploaded-file-info">
          <p>Uploaded: {uploadedFile.name}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection; 