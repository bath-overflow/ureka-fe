import React, { useState, useCallback } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import FileUpload from '../common/FileUpload';
import useChatSocket from '../../hooks/useChatSocket';
import useNoteApi from '../../hooks/useNoteApi';
import './ChatScreen.css';

const ChatScreen = ({ selectedNote, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { loading, error, uploadFile, getFiles } = useNoteApi();

  const handleMessageReceived = useCallback((message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const { sendMessage } = useChatSocket(selectedNote.id, handleMessageReceived);

  const handleSendMessage = useCallback((message) => {
    sendMessage(message);
    setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user' }]);
  }, [sendMessage]);

  const handleFileUpload = useCallback(async (file) => {
    try {
      await uploadFile(selectedNote.id, file);
      setUploadedFile(file);
      const files = await getFiles(selectedNote.id);
      console.log('Files:', files);
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  }, [selectedNote.id, uploadFile, getFiles]);

  return (
    <div className="chat-screen">
      <div className="file-upload-container">
        <div className="note-header">
          <button onClick={onBack} className="back-button">
            ←
          </button>
          <h2>{selectedNote.name}</h2>
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
        {loading && <div className="loading">Uploading...</div>}
        {error && <div className="error">{error}</div>}
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

export default ChatScreen; 