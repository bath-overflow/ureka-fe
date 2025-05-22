// ✅ hooks/useResourceUpload.js
import { useState, useCallback } from "react";

export function useResourceUpload(projectId) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/resources/`);
            if (!res.ok) throw new Error("파일 목록 불러오기 실패");

            const data = await res.json(); // [{ filename, ... }]

            // 각 파일마다 file_url을 추가로 fetch
            const withUrls = await Promise.all(
                data.map(async (file) => {
                    const detailRes = await fetch(`/api/projects/${projectId}/resources/${encodeURIComponent(file.filename)}`);
                    if (!detailRes.ok) {
                        console.warn(`❌ ${file.filename} 정보 가져오기 실패`);
                        return file; // file_url 없이 fallback
                    }
                    const detailData = await detailRes.json();
                    return {
                        ...file,
                        file_url: detailData.file_url,
                    };
                })
            );

            console.log("📦 파일 + file_url:", withUrls);
            setFiles(withUrls);
        } catch (err) {
            console.error("❌ fetchFiles 에러:", err);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);



    const uploadFile = useCallback(async (file) => {
        if (!projectId || !file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`/api/projects/${projectId}/resources/`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("파일 업로드 실패");
            await fetchFiles();
        } catch (err) {
            console.error("❌ 파일 업로드 에러:", err);
            throw err;
        }
    }, [projectId, fetchFiles]);

    const deleteFile = useCallback(async (filename) => {
        if (!projectId || !filename) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/resources/${encodeURIComponent(filename)}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("파일 삭제 실패");
            await fetchFiles();
        } catch (err) {
            console.error("❌ 파일 삭제 에러:", err);
            throw err;
        }
    }, [projectId, fetchFiles]);

    const getFileBlobUrl = async (filename) => {
        const res = await fetch(`/api/projects/${projectId}/resources/${encodeURIComponent(filename)}`);
        const contentType = res.headers.get("content-type");
        console.log("📎 응답 Content-Type:", contentType);

        const text = await res.text();  // ⚠️ PDF가 아니라면 text로 읽힘
        console.log("📎 응답 내용:", text);

        if (!res.ok || !contentType.includes("pdf")) {
            throw new Error("PDF가 아닙니다.");
        }

        const blob = new Blob([text], { type: contentType });
        return URL.createObjectURL(blob);
    };


    return {
        files,
        loading,
        fetchFiles,
        uploadFile,
        deleteFile,
        getFileBlobUrl,
    };
}


export async function uploadFileDirect(projectId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/projects/${projectId}/resources/`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("파일 업로드 실패");
    }
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function handleFileUploadWithLimit({
    file,
    projectId,
    uploadFunction,  // uploadFile 또는 uploadFileDirect
}) {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        alert("50MB 이하의 파일만 업로드할 수 있습니다.");
        return;
    }

    try {
        await uploadFunction(projectId, file);
    } catch (err) {
        console.error("❌ 파일 업로드 실패:", err);
        alert("파일 업로드 중 오류 발생");
    }
}
