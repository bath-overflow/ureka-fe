import { useEffect, useRef, useCallback, useState } from 'react';
import { DebateSocketManager } from '../api/websocket/debateSocket';

const useDebateSocket = (onMessageReceived) => {
  const messageQueue = useRef([]);
  const isComponentMounted = useRef(true);
  const lastMessageTime = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketManagerRef = useRef(null);

  const parseMessageRole = (content) => {
    const roleMatch = content.match(/^\[(FRIEND|MODERATOR|USER)\]/);
    if (roleMatch) {
      const role = roleMatch[1].toLowerCase();
      // MODERATOR를 professor로 변환
      const displayRole = role === 'moderator' ? 'professor' : role;
      return {
        role: displayRole,
        message: content.slice(roleMatch[0].length).trim()
      };
    }
    return null;
  };

  const processMessageQueue = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    while (messageQueue.current.length > 0) {
      const message = messageQueue.current.shift();
      try {
        onMessageReceived(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  }, [onMessageReceived]);

  const handleMessage = useCallback((message) => {
    if (!isComponentMounted.current) return;

    try {
      if (message.type === 'connection_established') {
        setIsConnected(true);
        return;
      }

      if (message.type === 'message_received') {
        const content = message.data?.message;
        
        // 연결 메시지 처리
        if (content && content.startsWith('connected:')) {
          const connectionContent = content.replace('connected:', '').trim();
          if (connectionContent === 'connected' || connectionContent.startsWith('Your chat_id is:')) {
            setIsConnected(true);
            return;
          }
        }

        if (content === 'Processing your message...') {
          messageQueue.current.push({
            type: 'message_received',
            data: { message: content }
          });
          processMessageQueue();
          return;
        }

        if (content === '<EOS>') {
          messageQueue.current.push({
            type: 'message_received',
            data: { message: '<EOS>' }
          });
          processMessageQueue();
          return;
        }

        // 일반 메시지 처리
        if (content) {
          const parsedMessage = parseMessageRole(content);
          if (parsedMessage) {
            messageQueue.current.push({
              type: 'message_received',
              data: { 
                message: parsedMessage.message,
                role: parsedMessage.role
              }
            });
          } else {
            messageQueue.current.push({
              type: 'message_received',
              data: { message: content }
            });
          }
          processMessageQueue();
        }
        return;
      }

      // 에러 메시지 처리
      if (message.type === 'error') {
        if (message.data?.message?.includes('Invalid message data')) {
          return;
        }
        messageQueue.current.push({
          type: 'error',
          data: { message: message.data?.message || 'An error occurred' }
        });
        processMessageQueue();
        return;
      }

      // 기타 메시지 처리
      if (message.type === 'text') {
        messageQueue.current.push({
          type: 'text',
          data: { text: message.data?.text || message.text }
        });
        processMessageQueue();
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }, [processMessageQueue]);

  const handleError = useCallback((error) => {
    if (!isComponentMounted.current) return;
    if (error?.data?.message?.includes('Invalid message data')) {
      return;
    }
    console.error('WebSocket error:', error);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    setIsConnected(false);
  }, []);

  const handleConnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    setIsConnected(true);
  }, []);

  const connect = useCallback((chatId) => {
    if (isComponentMounted.current) {
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect();
      }
      socketManagerRef.current = new DebateSocketManager();
      
      socketManagerRef.current.on('connection_established', handleMessage);
      socketManagerRef.current.on('message_received', handleMessage);
      socketManagerRef.current.on('error', handleError);
      socketManagerRef.current.on('disconnect', handleDisconnect);
      socketManagerRef.current.on('connect', handleConnect);
      socketManagerRef.current.on('text', handleMessage);

      socketManagerRef.current.connect(chatId);
    }
  }, [handleMessage, handleError, handleDisconnect, handleConnect]);

  const disconnect = useCallback(() => {
    if (isComponentMounted.current && socketManagerRef.current) {
      socketManagerRef.current.disconnect();
      socketManagerRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (!socketManagerRef.current || !isConnected) {
      console.error('WebSocket is not connected');
      return;
    }

    const now = Date.now();
    if (lastMessageTime.current && now - lastMessageTime.current < 1000) {
      return;
    }
    lastMessageTime.current = now;

    const messageToSend = {
      role: message.role,
      message: message.message
    };

    socketManagerRef.current.socket.send(JSON.stringify(messageToSend));
  }, [isConnected]);

  useEffect(() => {
    isComponentMounted.current = true;

    return () => {
      isComponentMounted.current = false;
      
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect();
        socketManagerRef.current = null;
      }
      
      messageQueue.current = [];
      setIsConnected(false);
    };
  }, []);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected
  };
};

export default useDebateSocket; 