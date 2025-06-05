import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { useChat } from "../../hooks/useChat";
import ChatBubble from "./ChatBubble";
import "./ChatScreen.css";

function ChatScreen({ projects, setProjects, setCurrentProjectId, currentProjectId }) {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isSubmitting = useRef(false);

  const { messages, sendMessage, sendHint, isLoading, error, isStreaming } = useChat(id);

  useEffect(() => {
    console.log('Streaming state changed:', isStreaming);
  }, [isStreaming]);

  useEffect(() => {
    setCurrentProjectId(id);
  }, [id, setCurrentProjectId]);

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find(p => String(p.id) === String(id));
      if (project) {
        setProjectTitle(project.title);
        setInputValue(project.title);
      }
    }
  }, [projects, id]);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ 아직 projects가 로딩되지 않았을 경우 대기
  if (projects.length === 0) {
    return <div style={{ padding: 40 }}>프로젝트 목록을 불러오는 중입니다...</div>;
  }

  const project = projects.find(p => String(p.id) === String(id));

  // project가 없으면 안내 메시지
  if (!project) {
    return <div style={{ padding: 40 }}>존재하지 않는 프로젝트입니다.</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting.current || !input.trim() || isStreaming) return;
    
    isSubmitting.current = true;
    const messageToSend = input.trim();
    setInput('');
    sendMessage(messageToSend);
    
    // 다음 메시지 전송을 위해 약간의 딜레이 후 플래그 해제
    setTimeout(() => {
      isSubmitting.current = false;
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setInputValue(projectTitle);
  };

  const handleInputChange = (e) => {
    if (!isSubmitting.current) {
      setInput(e.target.value);
    }
  };

  const handleInputBlur = async () => {
    const newTitle = inputValue.trim() || "제목 없음";
    setProjectTitle(newTitle);
    setEditing(false);

    // 🛰️ 서버에 제목 업데이트
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTitle,
          description: project.desc || "설명" // description도 함께 보냄
        })
      });

      if (!res.ok) throw new Error("제목 업데이트 실패");

      // ✅ 상위 상태도 업데이트
      setProjects((prev) =>
        prev.map((proj) =>
          String(proj.id) === String(id) ? { ...proj, title: newTitle } : proj
        )
      );
    } catch (err) {
      console.error("❌ 제목 업데이트 실패:", err);
      alert("제목 업데이트에 실패했습니다.");
    }
  };

  const handleHint = () => {
    sendHint();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  if (isLoading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: 40 }}>에러가 발생했습니다: {error}</div>;
  }

  return (
    <div className="chat-root">
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
          <div className="chat-messages" ref={messagesContainerRef}>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                text={msg.text}
                role={msg.sender}
                alignment={
                  msg.sender === "user" 
                    ? "right" 
                    : msg.sender === "system" 
                      ? "center" 
                      : "left"
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button className="chat-hint-btn" onClick={handleHint}>HINT</button>
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="채팅을 시작해보세요."
              onKeyDown={handleKeyDown}
              disabled={isStreaming || isSubmitting.current}
            />
            <button 
              className="chat-send-btn" 
              onClick={handleSubmit}
              disabled={isStreaming || isSubmitting.current}
            >⮞</button>
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