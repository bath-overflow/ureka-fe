import { useState, useEffect } from 'react';
import useChatSocket from './useChatSocket';

export const useChat = (projectId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const { sendMessage: sendSocketMessage } = useChatSocket((message) => {
        console.log('Received message in useChat:', message);

        if (message.type === 'chat_id') {
            setChatId(message.chat_id);
            return;
        }

        // 서버로부터 받은 메시지 처리
        if (message.type === 'message_received') {
            if (message.data?.message === 'Processing your message...') {
                setIsStreaming(true);
                // 처리 중 메시지 추가
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: '처리 중...',
                    sender: 'bot'
                }]);
                return;
            }

            const botMsg = {
                id: messages.length + 1,
                text: message.data?.message || message.text,
                sender: "bot"
            };

            setMessages(prev => {
                // 마지막 메시지가 bot의 메시지이고 스트리밍 중이면 업데이트
                if (isStreaming && prev.length > 0 && prev[prev.length - 1].sender === 'bot') {
                    return [...prev.slice(0, -1), botMsg];
                }
                // 그렇지 않으면 새 메시지 추가
                return [...prev, botMsg];
            });

            setIsStreaming(false);
        } else if (message.type === 'text') {
            const botMsg = {
                id: messages.length + 1,
                text: message.text,
                sender: "bot"
            };
            setMessages(prev => [...prev, botMsg]);
        } else if (message.type === 'error') {
            const errorMsg = {
                id: messages.length + 1,
                text: message.message || message.data?.message || "오류가 발생했습니다.",
                sender: "system"
            };
            setMessages(prev => [...prev, errorMsg]);
            setError(message.message || message.data?.message);
        }
    });

    // 서버에서 채팅 기록 불러오기
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setIsLoading(true);
                // 기본 메시지
                setMessages([{
                    id: 1,
                    text: "UREKA와 자유롭게 대화해보세요!",
                    sender: "system"
                }]);
                setError(null);

            } catch (error) {
                console.error('Error fetching chat history:', error);
                setError(error.message);
                // 에러 발생 시 기본 메시지 표시
                setMessages([{
                    id: 1,
                    text: "UREKA와 자유롭게 대화해보세요!",
                    sender: "system"
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [projectId]);

    const sendMessage = async (input) => {
        if (input.trim() === "") return;

        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: "user"
        };

        // 사용자 메시지 추가
        setMessages(prev => [...prev, userMessage]);

        try {
            // 서버의 ChatMessage 모델 형식에 맞춰 메시지 전송
            const chatMessage = {
                message: input
            };
            
            console.log('Sending message:', chatMessage);
            
            // WebSocket을 통해 메시지 전송
            sendSocketMessage(chatMessage);
            setError(null);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message);
            // 에러 발생 시 에코 메시지로 대체
            const botMsg = {
                id: messages.length + 2,
                text: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
                sender: "bot"
            };
            setMessages(prev => [...prev, botMsg]);
        }
    };

    const sendHint = () => {
        const hintMsg = {
            id: messages.length + 1,
            text: "이건 힌트야",
            sender: "bot"
        };
        setMessages(prev => [...prev, hintMsg]);
    };

    return {
        messages,
        sendMessage,
        sendHint,
        isLoading,
        error,
        chatId,
        isStreaming
    };
}; 