import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        {message.text}
      </div>
    </div>
  );
};

export default Message; 