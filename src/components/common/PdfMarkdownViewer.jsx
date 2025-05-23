import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker?worker";
import "./PdfMarkdownViewer.css";

function PdfMarkdownViewer({ fileUrl }) {
    const [pageTexts, setPageTexts] = useState([]);

    useEffect(() => {
        const fetchPdfText = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;

                const texts = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();

                    const lines = [];
                    let currentLine = [];
                    let lastY = null;

                    for (const item of content.items) {
                        const str = item.str.trim();
                        if (!str) continue;

                        const y = Math.floor(item.transform[5]);
                        if (lastY === null || Math.abs(y - lastY) <= 2) {
                            currentLine.push(item);
                        } else {
                            lines.push(currentLine);
                            currentLine = [item];
                        }
                        lastY = y;
                    }
                    if (currentLine.length > 0) lines.push(currentLine);

                    // 전체 페이지에서 가장 큰 높이 추정 → 타이틀용
                    const allHeights = content.items.map(i => i.height);
                    const maxHeight = Math.max(...allHeights);

                    const pageText = lines.map(lineItems => {
                        const avgLineHeight = lineItems.reduce((sum, i) => sum + i.height, 0) / lineItems.length;
                        const isTitle = avgLineHeight >= maxHeight * 0.9;
                        const isSub = avgLineHeight >= maxHeight * 0.6;

                        const lineStr = lineItems.map(item => {
                            const text = item.str.trim();
                            const isBold = item.fontName?.toLowerCase().includes("bold");
                            if (!text) return "";
                            return isBold ? `**${text}**` : text;
                        }).join(" ");

                        if (isTitle) return `# ${lineStr}`;
                        if (isSub) return `## ${lineStr}`;
                        return lineStr;
                    }).join("\n");

                    texts.push(`---\n_Page ${i}_\n\n${pageText}`);
                }

                setPageTexts(texts);
            } catch (err) {
                console.error("PDF 파싱 실패", err);
                setPageTexts(["📄 PDF 내용을 불러오는 데 실패했습니다."]);
            }
        };

        fetchPdfText();
    }, [fileUrl]);

    return (
        <div className="pdf-viewer-container">
            {pageTexts.map((page, index) => (
                <div key={index} className="pdf-page">
                    <ReactMarkdown>{page}</ReactMarkdown>
                </div>
            ))}
        </div>
    );
}

export default PdfMarkdownViewer;
