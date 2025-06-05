import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatBubble.css';

const ChatBubble = ({ text, role = 'user', alignment = 'left' }) => {
  return (
    <div className={`chat-bubble ${role} ${alignment}`}>
      <ReactMarkdown>
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ChatBubble; 