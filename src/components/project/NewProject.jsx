import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SourceUploadModal from "./SourceUploadModal";
import "./NewProject.css";

function NewProject({ projects, setProjects }) {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const navigate = useNavigate();

    // 소스 업로드가 끝나면 바로 채팅 화면으로 이동
    const handleUploadComplete = (files) => {
        // 새 프로젝트 id는 가장 큰 id + 1
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        const newProject = {
            id: newId,
            title: "새 프로젝트",
            desc: "설명을 입력하세요.",
            files: files // 업로드한 파일 리스트 저장
        };
        setProjects([...projects, newProject]);
        navigate(`/chat/project/${newId}`);
    };

    const handleFileClick = (file) => {
        console.log("File clicked:", file);
        // ...이하 생략
    };

    return (
        <SourceUploadModal onUploadComplete={handleUploadComplete} />
    );
}

export default NewProject;