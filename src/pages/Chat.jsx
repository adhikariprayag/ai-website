import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToCerebras } from '../services/cerebras';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your AI assistant powered by Cerebras. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await sendMessageToCerebras(input);
            const aiMessage = { role: 'assistant', text: responseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error.message || "Sorry, I encountered an error. Please try again later.";
            setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="page-content animate-fade-in">
            <h1>Chat with AI</h1>
            <div className="chat-interface">
                <div className="chat-window">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-container ${msg.role}`}>
                            <div className={msg.role === 'assistant' ? 'ai-message' : 'user-message'}>
                                {/* Simple text rendering, can upgrade to Markdown later */}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="loading-indicator">Thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-area">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={isLoading}>
                        {isLoading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
