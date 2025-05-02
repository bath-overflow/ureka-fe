import React, { useRef, useState } from "react";
import "./NewProject.css";

function NewProject() {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setFiles(Array.from(e.dataTransfer.files));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="new-project-bg">
            <div className="new-project-modal">
                <button className="close-btn" /* onClick={...} */>×</button>
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
                    현재 업로드한 소스: {files.length}개
                </div>
                <button className="done-btn">Done</button>
            </div>
        </div>
    );
}

export default NewProject;