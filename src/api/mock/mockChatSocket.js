class MockChatSocket {
  constructor(url) {
    this.url = url;
    this.messageHandlers = new Map();
    this.connected = false;
    this.noteId = null;
  }

  connect() {
    this.connected = true;
    console.log('Mock WebSocket connected');
    this.emit('connected');
  }

  disconnect() {
    this.connected = false;
    console.log('Mock WebSocket disconnected');
    this.emit('disconnected');
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

  emit(type, data) {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => handler(data));
  }

  send(type, data) {
    if (!this.connected) {
      console.error('Mock WebSocket is not connected');
      return;
    }

    switch (type) {
      case 'join_chat':
        this.noteId = data.noteId;
        this.emit('user_joined', { noteId: this.noteId });
        break;
      case 'leave_chat':
        this.emit('user_left', { noteId: this.noteId });
        this.noteId = null;
        break;
      case 'send_message':
        this.emit('message_received', {
          text: data.message,
          sender: 'user',
          timestamp: new Date().toISOString(),
        });
        // Simulate AI response
        setTimeout(() => {
          this.emit('message_received', {
            text: `AI response to: ${data.message}`,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
          });
        }, 1000);
        break;
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }
}

export default MockChatSocket; 