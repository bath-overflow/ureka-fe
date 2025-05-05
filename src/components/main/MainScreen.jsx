import React, { useState, useEffect } from "react";
import "./MainScreen.css";
import { useNavigate } from "react-router-dom";


function MainScreen({ projects, setProjects }) {

  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();

  const handleMenuOpen = (id, event) => {
    setOpenMenuId(id);
  };

  const handleMenuClose = () => setOpenMenuId(null);

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setOpenMenuId(null); // 메뉴 닫기
  };

  const handleEdit = (id) => {
    const project = projects.find(p => p.id === id);
    setEditId(id);
    setEditValue(project.title);
    setOpenMenuId(null); // 메뉴 닫기
  };

  useEffect(() => {
    if (openMenuId !== null) {
      const onClick = () => setOpenMenuId(null);
      window.addEventListener('click', onClick);
      return () => window.removeEventListener('click', onClick);
    }
  }, [openMenuId]);

  return (
    <div className="main-bg">
      <div className="main-title">
        <div className="ureka-logo">UREKA</div>
        <h1>홍길동님, UREKA에 오신 것을 환영해요!</h1>
      </div>
      <div className="project-list">
        {projects.map((p) => (
          <div className="project-card" key={p.id}>
            <div className="project-img">
              {/* 실제 이미지를 쓸 경우: <img src={p.imgUrl} alt={p.title} /> */}
              {/* 지금은 와이어프레임용 네모 */}
            </div>
            <div className="project-content">
              <div className="project-title-row" style={editId === p.id ? { position: 'relative', zIndex: 20 } : {}}>
                {editId === p.id ? (
                  <>
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="edit-title-input"
                      autoFocus
                    />
                    <button onClick={() => {
                      setProjects(prev =>
                        prev.map(proj =>
                          proj.id === p.id ? { ...proj, title: editValue } : proj
                        )
                      );
                      setEditId(null);
                    }}>저장</button>
                    <button onClick={() => setEditId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <div className="project-title">{p.title}</div>
                    <div
                      className="project-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(p.id, e);
                      }}>
                      ⋮
                      {openMenuId === p.id && (
                        <div className="project-menu">
                          <div className="menu-item" onClick={() => handleDelete(p.id)}>
                            <span role="img" aria-label="delete">🗑️</span> 삭제
                          </div>
                          <div className="menu-item" onClick={() => handleEdit(p.id)}>
                            <span role="img" aria-label="edit">✏️</span> 제목 수정
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="project-desc">{p.desc}</div>
              <a
                href="#"
                className="project-info"
                onClick={e => {
                  e.preventDefault();
                  navigate(`/chat/project/${p.id}`);
                }}
              >
                More Info →
              </a>
            </div>
          </div>
        ))}
      </div>
      <button className="new-project-btn" onClick={() => navigate("/new-project")}>
        + New Project
      </button>
    </div>
  );
}

export default MainScreen;