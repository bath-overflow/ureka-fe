import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { useChat } from "../../hooks/useChat";
import "./ChatScreen.css";

function ChatScreen({ projects }) {
  const { id } = useParams();
  const project = projects.find(p => String(p.id) === String(id));
  const { messages, sendMessage, sendHint, isLoading, error } = useChat(id);
  const [input, setInput] = useState("");

  // project가 없으면 안내 메시지
  if (!project) {
    return <div style={{ padding: 40 }}>존재하지 않는 프로젝트입니다.</div>;
  }

  const handleSend = () => {
    sendMessage(input);
    setInput("");
  };

  const [projectTitle, setProjectTitle] = useState(project.title);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(projectTitle);

  const handleEdit = () => {
    setEditing(true);
    setInputValue(projectTitle);
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleInputBlur = () => {
    setProjectTitle(inputValue.trim() || "제목 없음");
    setEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  const handleHint = () => {
    sendHint();
  };

  if (isLoading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: 40 }}>에러가 발생했습니다: {error}</div>;
  }

  return (
    <div className="chat-root">
      <Sidebar />
      <div className="chat-main">
        <div className="chat-title-row">
          {editing ? (
            <input
              className="chat-title-input"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              autoFocus
            />
          ) : (
            <h1 className="chat-title">
              {projectTitle}
              <span
                className="edit-icon"
                onClick={handleEdit}
                tabIndex={0}
                role="button"
                aria-label="제목 수정"
              >✏️</span>
            </h1>
          )}
        </div>
        <div className="chat-box">
          <div className="chat-label">Chat</div>
          <div className="chat-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={
                  msg.sender === "user"
                    ? "chat-bubble user"
                    : msg.sender === "bot"
                      ? "chat-bubble bot"
                      : "chat-bubble system"
                }
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button className="chat-hint-btn" onClick={handleHint}>HINT</button>
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="채팅을 시작해보세요."
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <button className="chat-send-btn" onClick={handleSend}>⮞</button>
          </div>
          <div className="chat-bottom-buttons">
            <button disabled>추천질문1</button>
            <button disabled>추천질문2</button>
            <button disabled>추천질문3</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;