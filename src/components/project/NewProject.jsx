import React, { useState } from "react";
import SourceUploadModal from "./SourceUploadModal";
import "./NewProject.css";

function NewProject() {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [step, setStep] = useState(0); // 0: 소스 업로드, 1: 프로젝트 정보 입력

    const handleUploadComplete = (files) => {
        setUploadedFiles(files);
        setStep(1);
    };

    return (
        <>
            {step === 0 && (
                <SourceUploadModal onUploadComplete={handleUploadComplete} />
            )}
            {step === 1 && (
                <div className="new-project-bg">
                    <div className="new-project-modal">
                        <h1>프로젝트 정보 입력</h1>
                        <div className="desc">여기에 프로젝트 정보 입력 폼 등...</div>
                        <div className="file-count">
                            업로드한 소스: {uploadedFiles.length}개
                        </div>
                        {/* 프로젝트 생성 폼 등 추가 */}
                    </div>
                </div>
            )}
        </>
    );
}

export default NewProject;