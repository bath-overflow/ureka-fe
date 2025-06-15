import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import useDebateSocket from '../../hooks/useDebateSocket';
import "./InDepthDebateScreen.css";

function InDepthDebateScreen({ isOpen, onClose, chatId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const messageCounter = useRef(0);
    const [currentRole, setCurrentRole] = useState("friend");
    const lastRole = useRef("friend");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 메시지가 추가될 때마다 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processMessage = (content, role) => {
        if (content && content !== '<EOS>' && content !== 'Processing your message...') {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === role) {
                    // 마지막 메시지와 같은 역할이면 메시지를 합침
                    const updatedMessages = [...prev];
                    updatedMessages[prev.length - 1] = {
                        ...lastMessage,
                        message: lastMessage.message + content
                    };
                    return updatedMessages;
                } else {
                    // 다른 역할이면 새로운 메시지 추가
                    return [...prev, {
                        id: `${Date.now()}-${messageCounter.current++}`,
                        role: role,
                        message: content
                    }];
                }
            });
        }
    };

    const { connect, disconnect, sendMessage, isConnected } = useDebateSocket((message) => {
        if (message.type === 'message_received') {
            const content = message.data?.message;
            const role = message.data?.role;


            if (role !== undefined) {
                const newRole = role.toLowerCase();
                setCurrentRole(newRole);
                lastRole.current = newRole;
                if (content) {
                    processMessage(content, newRole);
                }
            } else if (content) {
                processMessage(content, lastRole.current);
            }
        } else if (message.type === 'connection_established') {
            console.log('Connection established with chatId:', message.data?.chatId);
        } else if (message.type === 'error') {
            console.error('WebSocket error:', message.data?.message);
        }
    });

    useEffect(() => {
        if (isOpen && chatId) {
            console.log('Modal opened, connecting to debate socket...');
            connect(chatId);
        }
        return () => {
            if (isOpen) {
                console.log('Modal closing, disconnecting from debate socket...');
                disconnect();
                setMessages([]); // 채팅 초기화
                setInput(""); // 입력창 초기화
                messageCounter.current = 0;
                setCurrentRole("friend");
                lastRole.current = "friend";
            }
        };
    }, [isOpen, chatId]);

    const handleSend = (e) => {
        // 이벤트가 있으면 기본 동작 방지
        if (e) {
            e.preventDefault();
        }

        if (!input.trim() || !isConnected) {
            console.log('Cannot send message:', { 
                isEmpty: !input.trim(), 
                isConnected 
            });
            return;
        }

        const trimmedInput = input.trim();
        setInput(""); // 먼저 입력창을 비움

        // UI에 표시할 메시지 (id 포함)
        const newMsg = {
            id: `${Date.now()}-${messageCounter.current++}`,
            role: "user",
            message: trimmedInput
        };

        // 서버로 보낼 메시지 (id 제외)
        const messageToSend = {
            role: "user",
            message: trimmedInput
        };

        console.log('Sending message:', messageToSend);
        setMessages(prev => [...prev, newMsg]);
        sendMessage(messageToSend);
    };

    const handleClose = () => {
        disconnect(); // 소켓 연결 해제
        setMessages([]); // 채팅 초기화
        setInput(""); // 입력창 초기화
        messageCounter.current = 0;
        setCurrentRole("friend");
        lastRole.current = "friend";
        onClose(); // 모달 닫기
    };

    if (!isOpen) return null;

    return (
        <div className="debate-modal-overlay" onClick={handleClose}>
            <div className="chat-root debate-modal-content" onClick={e => e.stopPropagation()}>
                <div className="chat-main">
                    <div className="debate-modal-header">
                        <h1 className="chat-title">In-depth Debate</h1>
                        <button className="debate-modal-close" onClick={handleClose}>
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
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-area">
                            <input
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                disabled={!isConnected}
                            />
                            <button 
                                className="chat-send-btn" 
                                onClick={(e) => handleSend(e)}
                                disabled={!isConnected}
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
