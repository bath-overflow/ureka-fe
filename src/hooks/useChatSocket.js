import { useEffect, useRef, useCallback } from 'react';
import wsManager from '../api/websocket/chatSocket';

const useChatSocket = (onMessageReceived) => {
  const messageQueue = useRef([]);
  const isComponentMounted = useRef(true);
  const currentStreamMessage = useRef('');
  const lastMessageTime = useRef(null);

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
      console.log('Handling message in useChatSocket:', message);

      // 연결 메시지 처리
      if (message.type === 'connection_established') {
        if (message.data?.chatId) {
          messageQueue.current.push({ type: 'chat_id', chat_id: message.data.chatId });
          processMessageQueue();
        }
        return;
      }

      // 스트리밍 메시지 처리
      if (message.type === 'message_received') {
        const content = message.data?.message;
        
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
          // EOS 메시지를 별도로 전달
          messageQueue.current.push({
            type: 'message_received',
            data: { message: '<EOS>' }
          });
          currentStreamMessage.current = '';
          processMessageQueue();
          return;
        }

        // 스트리밍 메시지 누적
        if (content) {
          currentStreamMessage.current = content; // 누적하지 않고 현재 내용으로 대체
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
    console.error('WebSocket error:', error);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    console.log('WebSocket disconnected');
  }, []);

  const handleConnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    console.log('WebSocket connected');
  }, []);

  const joinChat = useCallback((noteId) => {
    if (isComponentMounted.current) {
      wsManager.send('join_chat', { noteId });
    }
  }, []);

  const leaveChat = useCallback(() => {
    if (isComponentMounted.current) {
      wsManager.send('leave_chat');
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (!wsManager) return;

    // 마지막 메시지 전송 시간과 현재 시간을 비교
    const now = Date.now();
    if (lastMessageTime.current && now - lastMessageTime.current < 1000) {
      console.log('Message sending too quickly, ignoring');
      return;
    }
    lastMessageTime.current = now;

    console.log('Sending message to server:', message);
    wsManager.send('message', message);
  }, [wsManager]);

  useEffect(() => {
    isComponentMounted.current = true;

    // 이벤트 핸들러 등록
    wsManager.on('connection_established', handleMessage);
    wsManager.on('message_received', handleMessage);
    wsManager.on('error', handleError);
    wsManager.on('disconnect', handleDisconnect);
    wsManager.on('connect', handleConnect);
    wsManager.on('text', handleMessage);

    // 연결이 없으면 연결 시도
    if (!wsManager.socket) {
      wsManager.connect();
    }

    return () => {
      isComponentMounted.current = false;
      
      // 이벤트 핸들러 제거
      wsManager.off('connection_established', handleMessage);
      wsManager.off('message_received', handleMessage);
      wsManager.off('error', handleError);
      wsManager.off('disconnect', handleDisconnect);
      wsManager.off('connect', handleConnect);
      wsManager.off('text', handleMessage);
      
      messageQueue.current = [];
      currentStreamMessage.current = '';
    };
  }, [handleMessage, handleError, handleDisconnect, handleConnect]);

  return {
    joinChat,
    leaveChat,
    sendMessage,
  };
};

export default useChatSocket;