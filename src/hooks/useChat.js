import { useState, useEffect } from 'react';
import useChatSocket from './useChatSocket';
import chatApi from '../api/rest/chatApi';

export const useChat = (projectId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoadingHint, setIsLoadingHint] = useState(false);

    const { sendMessage: sendSocketMessage } = useChatSocket((message) => {
        if (message.type === 'chat_id') {
            setChatId(message.chat_id);
            return;
        }

        // 서버로부터 받은 메시지 처리
        if (message.type === 'message_received') {
            const content = message.data?.message;

            // 처리 중 메시지
            if (content === 'Processing your message...') {
                setIsStreaming(true);
                setMessages(prev => {
                    // 이미 처리 중 메시지가 있는지 확인
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.text === '처리 중...' && lastMessage?.sender === 'assistant') {
                        return prev;
                    }
                    return [...prev, {
                        id: Date.now(),
                        text: '처리 중...',
                        sender: 'assistant'
                    }];
                });
                return;
            }

            // 스트리밍이 끝났는지 확인
            if (content === '<EOS>') {
                setIsStreaming(false);
                return;
            }

            // 스트리밍 메시지 업데이트
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];

                // 마지막 메시지가 assistant의 메시지이고 스트리밍 중이면 업데이트
                if (isStreaming && lastMessage?.sender === 'assistant') {
                    // 이전 메시지와 동일한 내용인지 확인
                    if (lastMessage.text === content) {
                        return prev;
                    }
                    return [
                        ...prev.slice(0, -1),
                        {
                            id: lastMessage.id,
                            text: content,
                            sender: 'assistant'
                        }
                    ];
                }

                // 그렇지 않으면 새 메시지 추가
                return [...prev, {
                    id: Date.now(),
                    text: content,
                    sender: 'assistant'
                }];
            });
        } else if (message.type === 'error') {
            const errorMsg = {
                id: Date.now(),
                text: message.data?.message || "오류가 발생했습니다.",
                sender: "system"
            };
            setMessages(prev => [...prev, errorMsg]);
            setError(message.data?.message);
            setIsStreaming(false);
        }
    }, projectId);

    // 서버에서 채팅 기록 불러오기
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setIsLoading(true);
                // 메시지가 없을 때만 기본 메시지 설정
                if (messages.length === 0) {
                    setMessages([{
                        id: Date.now(),
                        text: "UREKA와 자유롭게 대화해보세요!",
                        sender: "system"
                    }]);
                }
                setError(null);

            } catch (error) {
                console.error('Error fetching chat history:', error);
                setError(error.message);
                // 에러 발생 시 기본 메시지 표시
                if (messages.length === 0) {
                    setMessages([{
                        id: Date.now(),
                        text: "UREKA와 자유롭게 대화해보세요!",
                        sender: "system"
                    }]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [projectId]);

    const sendMessage = async (input) => {
        if (input.trim() === "" || isStreaming) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: "user"
        };

        // 사용자 메시지 추가 전에 마지막 메시지 확인
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            // 마지막 메시지가 같은 내용의 사용자 메시지인 경우 중복 방지
            if (lastMessage?.text === input && lastMessage?.sender === "user") {
                return prev;
            }
            return [...prev, userMessage];
        });

        try {
            // 서버의 ChatMessage 모델 형식에 맞춰 메시지 전송
            const chatMessage = {
                message: input
            };

            // WebSocket을 통해 메시지 전송
            sendSocketMessage(chatMessage);
            setError(null);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message);
            // 에러 발생 시 에코 메시지로 대체
            const assistantMsg = {
                id: Date.now(),
                text: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
                sender: "assistant"
            };
            setMessages(prev => [...prev, assistantMsg]);
            setIsStreaming(false);
        }
    };

    const sendHint = async () => {
        if (!chatId || isLoadingHint) return;

        try {
            setIsLoadingHint(true);
            const hintData = await chatApi.getHint(chatId);

            // 힌트 메시지 추가
            const hintMsg = {
                id: Date.now(),
                text: hintData.hint || "힌트를 불러오는데 실패했습니다.",
                sender: "assistant"
            };
            setMessages(prev => [...prev, hintMsg]);
        } catch (error) {
            console.error('Error fetching hint:', error);
            const errorMsg = {
                id: Date.now(),
                text: "힌트를 불러오는데 실패했습니다.",
                sender: "system"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoadingHint(false);
        }
    };

    return {
        messages,
        sendMessage,
        sendHint,
        isLoading,
        error,
        chatId,
        isStreaming,
        isLoadingHint
    };
}; 