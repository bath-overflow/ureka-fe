import React from "react";
import { useParams } from "react-router-dom";

function ProjectDetail() {
    const { id } = useParams();

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h1>프로젝트 상세 페이지</h1>
            <p>프로젝트 ID: {id}</p>
            {/* 여기에 프로젝트 상세 정보를 추가하면 됩니다 */}
        </div>
    );
}

export default ProjectDetail;