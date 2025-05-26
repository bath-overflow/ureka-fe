import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function PdfViewer({ fileUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [containerWidth, setContainerWidth] = useState(800);
    const containerRef = useRef();

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setContainerWidth(Math.min(width, 1050)); // ✅ 최대 너비 제한
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <div className="pdf-viewer-scroll" ref={containerRef}>
            <div className="pdf-viewer-inner">
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from({ length: numPages }, (_, i) => (
                        <Page
                            key={`page_${i + 1}`}
                            pageNumber={i + 1}
                            width={containerWidth}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );


}

export default PdfViewer;
