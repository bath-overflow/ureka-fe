import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './ResourcesScreen.css';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResourcesScreen({ setCurrentProjectId, currentProjectId }) {
    const { projectId } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);

    useEffect(() => {
        setCurrentProjectId(projectId);
        fetchFiles();
    }, [projectId, setCurrentProjectId]);

    // 파일 목록 가져오기
    const fetchFiles = async () => {
        try {
            const response = await fetch(`/projects/${projectId}/resources`);
            if (!response.ok) {
                throw new Error('Failed to fetch resources');
            }
            const data = await response.json(); // [{ filename: "Chapter1.pdf" }, ...]
            setFiles(data);
        } catch (error) {
            console.warn('파일 목록 불러오기 실패', error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    // 파일 업로드
    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/projects/${projectId}/resources`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('파일 업로드 실패');
            }
            console.log('파일 업로드 성공');
            fetchFiles(); // 파일 다시 불러오기
        } catch (error) {
            console.error('파일 업로드 에러', error);
        }
    };

    // 파일 삭제
    const handleDelete = async (filename) => {
        if (!window.confirm(`정말 "${filename}" 파일을 삭제할까요?`)) return;

        try {
            const response = await fetch(`/projects/${projectId}/resources/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('파일 삭제 실패');
            }
            console.log('파일 삭제 성공');
            fetchFiles(); // 파일 다시 불러오기
        } catch (error) {
            console.error('파일 삭제 에러', error);
        }
    };

    // 파일 클릭 (PDF 미리보기)
    const handleFileClick = (filename) => {
        const fileUrl = `/projects/${projectId}/resources/${encodeURIComponent(filename)}`;
        setSelectedFileUrl(fileUrl);
    };

    // PDF 파일 여부 확인
    const isPdf = (filename) => filename.toLowerCase().endsWith('.pdf');

    return (
        <div className="chat-root">
            <Sidebar currentProjectId={currentProjectId} />
            <div className="resources-main">
                <h1 className="resources-title">Resources</h1>

                <div className="resources-box">
                    <div className="resources-label">Resource</div>

                    {loading ? (
                        <div>로딩 중...</div>
                    ) : (
                        <ul className="resources-list">
                            {files.length > 0 ? (
                                files.map((file, idx) => (
                                    <li key={idx} className="resources-item">
                                        <span
                                            style={{ cursor: isPdf(file.filename) ? 'pointer' : 'default', color: isPdf(file.filename) ? '#2563eb' : undefined }}
                                            onClick={() => {
                                                if (isPdf(file.filename)) handleFileClick(file.filename);
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
                            minHeight: 400,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxWidth: 900,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        <Document
                            file={selectedFileUrl}
                            onLoadError={(error) => {
                                console.error('PDF 로딩 에러', error);
                                setSelectedFileUrl(null);
                            }}
                        >
                            <Page pageNumber={1} width={800} />
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResourcesScreen;
