import React, { useState } from 'react';
import MainScreen from './components/main/MainScreen';
import ChatScreen from './components/chat/ChatScreen';
import './App.css';

function App() {
  const [selectedNote, setSelectedNote] = useState(null);

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
  };

  const handleBack = () => {
    setSelectedNote(null);
  };

  return (
    <div className="App">
      {selectedNote ? (
        <ChatScreen selectedNote={selectedNote} onBack={handleBack} />
      ) : (
        <MainScreen onNoteSelect={handleNoteSelect} />
      )}
    </div>
  );
}

export default App;
