import React, { useState } from 'react';
import MainScreen from './components/main/MainScreen';
import ChatScreen from './components/chat/ChatScreen';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mainScreen" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;