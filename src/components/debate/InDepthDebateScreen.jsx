import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { FaTimes } from 'react-icons/fa';
import "./InDepthDebateScreen.css";

function InDepthDebateScreen({ isOpen, onClose, setCurrentProjectId, projects }) {
    const { projectId } = useParams();
    const [projectName, setProjectName] = useState("In-depth Debate");

    // ✅ 추가된 상태 및 로직
    const [messages, setMessages] = useState([
        { id: 1, role: "friend", message: "오늘 수업에서 다룬 CPU time 이해가 안 돼" },
        { id: 2, role: "user", message: "CPU Clock Cycles와 Instruction Count의 곱이야!" },
        { id: 3, role: "professor", message: "다시 생각해보면 좋을 것 같아" },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const newMsg = {
            id: messages.length + 1,
            role: "user",
            message: input.trim()
        };

        setMessages([...messages, newMsg]);
        setInput("");
    };

    useEffect(() => {
        if (projectId) {
            setCurrentProjectId(projectId);
            const project = projects?.find(p => String(p.id) === String(projectId));
            if (project?.title) {
                setProjectName(project.title);
            }
        }
    }, [projectId, setCurrentProjectId, projects]);

    if (!isOpen) return null;

    return (
        <div className="debate-modal-overlay" onClick={onClose}>
            <div className="chat-root debate-modal-content" onClick={e => e.stopPropagation()}>
                <div className="chat-main">
                    <div className="debate-modal-header">
                        <h1 className="chat-title">{projectName}</h1>
                        <button className="debate-modal-close" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="chat-box">
                        <div className="debate-characters">
                            {["Friend", "Professor", "User"].map(role => (
                                <div className="character-card" key={role}>
                                    <div className="character-avatar">
                                        <img src={`/avatars/${role.toLowerCase()}.jpg`} alt={`${role} avatar`} />
                                    </div>
                                    <div className="character-role">{role}</div>
                                </div>
                            ))}
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-bubble ${msg.role}`}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>

                        <div className="chat-input-area">
                            <input
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="메시지를 입력하세요..."
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button className="chat-send-btn" onClick={handleSend}>⮞</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InDepthDebateScreen;
