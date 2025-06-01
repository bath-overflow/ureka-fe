import { useEffect, useRef, useCallback } from 'react';
import wsManager from '../api/websocket/chatSocket';

const useChatSocket = (onMessageReceived) => {
  const messageQueue = useRef([]);
  const isComponentMounted = useRef(true);
  const currentStreamMessage = useRef('');

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
      // 연결 메시지 처리
      if (message.text && message.text.startsWith('connected:')) {
        const chatId = message.text.split('Your chat_id is:')[1]?.trim();
        if (chatId) {
          messageQueue.current.push({ type: 'chat_id', chat_id: chatId });
          processMessageQueue();
        }
        return;
      }

      // 스트리밍 메시지 처리
      if (message.text && message.text.startsWith('send_message:')) {
        const content = message.text.replace('send_message:', '').trim();
        
        // EOS 토큰 처리
        if (content === '<EOS>') {
          if (currentStreamMessage.current) {
            messageQueue.current.push({
              type: 'message_received',
              text: currentStreamMessage.current
            });
            currentStreamMessage.current = '';
            processMessageQueue();
          }
          return;
        }

        // 스트리밍 메시지 누적
        currentStreamMessage.current += content;
        return;
      }

      // 일반 메시지 처리
      if (message.text) {
        messageQueue.current.push({ type: 'text', text: message.text });
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
    if (isComponentMounted.current && message.message) {
      wsManager.send('send_message', message);
    }
  }, []);

  useEffect(() => {
    isComponentMounted.current = true;

    // 이벤트 핸들러 등록
    wsManager.on('message_received', handleMessage);
    wsManager.on('error', handleError);
    wsManager.on('disconnect', handleDisconnect);
    wsManager.on('connect', handleConnect);

    // 연결이 없으면 연결 시도
    if (!wsManager.socket) {
      wsManager.connect();
    }

    return () => {
      isComponentMounted.current = false;
      
      // 이벤트 핸들러 제거
      wsManager.off('message_received', handleMessage);
      wsManager.off('error', handleError);
      wsManager.off('disconnect', handleDisconnect);
      wsManager.off('connect', handleConnect);
      
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