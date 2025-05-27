import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./MarkdownViewer.css";

function MarkdownViewer({ fileUrl }) {
    const [markdownText, setMarkdownText] = useState("불러오는 중...");

    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                // ✅ 실제 요청 대신 mock 처리
                if (import.meta.env.DEV && fileUrl.includes("mock")) {
                    setMarkdownText(`# 🔧 테스트용 마크다운\n\n- 항목 1\n- 항목 2\n\n**굵은 글씨**도 잘 보여요!`);
                    return;
                }

                const res = await fetch(fileUrl);
                if (!res.ok) throw new Error("서버 오류");

                const text = await res.text();
                setMarkdownText(text);
            } catch (err) {
                console.error("❌ 마크다운 로딩 실패:", err);
                setMarkdownText("📄 파일을 불러오는 데 실패했습니다.");
            }
        };

        fetchMarkdown();
    }, [fileUrl]);

    return (
        <div className="pdf-viewer-container">
            <ReactMarkdown>{markdownText}</ReactMarkdown>
        </div>
    );
}

export default MarkdownViewer;
