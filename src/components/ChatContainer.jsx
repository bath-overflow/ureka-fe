import React, { useState } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import FileUpload from './FileUpload';
import NoteSelector from './NoteSelector';
import './ChatContainer.css';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleSendMessage = (message) => {
    setMessages([...messages, { text: message, sender: 'user' }]);
    // TODO: Add API call to get AI response
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    // TODO: Handle file upload logic
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    // TODO: Load note content if it's an existing note
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
    setMessages([]);
    setUploadedFile(null);
  };

  if (!selectedNote) {
    return <NoteSelector onNoteSelect={handleNoteSelect} />;
  }

  return (
    <div className="chat-container">
      <div className="file-upload-container">
        <div className="note-header">
          <button onClick={handleBackToNotes} className="back-button">
            ←
          </button>
          <h2>{selectedNote.name}</h2>
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
        {uploadedFile && (
          <div className="uploaded-file-info">
            <p>Uploaded: {uploadedFile.name}</p>
          </div>
        )}
      </div>
      <div className="chat-area">
        <MessageList messages={messages} />
        <InputArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatContainer; 