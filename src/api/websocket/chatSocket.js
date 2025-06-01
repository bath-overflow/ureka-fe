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
          console.log('Connection timeout, closing socket');
          this.socket.close();
        }
      }, 5000);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.startHeartbeat();
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
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
        console.log('Received message:', event.data);

        try {
          // 먼저 JSON으로 파싱 시도
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch {
          // JSON 파싱 실패 시 서버 메시지 형식 처리
          const [type, content] = event.data.split(':').map(str => str.trim());
          
          if (type === 'connected') {
            if (content === 'connected') {
              // 일반 연결 확인 메시지
              this.handleMessage({
                type: 'connection_established',
                data: { status: 'connected' }
              });
            } else if (content.startsWith('Your chat_id is:')) {
              // chat_id가 포함된 연결 메시지
              const chatId = content.split('Your chat_id is:')[1].trim();
              console.log('Extracted chat_id:', chatId);
              this.handleMessage({
                type: 'connection_established',
                data: { chatId }
              });
            }
          } else if (type === 'error') {
            // 에러 메시지 처리
            this.handleMessage({
              type: 'error',
              data: { message: content }
            });
          } else if (type === 'message_received') {
            // 메시지 수신 처리
            this.handleMessage({
              type: 'message_received',
              data: { message: content }
            });
          } else if (type === 'send_message') {
            // 스트리밍 메시지 처리
            if (content === '<EOS>') {
              // 스트리밍 완료
              if (this.currentStreamMessage) {
                this.handleMessage({
                  type: 'message_received',
                  data: { message: this.currentStreamMessage }
                });
                this.currentStreamMessage = '';
              }
            } else {
              // 스트리밍 메시지 누적
              this.currentStreamMessage += content;
              this.handleMessage({
                type: 'message_received',
                data: { message: this.currentStreamMessage }
              });
            }
          } else {
            // 기타 메시지 처리
            this.handleMessage({
              type: 'text',
              data: { text: content }
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
        this.send('ping', { timestamp: Date.now() });
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
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
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

    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
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

  send(type, data) {
    if (!type || typeof type !== 'string') {
      console.error('Invalid message type:', type);
      return;
    }

    if (!data || !data.message) {
      console.error('Invalid message data:', data);
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const message = {
          role: "user",
          message: data.message
        };
        console.log('Sending message to server:', message);
        this.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
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