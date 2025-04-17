import React, { useState, useCallback } from 'react';
import FileUploadSection from './FileUploadSection';
import ChatArea from './ChatArea';
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
      <FileUploadSection
        noteName={selectedNote.name}
        onBack={onBack}
        onFileUpload={handleFileUpload}
        uploadedFile={uploadedFile}
        loading={loading}
        error={error}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatScreen; 