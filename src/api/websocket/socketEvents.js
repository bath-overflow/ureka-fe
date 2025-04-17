export const SOCKET_EVENTS = {
  // Client to Server
  SEND_MESSAGE: 'send_message',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  
  // Server to Client
  MESSAGE_RECEIVED: 'message_received',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ERROR: 'error',
  
  // System
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected'
}; 