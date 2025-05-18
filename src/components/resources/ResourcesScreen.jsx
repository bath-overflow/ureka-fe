import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './ResourcesScreen.css';
import { useResourceUpload } from '../../hooks/useResourceUpload';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


function ResourcesScreen({ setCurrentProjectId, currentProjectId, projects }) {
    const { projectId } = useParams();
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const {
        files,
        loading,
        fetchFiles,
        uploadFile,
        deleteFile
    } = useResourceUpload(projectId);


    useEffect(() => {
        if (!projectId || projects.length === 0) return;
        setCurrentProjectId(projectId);
        fetchFiles();
    }, [projectId, projects.length, setCurrentProjectId, fetchFiles]);

    // 현재 프로젝트 찾기
    const project = projects.find(p => String(p.id) === String(projectId));
    const projectTitle = project?.title || "프로젝트";


    const MAX_SIZE = 50 * 1024 * 1024; // 50MB

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_SIZE) { //임의로 50MB라고 지정해둠
            alert("50MB 이하의 파일만 업로드할 수 있습니다.");
            return;
        }

        try {
            await uploadFile(file);
        } catch {
            alert('파일 업로드 중 오류 발생');
        }
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

        console.log("🔗 새 탭으로 열기:", finalUrl);
        window.open(finalUrl, "_blank");
    };




    // PDF 파일 여부 확인
    const isPdf = (filename) => filename.toLowerCase().endsWith('.pdf');

    return (
        <div className="chat-root">
            <Sidebar currentProjectId={currentProjectId} />
            <div className="resources-main">
                <h1 className="resources-title">{projectTitle}</h1>


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
                                            style={{ cursor: isPdf(file.filename) ? 'pointer' : 'default', color: isPdf(file.filename) ? '#2563eb' : undefined }}
                                            onClick={() => {
                                                if (isPdf(file.filename)) handleFileClick(file);
                                            }}
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

                    {/* 파일 추가 버튼 */}
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="resource-upload"
                        onChange={handleUpload}
                    />
                    <label htmlFor="resource-upload" className="resources-add-btn">
                        + 파일 추가
                    </label>
                </div>

                {/* PDF 미리보기 영역 */}
                {selectedFileUrl && (
                    <div
                        style={{
                            marginTop: 32,
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                            padding: 24,
                            height: '80vh', // ✅ 고정 높이 지정
                            overflowY: 'auto', // ✅ 세로 스크롤 활성화
                            maxWidth: 900,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >

                        <Document
                            file={selectedFileUrl}
                            onLoadSuccess={({ numPages }) => {
                                console.log("✅ PDF 로딩 성공:", numPages);
                                setNumPages(numPages);
                            }}
                            onLoadError={(error) => {
                                console.error('PDF 로딩 에러', error);
                                setSelectedFileUrl(null);
                            }}
                        >

                            {Array.from(new Array(numPages), (_, index) => (
                                <Page key={index} pageNumber={index + 1} scale={1.5} />
                            ))}


                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResourcesScreen;
