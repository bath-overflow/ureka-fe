import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import "./ChatScreen.css";

function ChatScreen({ projects }) {
  const { id } = useParams();
  const project = projects.find(p => String(p.id) === String(id));

  // project가 없으면 안내 메시지
  if (!project) {
    return <div style={{ padding: 40 }}>존재하지 않는 프로젝트입니다.</div>;
  }

  // 프로젝트별 메시지 상태를 localStorage에 저장/불러오기 (선택)
  const storageKey = `chat-messages-project-${id}`;
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved
      ? JSON.parse(saved)
      : [{ id: 1, text: "UREKA와 자유롭게 대화해보세요!", sender: "system" }];
  });
  const [input, setInput] = useState("");

  // 메시지 변경 시 localStorage에 저장 (선택)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSend = () => {
    if (input.trim() === "") return;
    const userMsg = {
      id: messages.length + 1,
      text: input,
      sender: "user"
    };
    const botMsg = {
      id: messages.length + 2,
      text: input, // 에코: 사용자가 보낸 메시지 그대로
      sender: "bot"
    };
    setMessages([...messages, userMsg, botMsg]);
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
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: "이건 힌트야", // 원하는 힌트 메시지로 변경
        sender: "bot"
      }
    ]);
  };

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
                style={{ marginLeft: 8, fontSize: "1rem", color: "#888", cursor: "pointer" }}
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