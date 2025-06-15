const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.connectionTimeout = null;
    this.forceClose = false;
    this.heartbeatInterval = null;
    this.url = `${API_BASE_URL}/ws/chat`;
    this.currentStreamMessage = '';
    this.lastMessageTime = null;
    this.messageQueue = [];
    this.isProcessingQueue = false;
  }

  connect() {
    if (this.isConnecting || this.forceClose) return;
    
    try {
      this.isConnecting = true;
      
      // 이전 소켓이 있다면 정리
      if (this.socket) {
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
        this.socket.onopen = null;
        this.socket.close();
        this.socket = null;
      }

      this.socket = new WebSocket(this.url);

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
        this.startHeartbeat();
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopHeartbeat();
        
        if (!this.forceClose) {
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          // 먼저 JSON으로 파싱 시도
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch {
          // JSON 파싱 실패 시 서버 메시지 형식 처리
          const message = event.data;
          
          if (message.startsWith('connected:')) {
            const content = message.replace('connected:', '').trim();
            
            if (content === 'connected') {
              // 일반 연결 확인 메시지
              this.handleMessage({
                type: 'connection_established',
                data: { status: 'connected' }
              });
            } else if (content.startsWith('Your chat_id is:')) {
              // chat_id가 포함된 연결 메시지
              const chatId = content.replace('Your chat_id is:', '').trim();
              this.handleMessage({
                type: 'connection_established',
                data: { chatId }
              });
            }
          } else if (message.startsWith('error:')) {
            // 에러 메시지 처리
            const content = message.replace('error:', '').trim();
            this.handleMessage({
              type: 'error',
              data: { message: content }
            });
          } else if (message.startsWith('message_received:')) {
            // 메시지 수신 처리
            const content = message.replace('message_received:', '').trim();
            this.handleMessage({
              type: 'message_received',
              data: { message: content }
            });
          } else if (message.startsWith('send_message:')) {
            // 스트리밍 메시지 처리
            const content = message.replace('send_message:', '').trim();
            if (content === '<EOS>') {
              // 스트리밍 완료
              if (this.currentStreamMessage) {
                this.handleMessage({
                  type: 'message_received',
                  data: { message: this.currentStreamMessage }
                });
                this.currentStreamMessage = '';
              }
              // EOS 메시지를 별도로 전달
              this.handleMessage({
                type: 'message_received',
                data: { message: '<EOS>' }
              });
            } else {
              // 스트리밍 메시지 누적
              this.currentStreamMessage += content;
              // 스트리밍 메시지는 누적된 전체 내용을 전달
              this.handleMessage({
                type: 'message_received',
                data: { message: this.currentStreamMessage }
              });
            }
          } else {
            // 기타 메시지 처리
            this.handleMessage({
              type: 'text',
              data: { text: message }
            });
          }
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      clearTimeout(this.connectionTimeout);
      this.stopHeartbeat();
      this.handleReconnect();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting && !this.forceClose) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3);
      console.error(`Connection lost. Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
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

    // 서버로부터 받은 메시지에 role 추가
    if (type === 'message_received' && data) {
      data.role = 'assistant';
    }

    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler({ type, data });
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

    if (!data || !data.message) {
      console.error('Invalid message data:', data);
      return;
    }

    // 마지막 메시지 전송 시간과 현재 시간을 비교
    const now = Date.now();
    if (this.lastMessageTime && now - this.lastMessageTime < 1000) {
      return;
    }
    this.lastMessageTime = now;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        // 사용자 메시지는 'user' role 사용
        const message = {
          role: "user",
          message: data.message
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
    this.stopHeartbeat();
    if (this.socket) {
      this.isConnecting = false;
      clearTimeout(this.connectionTimeout);
      this.socket.close();
      this.socket = null;
    }
    this.currentStreamMessage = '';
  }
}

// 싱글톤 인스턴스 생성
const wsManager = new WebSocketManager();

export default wsManager; 