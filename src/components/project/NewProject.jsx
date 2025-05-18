import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SourceUploadModal from "./SourceUploadModal";
import "./NewProject.css";
import { useResourceUpload } from '../../hooks/useResourceUpload';
import { uploadFileDirect } from '../../hooks/useResourceUpload';

function NewProject({ projects, setProjects }) {
    const navigate = useNavigate();

    const handleUploadComplete = async (files) => {
        const newproject_form = {
            title: "새 프로젝트",
            desc: "설명을 입력하세요."
        };

        try {
            const createRes = await fetch("/api/projects/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newproject_form),
            });

            if (!createRes.ok) throw new Error("프로젝트 생성 실패");

            const newProject = await createRes.json();
            const projectId = newProject.id;

            // hooks 대신 일반 함수 사용
            for (const file of files) {
                await uploadFileDirect(projectId, file);
            }

            setProjects((prev) => [...prev, newProject]);
            navigate(`/chat/project/${projectId}`);
        } catch (err) {
            console.error("❌ 프로젝트 생성/업로드 실패:", err);
            alert("프로젝트 생성 또는 업로드에 실패했습니다.");
        }
    };


    return <SourceUploadModal onUploadComplete={handleUploadComplete} />;
}

export default NewProject;
