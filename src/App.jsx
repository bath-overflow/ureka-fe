import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import MainScreen from "./components/main/MainScreen";
import NewProject from "./components/project/NewProject";
import ProjectDetail from "./components/main/ProjectDetail";
import './App.css';

function App() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "컴퓨터아키텍처",
      desc: "2025년 강의자료를 기반으로 ... (프로젝트에 대한 간단한 요약 설명)",
    },
    {
      id: 2,
      title: "Title",
      desc: "으아아 설명이에요요.",
    },
    {
      id: 3,
      title: "Title",
      desc: "Nu설명입니다다.",
    },
    {
      id: 4,
      title: "Title",
      desc: "얼레벌레 설명 faucibus.",
    },
  ]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainScreen projects={projects} setProjects={setProjects} />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/mainScreen" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;