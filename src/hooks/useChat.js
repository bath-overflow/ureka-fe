import { useState, useEffect } from 'react';

export const useChat = (projectId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

        const userMsg = {
            id: messages.length + 1,
            text: input,
            sender: "user"
        };

        // 사용자 메시지 추가
        setMessages(prev => [...prev, userMsg]);

        try {
            // API 엔드포인트가 준비되기 전까지는 에코 메시지로 대체
            const botMsg = {
                id: messages.length + 2,
                text: input,
                sender: "bot"
            };
            setMessages(prev => [...prev, botMsg]);

            // API 엔드포인트가 준비되면 아래 주석을 해제
            /*
            const response = await fetch(`/api/projects/${projectId}/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    role: 'user'
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            // 서버 응답으로부터 봇 메시지 받기
            const data = await response.json();
            const botMsg = {
                id: messages.length + 2,
                text: data.message,
                sender: "bot"
            };

            setMessages(prev => [...prev, botMsg]);
            */
            setError(null);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message);
            // 에러 발생 시 에코 메시지로 대체
            const botMsg = {
                id: messages.length + 2,
                text: input,
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
        error
    };
}; 