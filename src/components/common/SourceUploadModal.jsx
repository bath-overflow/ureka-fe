import React, { useRef, useState } from 'react';
import './SourceUploadModal.css';

const SourceUploadModal = ({ onUploadComplete }) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [
            ...prev,
            ...newFiles.filter(
                file => !prev.some(f => f.name === file.name && f.size === file.size)
            )
        ]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [
            ...prev,
            ...newFiles.filter(
                file => !prev.some(f => f.name === file.name && f.size === file.size)
            )
        ]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDone = () => {
        if (onUploadComplete) onUploadComplete(files);
        setFiles([]);
    };

    return (
        <div className="new-project-bg">
            <div className="new-project-modal">
                <h1>소스 추가</h1>
                <div className="desc">소스를 추가하면...(설명)</div>
                <div
                    className="upload-area"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current.click()}
                >
                    <div className="upload-icon">⬆️</div>
                    <div>파일을 선택하거나 드래그앤 드롭</div>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept=".pdf"
                    />
                </div>
                <div className="divider" />
                <div className="file-count">
                    <span style={{ color: "#2563eb" }}>현재 업로드한 소스: {files.length}개</span>
                </div>
                {files.length > 0 && (
                    <ul className="file-list">
                        {files.map((file, idx) => (
                            <li key={idx}>{file.name}</li>
                        ))}
                    </ul>
                )}
                <button className="done-btn" onClick={handleDone}>Done</button>
            </div>
        </div>
    );
};

export default SourceUploadModal;