import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { FaComments } from "react-icons/fa";
import ChatBubble from "./ChatBubble";
import InDepthDebateScreen from '../debate/InDepthDebateScreen';
import "./ChatScreen.css";

function ChatScreen({ projects, setProjects, setCurrentProjectId }) {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isSubmitting = useRef(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isDebateModalOpen, setIsDebateModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);


  const { messages, sendMessage, sendHint, isLoading, error, isStreaming, chatId } = useChat(id);

  const fetchedOnceRef = useRef(false);

  const fetchRecommendations = async () => {
    if (!chatId) return;

    setIsLoadingRecommendations(true);
    try {
      const res = await fetch(`/api/chat/${chatId}/suggestions`);
      if (!res.ok) throw new Error("추천 질문 요청 실패");

      const data = await res.json();
      console.log("[✅ 추천 질문 응답]", data);

      const raw = data?.suggested_questions ?? [];

      let cleaned;

      // 최초 요청: 첫 문장 제거
      if (!fetchedOnceRef.current) {
        fetchedOnceRef.current = true;
        cleaned = raw.length > 1 ? raw.slice(1) : [];
      } else {
        cleaned = raw;
      }

      const questions = cleaned.filter(q =>
        typeof q === "string" &&
        q.trim().length > 0 &&
        (q.includes('?') || q.endsWith('?'))
      );

      setRecommendations(questions);

    } catch (error) {
      console.error("추천 질문 요청 중 오류:", error);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // ✅ 메시지가 변경될 때마다 추천 질문 요청
  useEffect(() => {
    if (chatId && messages.length > 0) {
      fetchRecommendations();
    }
  }, [chatId, messages.length]);



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

  // 제목 수정용 핸들러 분리
  const handleTitleChange = (e) => {
    setInputValue(e.target.value);
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

  const handleHint = async () => {
    if (isHintLoading) return;

    setIsHintLoading(true);
    try {
      await sendHint();
    } catch (error) {
      console.error('Error in handleHint:', error);
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleRecommendedClick = (question) => {
    setInput('');
    sendMessage(question); // ✅ 기존 메시지 전송 로직 재사용
  };


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleStartDebate = () => {
    setIsDebateModalOpen(true);
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
              onChange={handleTitleChange}
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
            {messages.map((msg, index) => (
              <div key={msg.id} className="chat-message-container">
                <div className="chat-message-content">
                  <ChatBubble
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
                  {msg.sender === "assistant" && index === messages.length - 1 && (
                    <button
                      className="debate-icon-button"
                      onClick={() => handleStartDebate()}
                      title="심층토론하기"
                    >
                      <FaComments />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              className="chat-hint-btn"
              onClick={(e) => {
                e.preventDefault();
                handleHint();
              }}
              disabled={isHintLoading || !chatId}
              title={!chatId ? `채팅이 초기화되는 동안 기다려주세요... (chatId: ${chatId})` : ""}
            >
              {isHintLoading ? 'Loading...' : 'HINT'}
            </button>
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
            {isLoadingRecommendations ? (
              <div>추천 질문 불러오는 중...</div>
            ) : recommendations.length > 0 ? (
              recommendations.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecommendedClick(question)}
                >
                  {question}
                </button>
              ))
            ) : (
              <div>추천 질문이 없습니다.</div>
            )}
          </div>

        </div>
      </div>
      <InDepthDebateScreen
        isOpen={isDebateModalOpen}
        onClose={() => setIsDebateModalOpen(false)}
        chatId={chatId}
      />
    </div>
  );
}

export default ChatScreen;