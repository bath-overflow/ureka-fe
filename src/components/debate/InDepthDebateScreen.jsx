import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import "./InDepthDebateScreen.css";

function InDepthDebateScreen({ setCurrentProjectId, projects }) {
    const { projectId } = useParams();
    const [projectName, setProjectName] = useState("In-depth Debate");

    useEffect(() => {
        if (projectId) {
            setCurrentProjectId(projectId);

            const project = projects?.find(p => String(p.id) === String(projectId));
            if (project?.title) {
                setProjectName(project.title);
            }
        }
    }, [projectId, setCurrentProjectId, projects]);

    return (
        <div className="debate-root">
            <h1 className="debate-title">{projectName}</h1>
            <div className="debate-container">
                <div className="debate-header">
                    <span>UREKA와 자유롭게 대화해보세요!</span>
                </div>

                <div className="debate-characters">
                    {["User", "Professor", "Friend"].map(role => (
                        <div className="character-card" key={role}>
                            <div className="character-avatar" />
                            <div className="character-role">{role}</div>
                            <div className="character-options">⋮</div>
                        </div>
                    ))}
                </div>

                <div className="debate-history">
                    {[
                        { id: 1, role: "friend", message: "오늘 수업에서 다룬 CPU time 이해가 안 돼" },
                        { id: 2, role: "user", message: "CPU Clock Cycles와 Instruction Count의 곱이야!" },
                        { id: 3, role: "professor", message: "다시 생각해보면 좋을 것 같아" },
                    ].map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-wrapper ${msg.role}`}
                        >
                            <div className="chat-role-label">{msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}</div>
                            <div className={`chat-bubble ${msg.role}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>




                <div className="debate-input">
                    <button className="mic-button">🎤</button>
                    <input type="text" placeholder="메시지를 입력하세요..." />
                    <button className="send-button">📨</button>
                </div>
            </div>
        </div>
    );
}

export default InDepthDebateScreen;
