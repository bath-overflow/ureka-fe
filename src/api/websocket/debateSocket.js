const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class DebateSocketManager {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.connectionTimeout = null;
    this.forceClose = false;
    this.currentStreamMessage = '';
    this.lastMessageTime = null;
    this.messageQueue = [];
    this.isProcessingQueue = false;
    this.currentChatId = null;
    this.keepAliveInterval = null;
  }

  connect(chatId) {
    if (this.isConnecting || this.forceClose) return;
    
    try {
      this.isConnecting = true;
      this.currentChatId = chatId;
      
      // 이미 연결되어 있고 같은 chatId를 사용 중이면 재연결하지 않음
      if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentChatId === chatId) {
        console.log('Already connected with the same chatId:', chatId);
        this.isConnecting = false;
        return;
      }
      
      // 이전 소켓이 있다면 정리
      if (this.socket) {
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
        this.socket.onopen = null;
        this.socket.close();
        this.socket = null;
      }

      const url = `${API_BASE_URL}/ws/debate/${chatId}`;
      this.socket = new WebSocket(url);

      // 연결 타임아웃 설정
      this.connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.error('Connection timeout');
          this.socket.close();
        }
      }, 5000);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.startKeepAlive();
        this.handleMessage({
          type: 'connection_established',
          data: { chatId }
        });
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopKeepAlive();
        
        if (!this.forceClose) {
          console.log('WebSocket closed:', event.code, event.reason);
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopKeepAlive();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch {
          const message = event.data;
          console.log('Received raw message:', message);
          
          if (message.startsWith('error:')) {
            const content = message.replace('error:', '').trim();
            this.handleMessage({
              type: 'error',
              data: { message: content }
            });
          } else if (message.startsWith('message_received:')) {
            const content = message.replace('message_received:', '').trim();
            this.handleMessage({
              type: 'message_received',
              data: { message: content }
            });
          } else if (message.startsWith('send_message:')) {
            const content = message.replace('send_message:', '').trim();
            if (content === '<EOS>') {
              if (this.currentStreamMessage) {
                this.handleMessage({
                  type: 'message_received',
                  data: { message: this.currentStreamMessage }
                });
                this.currentStreamMessage = '';
              }
              this.handleMessage({
                type: 'message_received',
                data: { message: '<EOS>' }
              });
            } else {
              this.currentStreamMessage += content;
              this.handleMessage({
                type: 'message_received',
                data: { message: this.currentStreamMessage }
              });
            }
          } else if (message.startsWith('connected:')) {
            const content = message.replace('connected:', '').trim();
            console.log('Received connection message:', content);
            
            if (content === 'connected') {
              // 일반 연결 확인 메시지
              this.handleMessage({
                type: 'connection_established',
                data: { chatId: this.currentChatId }
              });
            } else if (content.startsWith('Your chat_id is:')) {
              // debate_chat_id가 포함된 연결 메시지
              const debateChatId = content.replace('Your chat_id is:', '').trim();
              this.currentChatId = debateChatId; // debate_chat_id로 업데이트
              this.handleMessage({
                type: 'connection_established',
                data: { chatId: debateChatId }
              });
            }
          } else {
            // Handle raw messages from server
            this.handleMessage({
              type: 'message_received',
              data: { message }
            });
          }
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      clearTimeout(this.connectionTimeout);
      this.stopKeepAlive();
      this.handleReconnect();
    }
  }

  startKeepAlive() {
    this.stopKeepAlive(); // Clear any existing interval
    this.keepAliveInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending keep-alive:', error);
        }
      }
    }, 30000); // Send ping every 30 seconds
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting && !this.forceClose) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3);
      console.error(`Connection lost. Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentChatId) {
          this.connect(this.currentChatId);
        }
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.isConnecting = false;
    }
  }

  handleMessage(message) {
    if (!message || typeof message !== 'object') {
      console.error('Invalid message format:', message);
      return;
    }

    const { type, data } = message;
    if (!type) {
      console.error('Message missing type:', message);
      return;
    }

    // chatSocket의 메시지는 무시
    if (type === 'ping' || (data && data.timestamp)) {
      return;
    }

    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for type ${type}:`, error);
      }
    });
  }

  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify(message));
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error sending message from queue:', error);
        }
      }
    }
    this.isProcessingQueue = false;
  }

  send(type, data) {
    if (!type || typeof type !== 'string') {
      console.error('Invalid message type:', type);
      return;
    }

    const now = Date.now();
    if (this.lastMessageTime && now - this.lastMessageTime < 1000) {
      return;
    }
    this.lastMessageTime = now;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const message = {
          type,
          data
        };
        this.messageQueue.push(message);
        this.processMessageQueue();
      } catch (error) {
        console.error('Error adding message to queue:', error);
        this.handleReconnect();
      }
    } else {
      console.error('WebSocket is not connected');
      this.handleReconnect();
    }
  }

  disconnect() {
    this.forceClose = true;
    this.stopKeepAlive();
    if (this.socket) {
      this.isConnecting = false;
      clearTimeout(this.connectionTimeout);
      // 연결이 실제로 끊어졌을 때만 소켓을 null로 설정
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      this.socket = null;
    }
    this.currentStreamMessage = '';
    this.currentChatId = null;
  }
}

const debateSocketManager = new DebateSocketManager();

export default debateSocketManager; 