import React, { useState, useEffect, useRef } from 'react';
import { unsafe_createClientWithApiKey } from '@anam-ai/js-sdk';
import { useNavigate } from 'react-router-dom';
import './MeetBoss.css';

const MeetBoss = () => {
    const [status, setStatus] = useState('Standing By');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const apiKey = import.meta.env.VITE_ANAM_API_KEY;
        const personaId = import.meta.env.VITE_ANAM_PERSONA_ID;

        if (!apiKey || !personaId) {
            setError("Missing Anam API Key or Persona ID in .env file.");
            return;
        }

        try {
            clientRef.current = unsafe_createClientWithApiKey(apiKey, {
                personaId: personaId,
                disableVideoWrapper: true,
            });

            // Event Listeners (Basic connection tracking)
            clientRef.current.addListener('connectionStateChange', (state) => {
                setStatus(state);
                if (state === 'connected') {
                    setIsConnected(true);
                    // Stream automatically attaches based on DOM element passed during start() or manually
                } else if (state === 'disconnected') {
                    setIsConnected(false);
                }
            });

            // Client-side tool calling hook
            clientRef.current.addListener('command', (commandData) => {
                console.log("Anam command received: ", commandData);
                // Anam SDK structure typically gives { command: "name", params: {} }
                const name = commandData.command || commandData.name;
                const args = commandData.params || commandData.arguments || {};
                
                if (name === 'navigate_to') {
                    navigate(args.path);
                } else if (name === 'play_music') {
                    window.dispatchEvent(new CustomEvent('ai_play_music', { detail: args.action }));
                } else if (name === 'talk_to_elon') {
                    navigate('/talking-elon');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_talk_to_elon', detail: args.text }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_talk_to_elon', { detail: args.text })), 800);
                } else if (name === 'explore_country') {
                    navigate('/explore');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_explore_country', detail: args.country }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_explore_country', { detail: args.country })), 1000);
                } else if (name === 'contact_submit') {
                    navigate('/contact');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_contact_submit', detail: args }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_contact_submit', { detail: args })), 800);
                } else if (name === 'add_to_cart') {
                    navigate('/merch');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_add_to_cart', detail: args.product_name }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_add_to_cart', { detail: args.product_name })), 800);
                } else if (name === 'post_comment') {
                    navigate('/comments');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_post_comment', detail: args }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_post_comment', { detail: args })), 800);
                } else if (name === 'pick_color') {
                    navigate('/color-picker');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_pick_color', detail: args.hex_color }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_pick_color', { detail: args.hex_color })), 800);
                } else if (name === 'set_video_persona') {
                    navigate('/editor');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_set_persona', detail: args.persona_id }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_set_persona', { detail: args.persona_id })), 800);
                } else if (name === 'try_os') {
                    navigate('/try-os');
                } else if (name === 'get_weather') {
                    navigate('/weather');
                } else if (name === 'play_tictactoe') {
                    navigate('/portfolio');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_play_tictactoe', detail: args.move }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_play_tictactoe', { detail: args.move })), 800);
                } else if (name === 'calculate_math') {
                    navigate('/portfolio');
                    sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_calculate_math', detail: args.expression }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('ai_calculate_math', { detail: args.expression })), 800);
                }
            });

            clientRef.current.addListener('message', (msg) => {
                // If anam streams text responses, we could log them.
            });

        } catch (err) {
            setError("Failed to initialize Anam Client: " + err.message);
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.stop();
            }
        };
    }, []);

    const toggleConnection = async () => {
        if (!clientRef.current) return;
        
        if (isConnected) {
            setStatus('Disconnecting...');
            await clientRef.current.stop();
            setIsConnected(false);
            setStatus('Standing By');
        } else {
            try {
                setStatus('Connecting...');
                // Usually Anam requires the video element ID or ref to attach the stream
                // We'll pass the ID 'anam-video' or just call start()
                await clientRef.current.start();
                clientRef.current.streamToVideoElement('anam-video');
            } catch (err) {
                setStatus('Connection Failed');
                setError(err.message);
            }
        }
    };
    return (
        <div className="page-content animate-fade-in meet-boss-container">
            <h1 className="boss-title">Meet The Boss</h1>
            <p className="boss-subtitle">Have a face-to-face conversation with my digital twin, powered by Anam AI.</p>
            
            <div className="video-wrapper">
                <video id="anam-video" autoPlay playsInline disablePictureInPicture></video>
                {!isConnected && <div className="video-overlay standing-by">{status}</div>}
                {error && <div className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</div>}
            </div>

            <div className="controls">
                <button 
                  className={`connect-btn ${isConnected ? 'disconnect' : ''}`}
                  onClick={toggleConnection}
                  disabled={!!error}
                  style={isConnected ? { background: '#ff4b4b' } : {}}
                >
                    {isConnected ? 'Disconnect' : 'Connect to Boss'}
                </button>
            </div>
        </div>
    );
};

export default MeetBoss;
