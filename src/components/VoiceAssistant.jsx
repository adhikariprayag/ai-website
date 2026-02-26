import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                setFeedback(`Recognized: "${transcript}"`);
                handleCommand(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setFeedback('Error recognizing speech.');
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            console.warn('Speech recognition not supported in this browser.');
        }
    }, []);

    const handleCommand = (command) => {
        if (command.includes('home')) navigate('/');
        else if (command.includes('contact')) navigate('/contact');
        else if (command.includes('portfolio')) navigate('/portfolio');
        else if (command.includes('weather')) navigate('/weather');
        else if (command.includes('merch')) navigate('/merch');
        else if (command.includes('try os') || command.includes('operating system')) navigate('/try-os');
        else if (command.includes('comments')) navigate('/comments');
        else if (command.includes('chat') || command.includes('ai')) navigate('/chat');
        else if (command.includes('color')) navigate('/color-picker');
        else setFeedback(`Command "${command}" not recognized.`);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setFeedback('Listening...');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="voice-assistant-container">
            {feedback && (
                <div className="voice-feedback animate-fade-in">
                    {feedback}
                </div>
            )}
            <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                aria-label="Voice Assistant"
                title="Voice Command (e.g., 'go to contact')"
            >
                <div className="mic-icon">
                    {isListening ? '🛑' : '🎤'}
                </div>
                {isListening && <div className="pulse-ring"></div>}
            </button>
        </div>
    );
};

export default VoiceAssistant;
