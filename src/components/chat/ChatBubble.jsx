import React from 'react';
import './ChatBubble.css';

const ChatBubble = ({ text, role = 'user', alignment = 'left' }) => {
  return (
    <div className={`chat-bubble ${role} ${alignment}`}>
      {text}
    </div>
  );
};

export default ChatBubble; 