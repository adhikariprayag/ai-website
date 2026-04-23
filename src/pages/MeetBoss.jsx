import React, { useState, useEffect, useRef } from 'react';
import { unsafe_createClientWithApiKey } from '@anam-ai/js-sdk';
import { useNavigate } from 'react-router-dom';
import './MeetBoss.css';

const MeetBoss = () => {
    const [status, setStatus] = useState('Standing By');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const clientRef = useRef(null);
    const videoRef = useRef(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_ANAM_API_KEY;
        const personaId = import.meta.env.VITE_ANAM_PERSONA_ID;

        if (!apiKey || !personaId) {
            setError("Missing VITE_ANAM_API_KEY or VITE_ANAM_PERSONA_ID in .env");
            return;
        }

        // Guard against double-init in React StrictMode
        if (clientRef.current) return;

        try {
            const client = unsafe_createClientWithApiKey(apiKey, {
                personaId: personaId,
            });

            client.addListener('connectionStateChange', (state) => {
                console.log("Anam state:", state);
                setStatus(state);
                // Handle various connected state names the SDK might emit
                if (state === 'connected' || state === 'streaming' || state === 'streams_started' || state === 'active') {
                    setIsConnected(true);
                    setIsConnecting(false);
                } else if (state === 'disconnected' || state === 'stopped') {
                    setIsConnected(false);
                    setIsConnecting(false);
                    setStatus('Standing By');
                }
            });

            // Listen for live conversation transcripts
            client.addListener('MESSAGE_HISTORY_UPDATED', (history) => {
                console.log("Live Transcript History Update:", history);
                if (Array.isArray(history)) {
                    setMessages(history.map((msg, index) => ({
                        id: msg.id || index,
                        role: ["user", "human"].includes(msg.role?.toLowerCase()) ? "user" : "persona",
                        content: msg.content || ""
                    })).filter(msg => msg.content.trim() !== ""));
                }
            });

            client.addListener('command', (commandData) => {
                const name = commandData.command || commandData.name;
                const args = commandData.params || commandData.arguments || {};
                if (name === 'navigate_to') navigate(args.path);
                else if (name === 'play_music') window.dispatchEvent(new CustomEvent('ai_play_music', { detail: args.action }));
                else if (name === 'talk_to_elon') { navigate('/talking-elon'); setTimeout(() => window.dispatchEvent(new CustomEvent('ai_talk_to_elon', { detail: args.text })), 800); }
                else if (name === 'explore_country') { navigate('/explore'); setTimeout(() => window.dispatchEvent(new CustomEvent('ai_explore_country', { detail: args.country })), 1000); }
                else if (name === 'contact_submit') { navigate('/contact'); setTimeout(() => window.dispatchEvent(new CustomEvent('ai_contact_submit', { detail: args })), 800); }
                else if (name === 'add_to_cart') { navigate('/merch'); setTimeout(() => window.dispatchEvent(new CustomEvent('ai_add_to_cart', { detail: args.product_name })), 800); }
                else if (name === 'try_os') navigate('/try-os');
                else if (name === 'get_weather') navigate('/weather');
            });

            clientRef.current = client;
        } catch (err) {
            setError("Init Error: " + err.message);
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.stopStreaming().catch(() => {});
                clientRef.current = null;
            }
        };
    }, []);

    const handleConnect = async () => {
        if (!clientRef.current) {
            setError("Client not initialized. Please refresh.");
            return;
        }

        if (isConnected) {
            setStatus('Disconnecting...');
            try {
                await clientRef.current.stopStreaming();
            } catch (e) {
                console.error("Stop error:", e);
            }
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('Standing By');
            return;
        }

        setIsConnecting(true);
        setError(null);
        setStatus('Connecting...');

        try {
            await clientRef.current.streamToVideoElement('anam-video');
            console.log("Stream resolved — showing video now");
            setIsConnected(true);
            setIsConnecting(false);
            setStatus('Connected');

            // Force play the video element — desktop browsers block autoplay silently
            const video = document.getElementById('anam-video');
            
            if (video && typeof video.play === 'function') {
                video.muted = false;
                video.play().catch((e) => {
                    console.warn("Autoplay blocked, retrying muted:", e);
                    video.muted = true;
                    video.play().catch(console.error);
                });
            }
        } catch (err) {
            console.error("Stream error:", err);
            setError(err.message || "Failed to connect. Please try again.");
            setIsConnecting(false);
            setStatus('Standing By');
        }
    };

    return (
        <div className="page-content animate-fade-in meet-boss-container">
            <h1 className="boss-title">Meet The Boss</h1>
            <p className="boss-subtitle">Have a face-to-face conversation with my digital twin, powered by Anam AI.</p>

            <div className="content-layout">
                <div className="video-wrapper">
                    <video
                        id="anam-video"
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="anam-video-element"
                    ></video>

                    {/* Standing By overlay */}
                    {!isConnected && !isConnecting && (
                        <div className="video-overlay standing-by">
                            <div className="standing-by-icon">🤖</div>
                            <div>Standing By</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Press Connect to start</div>
                        </div>
                    )}

                    {/* Connecting overlay */}
                    {isConnecting && (
                        <div className="video-overlay connecting">
                            <div className="spinner"></div>
                            <div>Initiating Neural Link...</div>
                        </div>
                    )}

                    {/* Error popup */}
                    {error && (
                        <div className="error-popup">
                            <div className="error-icon">⚠️</div>
                            <div className="error-text">
                                <strong>Error</strong>
                                <p>{error}</p>
                            </div>
                            <button
                                className="error-dismiss"
                                onClick={() => { setError(null); setStatus('Standing By'); }}
                            >✕</button>
                        </div>
                    )}
                </div>

                <div className="live-captions">
                    <div className="captions-header">
                        <div className={`live-indicator ${isConnected ? 'active' : ''}`}></div>
                        Live Transcript
                    </div>
                    <div className="messages-container">
                        {messages.length === 0 && (
                            <div className="empty-captions">
                                The transcript will cleanly synchronize here once the connection is established...
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`caption-message ${msg.role}`}>
                                <strong>{msg.role === 'user' ? 'You' : 'Boss'}:</strong>
                                <p>{msg.content}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="controls">
                <button
                    className={`connect-btn ${isConnected ? 'disconnect' : ''}`}
                    onClick={handleConnect}
                    disabled={isConnecting}
                    style={isConnected ? { background: 'linear-gradient(45deg, #ff4b4b, #ff8c00)' } : {}}
                >
                    {isConnecting ? '⏳ Connecting...' : isConnected ? '⏸ Disconnect' : '▶ Connect to Boss'}
                </button>
            </div>
        </div>
    );
};

export default MeetBoss;
