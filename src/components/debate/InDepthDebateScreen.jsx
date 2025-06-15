import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import useDebateSocket from '../../hooks/useDebateSocket';
import "./InDepthDebateScreen.css";

function InDepthDebateScreen({ isOpen, onClose, chatId }) {
    const [messages, setMessages] = useState([
       
    ]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [typingRole, setTypingRole] = useState(null);

    const { connect, disconnect, sendMessage, isConnected } = useDebateSocket((message) => {
        if (message.type === 'message_received') {
            const content = message.data?.message;
            const role = message.data?.role;

            // 처리 중 메시지
            if (content === 'Processing your message...') {
                setIsStreaming(true);
                setTypingRole(role || "assistant");
                return;
            }

            // 스트리밍이 끝났는지 확인
            if (content === '<EOS>') {
                setIsStreaming(false);
                setTypingRole(null);
                return;
            }

            // 새로운 메시지 추가
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: role || "assistant",
                message: content
            }]);
        } else if (message.type === 'connection_established') {
            console.log('Connection established with chatId:', message.data?.chatId);
        } else if (message.type === 'error') {
            console.error('WebSocket error:', message.data?.message);
        }
    });

    // 모달이 열릴 때 연결하고, 닫힐 때 연결 해제
    useEffect(() => {
        if (isOpen && chatId) {
            console.log('Modal opened, connecting to debate socket...');
            connect(chatId);
        }
        return () => {
            console.log('Modal closing, disconnecting from debate socket...');
            disconnect();
            setMessages([]); // 채팅 초기화
            setInput(""); // 입력창 초기화
            setIsStreaming(false); // 스트리밍 상태 초기화
            setTypingRole(null); // 타이핑 상태 초기화
        };
    }, [isOpen, chatId, connect, disconnect]);

    // 연결 상태 변경 감지
    useEffect(() => {
        console.log('Debate socket connection status:', isConnected);
        if (!isConnected && isOpen) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: "system",
                message: "연결이 끊어졌습니다. 다시 연결을 시도합니다..."
            }]);
        }
    }, [isConnected, isOpen]);

    const handleSend = () => {
        if (!input.trim() || isStreaming || !isConnected) {
            console.log('Cannot send message:', { 
                isEmpty: !input.trim(), 
                isStreaming, 
                isConnected 
            });
            return;
        }

        const newMsg = {
            id: Date.now(),
            role: "user",
            message: input.trim()
        };

        console.log('Sending message:', newMsg);
        setMessages(prev => [...prev, newMsg]);
        sendMessage(newMsg);
        setInput("");
    };

    if (!isOpen) return null;

    return (
        <div className="debate-modal-overlay" onClick={onClose}>
            <div className="chat-root debate-modal-content" onClick={e => e.stopPropagation()}>
                <div className="chat-main">
                    <div className="debate-modal-header">
                        <h1 className="chat-title">In-depth Debate</h1>
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
                                    <ReactMarkdown>
                                        {msg.message}
                                    </ReactMarkdown>
                                </div>
                            ))}
                            {typingRole && (
                                <div className={`chat-bubble ${typingRole} typing`}>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="chat-input-area">
                            <input
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                disabled={isStreaming || !isConnected}
                            />
                            <button 
                                className="chat-send-btn" 
                                onClick={handleSend}
                                disabled={isStreaming || !isConnected}
                            >
                                ⮞
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InDepthDebateScreen;
