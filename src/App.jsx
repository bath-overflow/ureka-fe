import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Login from "./components/login/Login";
import MainScreen from "./components/main/MainScreen";
import NewProject from "./components/project/NewProject";
import ProjectDetail from "./components/main/ProjectDetail";
import ChatScreen from "./components/chat/ChatScreen";
import ResourcesScreen from './components/resources/ResourcesScreen';
import Sidebar from './components/layout/Sidebar';
import './App.css';
import InDepthDebateScreen from './components/debate/InDepthDebateScreen';


function App() {
  const [projects, setProjects] = useState([]); //초기값 제거

  const [messages, setMessages] = useState([
    { id: 1, text: "UREKA와 자유롭게 대화해보세요!", sender: "system" }
  ]);

  const [input, setInput] = useState("");

  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    console.log("🔥 App의 useEffect 시작됨");
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('프로젝트 불러오기 실패:', err);
      }
    };

    fetchProjects();
  }, []);


  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, text: input, sender: "user" }
    ]);
    setInput("");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 사이드바 없는 화면 */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<MainScreen projects={projects} setProjects={setProjects} />} />
        <Route path="/new-project" element={<NewProject projects={projects} setProjects={setProjects} />} />

        {/* 사이드바 포함된 화면 */}
        <Route path="/*" element={
          <div className="layout">
            <Sidebar currentProjectId={currentProjectId} />
            <Routes>
              <Route
                path="chat/project/:id"
                element={<ChatScreen
                  currentProjectId={currentProjectId}
                  setCurrentProjectId={setCurrentProjectId}
                  projects={projects}
                  setProjects={setProjects}
                />}
              />
              <Route
                path="debate/project/:projectId"
                element={<InDepthDebateScreen
                  currentProjectId={currentProjectId}
                  setCurrentProjectId={setCurrentProjectId}
                  projects={projects}
                  setProjects={setProjects}
                />}
              />
              <Route
                path="resources/:projectId"
                element={<ResourcesScreen
                  currentProjectId={currentProjectId}
                  setCurrentProjectId={setCurrentProjectId}
                  projects={projects}
                  setProjects={setProjects}
                />}
              />
            </Routes>
          </div>
        } />
      </Routes>
    </BrowserRouter>

  );
}

export default App;