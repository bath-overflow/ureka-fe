import React from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import './ChatArea.css';

const ChatArea = ({ messages, onSendMessage }) => {
  return (
    <div className="chat-area">
      <MessageList messages={messages} />
      <InputArea onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea; 