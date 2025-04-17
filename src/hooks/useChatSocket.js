import { useEffect, useRef, useCallback } from 'react';
import MockChatSocket from '../api/mock/mockChatSocket';

const useChatSocket = (onMessageReceived) => {
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    const socket = new MockChatSocket('ws://mock');
    socketRef.current = socket;

    socket.on('message_received', (message) => {
      onMessageReceived(message);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.connect();
  }, [onMessageReceived]);

  const joinChat = useCallback((noteId) => {
    if (socketRef.current) {
      socketRef.current.send('join_chat', { noteId });
    }
  }, []);

  const leaveChat = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.send('leave_chat');
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current) {
      socketRef.current.send('send_message', { message });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  return {
    joinChat,
    leaveChat,
    sendMessage,
  };
};

export default useChatSocket; 