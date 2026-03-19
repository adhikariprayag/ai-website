import React, { useState, useRef, useEffect } from 'react';
import './VideoEditor.css';

const PERSONAS = [
    { id: 'elon', name: 'Elon Musk', img: 'https://pngimg.com/uploads/elon_musk/elon_musk_PNG9.png' },
    { id: 'attenborough', name: 'D. Attenborough', img: 'https://i.pravatar.cc/150?u=attenborough' },
    { id: 'taylor', name: 'Taylor Swift', img: 'https://i.pravatar.cc/150?u=swift' },
    { id: 'morgan', name: 'Morgan Freeman', img: 'https://i.pravatar.cc/150?u=morgan' }
];

const VideoEditor = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [activePersona, setActivePersona] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const [isFinished, setIsFinished] = useState(false);

    const personaRefs = useRef({});
    const videoContainerRef = useRef(null);
    const videoRef = useRef(null);
    const svgRef = useRef(null);
    const audioCtxRef = useRef(null);
    const sourceRef = useRef(null);
    const filterRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoUrl(URL.createObjectURL(file));
            setIsFinished(false);
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        }
    };

    const setupAudioFilter = () => {
        if (!videoRef.current || audioCtxRef.current) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();

            sourceRef.current = audioCtxRef.current.createMediaElementSource(videoRef.current);
            filterRef.current = audioCtxRef.current.createBiquadFilter();

            filterRef.current.type = 'lowpass';
            filterRef.current.frequency.value = 20000;

            sourceRef.current.connect(filterRef.current);
            filterRef.current.connect(audioCtxRef.current.destination);
        } catch (err) {
            console.error("Audio filter setup failed:", err);
        }
    };

    const applyVoiceEffect = () => {
        if (!filterRef.current || !audioCtxRef.current || !videoRef.current) return;

        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        switch (activePersona) {
            case 'elon':
                filterRef.current.type = 'peaking';
                filterRef.current.frequency.value = 1500;
                filterRef.current.Q.value = 10;
                filterRef.current.gain.value = 15;
                videoRef.current.playbackRate = 0.95;
                break;
            case 'attenborough':
                filterRef.current.type = 'lowpass';
                filterRef.current.frequency.value = 400;
                videoRef.current.playbackRate = 0.85;
                break;
            case 'taylor':
                filterRef.current.type = 'highpass';
                filterRef.current.frequency.value = 1200;
                videoRef.current.playbackRate = 1.15;
                break;
            case 'morgan':
                filterRef.current.type = 'lowpass';
                filterRef.current.frequency.value = 150;
                videoRef.current.playbackRate = 0.75;
                break;
            default:
                filterRef.current.type = 'lowpass';
                filterRef.current.frequency.value = 20000;
                videoRef.current.playbackRate = 1.0;
        }
    };

    const updateLine = () => {
        if (activePersona && personaRefs.current[activePersona] && videoContainerRef.current && svgRef.current) {
            const personaRect = personaRefs.current[activePersona].getBoundingClientRect();
            const videoRect = videoContainerRef.current.getBoundingClientRect();
            const svgRect = svgRef.current.getBoundingClientRect();

            setLineCoords({
                x1: personaRect.left + personaRect.width / 2 - svgRect.left,
                y1: personaRect.bottom - svgRect.top,
                x2: videoRect.left + videoRect.width / 2 - svgRect.left,
                y2: videoRect.top - svgRect.top
            });
        }
    };

    useEffect(() => {
        updateLine();
        const handleResize = () => updateLine();
        window.addEventListener('resize', handleResize);
        const timer = setTimeout(updateLine, 200);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [activePersona, videoUrl]);

    const startProcessing = () => {
        if (!videoUrl || !activePersona) return;

        setupAudioFilter();
        setIsProcessing(true);
        setIsFinished(false);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsProcessing(false);
                        setIsFinished(true);
                        applyVoiceEffect(); // Apply filters when done
                        if (videoRef.current) videoRef.current.play(); // Auto play to hear effect
                    }, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
    };

    const reset = () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        setVideoUrl(null);
        setActivePersona(null);
        setIsFinished(false);
    }

    return (
        <div className="page-content animate-fade-in">
            <div className="video-editor-page">
                <h1 className="editor-title">AI Video Voice Revamper</h1>
                <p className="editor-subtitle">Upload a video and connect it to a famous persona to change its voice.</p>

                <div className="persona-bar">
                    {PERSONAS.map(p => (
                        <div
                            key={p.id}
                            ref={el => personaRefs.current[p.id] = el}
                            className={`persona-card ${activePersona === p.id ? 'active' : ''}`}
                            onClick={() => !isProcessing && setActivePersona(p.id)}
                        >
                            <div className="persona-img-container">
                                <img src={p.img} alt={p.name} />
                                <div className="persona-glow"></div>
                            </div>
                            <span className="persona-name">{p.name}</span>
                        </div>
                    ))}
                </div>

                <div className="editor-workspace">
                    <svg ref={svgRef} className="connecting-line-svg">
                        {activePersona && (
                            <path
                                d={`M ${lineCoords.x1} ${lineCoords.y1} C ${lineCoords.x1} ${(lineCoords.y1 + lineCoords.y2) / 2}, ${lineCoords.x2} ${(lineCoords.y1 + lineCoords.y2) / 2}, ${lineCoords.x2} ${lineCoords.y2}`}
                                className={`connecting-path ${isProcessing ? 'processing' : ''}`}
                            />
                        )}
                    </svg>

                    <div className={`video-main-container ${isFinished ? 'revamped' : ''}`} ref={videoContainerRef}>
                        {!videoUrl ? (
                            <div className="upload-placeholder">
                                <input type="file" accept="video/*" onChange={handleFileUpload} id="video-upload" hidden />
                                <label htmlFor="video-upload" className="upload-btn">
                                    <div className="upload-icon">🎥</div>
                                    <span>Drag or Click to Upload Video</span>
                                </label>
                            </div>
                        ) : (
                            <div className="video-preview-wrapper shadow-xl">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    controls
                                    className="main-video-player"
                                    crossOrigin="anonymous"
                                />

                                {isProcessing && (
                                    <div className="processing-overlay">
                                        <div className="ai-scanner"></div>
                                        <div className="processing-content">
                                            <div className="spinner"></div>
                                            <h3>Applying Neural Filters...</h3>
                                            <div className="progress-bar-stack">
                                                <div className="progress-bar-bg">
                                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <span className="progress-text">{Math.round(progress)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isFinished && (
                                    <div className="success-badge animate-bounce">
                                        ✨ Voice Revamped Successfully!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="editor-actions">
                        {videoUrl && activePersona && !isProcessing && !isFinished && (
                            <button className="revamp-btn premium-button pulse" onClick={startProcessing}>
                                ⚡ Revamp with {PERSONAS.find(p => p.id === activePersona)?.name}
                            </button>
                        )}
                        {isFinished && (
                            <button className="reset-btn secondary-button" onClick={reset}>
                                🔄 Start Over
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoEditor;
