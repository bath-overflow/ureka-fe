import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './ResourcesScreen.css';
import { useResourceUpload } from '../../hooks/useResourceUpload';
import { handleFileUploadWithLimit } from '../../hooks/useResourceUpload';
import MarkdownViewer from "../common/MarkdownViewer";
import PdfViewer from "../common/PdfViewer";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


function ResourcesScreen({ setCurrentProjectId, currentProjectId, projects }) {
    const { projectId } = useParams();
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [activeFile, setActiveFile] = useState(null); // ✅ 선택된 파일 상태
    const isMarkdown = (filename) => filename.toLowerCase().endsWith('.md');

    const {
        files,
        loading,
        fetchFiles,
        uploadFile,
        deleteFile
    } = useResourceUpload(projectId);

    const mockFile = {
        filename: "mock.md",
        file_url: "mock"
    };

    useEffect(() => {
        if (!projectId || projects.length === 0) return;
        setCurrentProjectId(projectId);
        fetchFiles();
    }, [projectId, projects.length, setCurrentProjectId, fetchFiles]);

    // 현재 프로젝트 찾기
    const project = projects.find(p => String(p.id) === String(projectId));
    const projectTitle = project?.title || "프로젝트";


    const handleUpload = async (e) => {
        const file = e.target.files[0];
        await handleFileUploadWithLimit({
            file,
            projectId,
            uploadFunction: async (_, file) => uploadFile(file), // useResourceUpload 내부 함수
        });
    };


    const handleDelete = async (filename) => {
        if (!window.confirm(`정말 "${filename}" 파일을 삭제할까요?`)) return;
        try {
            await deleteFile(filename);
        } catch {
            alert('파일 삭제 중 오류 발생');
        }
    };

    const handleFileClick = (file) => {
        const fallbackUrl = `/api/projects/${projectId}/resources/${encodeURIComponent(file.filename)}`;
        const finalUrl = file.file_url || fallbackUrl;

        if (isPdf(file.filename)) {
            setActiveFile({ ...file, type: 'pdf', file_url: finalUrl }); // ✅ PDF 컴포넌트에서 표시
        } else if (isMarkdown(file.filename)) {
            setActiveFile({ ...file, type: 'md', file_url: finalUrl }); // ✅ MarkdownViewer에서 표시
        } else {
            window.alert("지원하지 않는 파일 형식입니다.");
        }
    };



    // PDF 파일 여부 확인
    const isPdf = (filename) => filename.toLowerCase().endsWith('.pdf');

    return (
        <div className="chat-root">
            <Sidebar currentProjectId={currentProjectId} />
            <div className="resources-main">
                <h1
                    className="resources-title"
                    onClick={() => setActiveFile(null)}
                    style={{ cursor: activeFile ? 'pointer' : 'default' }}
                >
                    {projectTitle}
                </h1>

                {
                    activeFile ? (
                        activeFile.type === "pdf" ? (
                            <div className="pdf-markdown-wrapper">
                                <div className="pdf-viewer-wrapper">
                                    <PdfViewer fileUrl={activeFile.file_url} />
                                </div>
                                <div className="markdown-viewer-wrapper">
                                    <MarkdownViewer fileUrl="mock" />
                                </div>
                            </div>
                        ) : (
                            <MarkdownViewer fileUrl={activeFile.file_url} />
                            //<MarkdownViewer fileUrl={activeFile.file_url.replace('.pdf', '.md')} />

                        )
                    ) : (
                        // ✅ 파일 목록 표시
                        <div className="resources-box">
                            <div className="resources-label">Resource</div>
                            {loading ? (
                                <div>로딩 중...</div>
                            ) : (
                                <ul className="resources-list">
                                    {files.length > 0 ? (
                                        files.map((file) => (
                                            <li key={file.filename} className="resources-item">
                                                <span
                                                    style={{
                                                        cursor: isPdf(file.filename) ? 'pointer' : 'default',
                                                        color: isPdf(file.filename) ? '#2563eb' : undefined,
                                                    }}
                                                    onClick={() => handleFileClick(file)} // ✅ 여기서 마크다운 + 새 탭 열기
                                                >
                                                    {file.filename}
                                                </span>
                                                <button
                                                    style={{
                                                        marginLeft: 8,
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'red',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => handleDelete(file.filename)}
                                                >
                                                    삭제
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="resources-item">업로드된 파일이 없습니다.</li>
                                    )}
                                </ul>
                            )}
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                id="resource-upload"
                                onChange={handleUpload}
                            />
                            <label htmlFor="resource-upload" className="resources-add-btn">
                                + 파일 추가
                            </label>
                        </div>
                    )
                }


            </div>
        </div>
    );
}

export default ResourcesScreen;
