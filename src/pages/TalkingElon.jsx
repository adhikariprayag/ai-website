import React, { useState, useEffect, useRef } from 'react';
import { streamMessageToElon } from '../services/cerebras';
import './TalkingElon.css';

const TALKING_FRAMES = [
    "https://pngimg.com/uploads/elon_musk/elon_musk_PNG9.png",  // Smile/Closed
    "https://pngimg.com/uploads/elon_musk/elon_musk_PNG33.png", // Serious/Talking?
    "https://pngimg.com/uploads/elon_musk/elon_musk_PNG23.png", // Laughing/Open
    "https://pngimg.com/uploads/elon_musk/elon_musk_PNG14.png"  // Open
];

const TalkingElon = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [status, setStatus] = useState('Ready to chat!');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [voices, setVoices] = useState([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);
    const frameIntervalRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleElonReply(text);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError('Could not hear you. Try again!');
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        const updateVoices = () => {
            setVoices(synthesisRef.current.getVoices());
        };
        synthesisRef.current.onvoiceschanged = updateVoices;
        updateVoices();

        return () => {
            if (synthesisRef.current) synthesisRef.current.onvoiceschanged = null;
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        };
    }, []);

    // Frame cycling logic
    useEffect(() => {
        if (isSpeaking || isThinking) {
            frameIntervalRef.current = setInterval(() => {
                setCurrentFrameIndex(prev => (prev + 1) % TALKING_FRAMES.length);
            }, 120);
        } else {
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
            setCurrentFrameIndex(0);
        }
        return () => {
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        };
    }, [isSpeaking, isThinking]);

    const handleElonReply = async (userText) => {
        setIsThinking(true);
        setStatus('Elon is thinking...');
        setResponse('');
        setError(null);

        try {
            await streamMessageToElon(
                userText,
                (chunk) => {
                    // Clean up asterisks/stage directions in real-time
                    const cleanedChunk = chunk.replace(/\*.*?\*/g, '');
                    setResponse(cleanedChunk);
                    setIsThinking(false);
                    setStatus('Elon is generating...');
                },
                (fullText) => {
                    const cleanedFullText = fullText.replace(/\*.*?\*/g, '').trim();
                    setResponse(cleanedFullText);
                    setStatus('Elon is speaking...');
                    speakText(cleanedFullText);
                },
                (err) => {
                    setError(err);
                    setIsThinking(false);
                    setStatus('');
                }
            );
        } catch (err) {
            setError('Failed to reach Elon.');
            setIsThinking(false);
        }
    };

    const speakText = (text) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const currentVoices = voices.length > 0 ? voices : synthesisRef.current.getVoices();
        const maleVoice = currentVoices.find(v =>
            (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')) &&
            v.lang.startsWith('en')
        ) || currentVoices.find(v => v.lang.startsWith('en'));

        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.85;
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setStatus('Click the mic to talk again!');
        };

        synthesisRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setError(null);
            setTranscript('');
            setResponse('');
            setStatus('Listening...');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="page-content animate-fade-in">
            <div className="talking-elon-page">
                <h1>Talking Elon</h1>

                <div className="talking-elon-container">
                    <div className="avatar-column">
                        <div className={`elon-avatar-container ${isListening ? 'listening' : ''} ${(isSpeaking || isThinking) ? 'speaking' : ''}`}>
                            <div className="elon-avatar">
                                <img
                                    src={TALKING_FRAMES[currentFrameIndex]}
                                    alt="Elon Musk Avatar"
                                    className="elon-avatar-image-frame"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="chat-column">
                        <div className="elon-status">{status}</div>

                        {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

                        {transcript && (
                            <div className="elon-transcript">
                                <strong>You:</strong> "{transcript}"
                            </div>
                        )}

                        {response && (
                            <div className="response-bubble">
                                <strong>Elon:</strong> {response}
                            </div>
                        )}
                    </div>
                </div>

                <div className="elon-controls">
                    <button
                        className={`listen-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        disabled={isSpeaking || isThinking}
                    >
                        {isListening ? '🛑 Stop' : '🎤 Talk to Elon'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TalkingElon;
