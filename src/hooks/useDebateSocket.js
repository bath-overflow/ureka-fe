import { useEffect, useRef, useCallback, useState } from 'react';
import debateSocketManager from '../api/websocket/debateSocket';

const useDebateSocket = (onMessageReceived) => {
  const messageQueue = useRef([]);
  const isComponentMounted = useRef(true);
  const currentStreamMessage = useRef('');
  const lastMessageTime = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

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
      console.log('Handling message in useDebateSocket:', message);

      if (message.type === 'connection_established') {
        console.log('Connection established with chatId:', message.data?.chatId);
        setIsConnected(true);
        return;
      }

      // 스트리밍 메시지 처리
      if (message.type === 'message_received') {
        const content = message.data?.message;
        console.log('Received message:', content);
        
        // 연결 메시지 처리
        if (content && content.startsWith('connected:')) {
          const connectionContent = content.replace('connected:', '').trim();
          if (connectionContent === 'connected' || connectionContent.startsWith('Your chat_id is:')) {
            console.log('Received connection confirmation');
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
          if (currentStreamMessage.current) {
            messageQueue.current.push({
              type: 'message_received',
              data: { message: currentStreamMessage.current }
            });
          }
          messageQueue.current.push({
            type: 'message_received',
            data: { message: '<EOS>' }
          });
          currentStreamMessage.current = '';
          processMessageQueue();
          return;
        }

        if (content) {
          currentStreamMessage.current = content;
          messageQueue.current.push({
            type: 'message_received',
            data: { message: currentStreamMessage.current }
          });
          processMessageQueue();
        }
        return;
      }

      // 에러 메시지 처리
      if (message.type === 'error') {
        console.error('Received error message:', message.data?.message);
        // chatSocket의 에러는 무시
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
    // chatSocket의 에러는 무시
    if (error?.data?.message?.includes('Invalid message data')) {
      return;
    }
    console.error('WebSocket error:', error);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    console.log('WebSocket disconnected');
    setIsConnected(false);
  }, []);

  const handleConnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    console.log('WebSocket connected');
    setIsConnected(true);
  }, []);

  const connect = useCallback((chatId) => {
    if (isComponentMounted.current && !isConnected) {
      console.log('Connecting to debate socket with chatId:', chatId);
      debateSocketManager.connect(chatId);
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    if (isComponentMounted.current && isConnected) {
      console.log('Disconnecting from debate socket');
      debateSocketManager.disconnect();
      setIsConnected(false);
    }
  }, [isConnected]);

  const sendMessage = useCallback((message) => {
    if (!debateSocketManager || !isConnected) {
      console.error('WebSocket is not connected');
      return;
    }

    const now = Date.now();
    if (lastMessageTime.current && now - lastMessageTime.current < 1000) {
      console.log('Message sending too quickly, ignoring');
      return;
    }
    lastMessageTime.current = now;

    console.log('Sending message to server:', message);
    debateSocketManager.send('message', { message: message.message });
  }, [isConnected]);

  useEffect(() => {
    isComponentMounted.current = true;

    // 이벤트 핸들러 등록
    debateSocketManager.on('connection_established', handleMessage);
    debateSocketManager.on('message_received', handleMessage);
    debateSocketManager.on('error', handleError);
    debateSocketManager.on('disconnect', handleDisconnect);
    debateSocketManager.on('connect', handleConnect);
    debateSocketManager.on('text', handleMessage);

    // 초기 연결 상태 확인
    if (debateSocketManager.socket?.readyState === WebSocket.OPEN) {
      setIsConnected(true);
    }

    return () => {
      isComponentMounted.current = false;
      
      // 이벤트 핸들러 제거
      debateSocketManager.off('connection_established', handleMessage);
      debateSocketManager.off('message_received', handleMessage);
      debateSocketManager.off('error', handleError);
      debateSocketManager.off('disconnect', handleDisconnect);
      debateSocketManager.off('connect', handleConnect);
      debateSocketManager.off('text', handleMessage);
      
      messageQueue.current = [];
      currentStreamMessage.current = '';
    };
  }, [handleMessage, handleError, handleDisconnect, handleConnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected
  };
};

export default useDebateSocket; 