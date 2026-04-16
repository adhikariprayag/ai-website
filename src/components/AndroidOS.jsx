import React, { useState, useEffect, useRef } from 'react';
import './AndroidOS.css';

const AndroidOS = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const [activeApp, setActiveApp] = useState(null); // 'Todo', 'Clock'
    
    // Manual Input State
    const [newTaskText, setNewTaskText] = useState("");
    const [newAlarmTime, setNewAlarmTime] = useState("");
    const [newAlarmLabel, setNewAlarmLabel] = useState("");
    
    // Apps State
    const [todos, setTodos] = useState([
        { id: 1, text: 'Welcome to Android', completed: false }
    ]);
    const [alarms, setAlarms] = useState([
        { id: 1, time: '08:00', label: 'Morning Alarm', active: true }
    ]);

    // Assistant State
    const [showAssistant, setShowAssistant] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState("Hi, how can I help you?");
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        setTodos(prev => [...prev, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
        setNewTaskText("");
    };

    const handleAddAlarm = (e) => {
        e.preventDefault();
        if (!newAlarmTime) return;
        setAlarms(prev => [...prev, { id: Date.now(), time: newAlarmTime, label: newAlarmLabel || 'Alarm', active: true }]);
        setNewAlarmTime("");
        setNewAlarmLabel("");
    };

    const processVoiceCommand = async (transcript) => {
        setAssistantResponse(`Thinking about: "${transcript}"...`);
        const lower = transcript.toLowerCase();
        
        // Simulate minor processing delay for realism
        setTimeout(() => {
            let action = "UNKNOWN";
            let payload = null;
            let reply = "I'm sorry, I didn't quite catch that.";

            // Intent: SET ALARM
            if (lower.includes('alarm') || lower.includes('wake me')) {
                action = 'SET_ALARM';
                let timeStr = '12:00';
                // Regex to find things like "5pm", "5 pm", "5:30 am", "17:00"
                const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
                if (timeMatch) {
                    let hours = parseInt(timeMatch[1]);
                    const mins = timeMatch[2] || '00';
                    const ampm = timeMatch[3];
                    if (ampm === 'pm' && hours < 12) hours += 12;
                    if (ampm === 'am' && hours === 12) hours = 0;
                    timeStr = `${hours.toString().padStart(2, '0')}:${mins}`;
                }
                payload = { time: timeStr, label: 'Voice Alarm' };
                let displayTime = timeMatch ? (timeMatch[0].trim()) : timeStr;
                reply = `Got it, I've set an alarm for ${displayTime}.`;
            } 
            // Intent: ADD TODO
            else if (lower.includes('to do') || lower.includes('todo') || lower.includes('remind me') || lower.includes('list')) {
                action = 'ADD_TODO';
                let tasksStr = lower;
                
                // Pattern 1: "add [task] to to do list"
                const addToListMatch = lower.match(/add (.*?) to (?:the |my )?(?:to do |todo )?list/);
                if (addToListMatch) {
                    tasksStr = addToListMatch[1];
                } 
                // Pattern 2: "make a to do list to: [task]"
                else if (lower.includes('to:')) {
                    tasksStr = lower.split('to:')[1];
                }
                // Pattern 3: "make a to do list to [task]"
                else if (lower.match(/make a (?:to do|todo) list(?: to|) (.*)/)) {
                    tasksStr = lower.match(/make a (?:to do|todo) list(?: to|) (.*)/)[1];
                }
                // Pattern 4: "remind me to [task]"
                else if (lower.match(/remind me to (.*)/)) {
                    tasksStr = lower.match(/remind me to (.*)/)[1];
                }
                // Fallback: brute force strip common phrases
                else {
                    tasksStr = lower
                        .replace('make a to do list', '')
                        .replace('make a todo list', '')
                        .replace('to do list', '')
                        .replace('todo list', '')
                        .replace('add', '');
                }

                // Clean edge cases
                tasksStr = tasksStr.replace(/^: /, '').replace(/^to /, '').trim();

                let tasks = tasksStr.split(/(?:,| and )/).map(t => t.trim()).filter(t => t.length > 0);
                if (tasks.length === 0) tasks = ["New Voice Task"];
                
                payload = tasks;
                
                const taskSpoken = tasks.length > 1 ? `${tasks.length} items` : tasks[0];
                reply = `Ok, I've added ${taskSpoken} to your tasks list.`;
            } else {
                 reply = "I didn't recognize a command. Try asking me to set an alarm or add to your to-do list.";
            }

            setAssistantResponse(reply);

            // Execute the action
            if (action === 'ADD_TODO') {
                setActiveApp('Todo');
                const newTodos = (Array.isArray(payload) ? payload : [payload]).map(item => ({
                    id: Date.now() + Math.random(),
                    text: item,
                    completed: false
                }));
                setTodos(prev => [...prev, ...newTodos]);
            } else if (action === 'SET_ALARM') {
                setActiveApp('Clock');
                setAlarms(prev => [
                    ...prev, 
                    { id: Date.now(), time: payload.time || '12:00', label: payload.label || 'Alarm', active: true }
                ]);
            }

            // Text to speech
            const utterance = new SpeechSynthesisUtterance(reply);
            window.speechSynthesis.speak(utterance);
            
            setTimeout(() => {
                setShowAssistant(false);
            }, 4000);
            
        }, 800);
    };

    const toggleAssistant = () => {
        if (!showAssistant) {
            setShowAssistant(true);
            setAssistantResponse("Listening...");
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                
                recognition.onstart = () => setIsListening(true);
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    processVoiceCommand(transcript);
                };
                
                recognition.onerror = (event) => {
                    setIsListening(false);
                    setAssistantResponse("Sorry, I didn't catch that.");
                };
                
                recognition.onend = () => {
                    setIsListening(false);
                };
                
                recognition.start();
            } else {
                setAssistantResponse("Voice recognition not supported in this browser.");
            }
        } else {
            setShowAssistant(false);
        }
    };

    const closeApp = () => setActiveApp(null);

    return (
        <div className="android-desktop">
            <div className="android-phone-frame">
                
                {/* Status Bar */}
                <div className="android-status-bar">
                    <span>{currentTime}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <span>📶</span>
                        <span>🔋</span>
                    </div>
                </div>
                
                {/* Camera Cutout */}
                <div className="android-camera-cutout"></div>

                <div className="android-screen">
                    
                    {/* Home Screen */}
                    <div className="android-home-content">
                        <div className="android-time-widget">
                            <h1>{currentTime.split(' ')[0]}</h1>
                            <p>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                        
                        <div className="android-apps-grid">
                            <div className="android-app-icon-container" onClick={() => setActiveApp('Todo')}>
                                <div className="android-app-icon" style={{ background: '#4f46e5' }}>✓</div>
                                <span className="android-app-label">Tasks</span>
                            </div>
                            <div className="android-app-icon-container" onClick={() => setActiveApp('Clock')}>
                                <div className="android-app-icon" style={{ background: '#f59e0b' }}>⏰</div>
                                <span className="android-app-label">Clock</span>
                            </div>
                            <div className="android-app-icon-container" onClick={toggleAssistant}>
                                <div className="android-app-icon" style={{ background: 'linear-gradient(45deg, #3b82f6, #ec4899)' }}>✨</div>
                                <span className="android-app-label">Assistant</span>
                            </div>
                        </div>
                    </div>

                    {/* Todo App View */}
                    {activeApp === 'Todo' && (
                        <div className="android-app-view">
                            <div className="android-app-header">
                                <button className="android-back-btn" onClick={closeApp}>←</button>
                                <h2 className="android-app-title">To-Do List</h2>
                            </div>
                            <div className="android-app-body">
                                {todos.map(todo => (
                                    <div key={todo.id} className="todo-item">
                                        <div 
                                            className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
                                            onClick={() => toggleTodo(todo.id)}
                                        >✓</div>
                                        <div className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                                            {todo.text}
                                        </div>
                                    </div>
                                ))}
                                <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <input 
                                        type="text" 
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        placeholder="Add new task..." 
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1e1e1e', color: 'white', outline: 'none' }}
                                    />
                                    <button type="submit" style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Add</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Clock App View */}
                    {activeApp === 'Clock' && (
                        <div className="android-app-view">
                            <div className="android-app-header">
                                <button className="android-back-btn" onClick={closeApp}>←</button>
                                <h2 className="android-app-title">Alarms</h2>
                            </div>
                            <div className="android-app-body">
                                {alarms.map(alarm => (
                                    <div key={alarm.id} className="alarm-item">
                                        <div>
                                            <div className="alarm-time">{alarm.time}</div>
                                            <div className="alarm-label">{alarm.label}</div>
                                        </div>
                                        <div className="alarm-toggle"></div>
                                    </div>
                                ))}
                                <form onSubmit={handleAddAlarm} style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
                                    <input 
                                        type="time" 
                                        value={newAlarmTime}
                                        onChange={(e) => setNewAlarmTime(e.target.value)}
                                        required
                                        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#1e1e1e', color: 'white', outline: 'none' }}
                                    />
                                    <input 
                                        type="text" 
                                        value={newAlarmLabel}
                                        onChange={(e) => setNewAlarmLabel(e.target.value)}
                                        placeholder="Label" 
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1e1e1e', color: 'white', outline: 'none' }}
                                    />
                                    <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer' }}>+</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Assistant Overlay */}
                    {showAssistant && (
                        <div className="android-assistant-overlay">
                            <div className="assistant-response">{assistantResponse}</div>
                            <button 
                                className={`assistant-mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={!isListening ? toggleAssistant : undefined}
                            >
                                🎤
                            </button>
                            <div style={{ marginTop: '15px', color: '#9ca3af', fontSize: '12px' }}>
                                Powered by Local Neural Parser
                            </div>
                        </div>
                    )}

                    {/* Home Pill */}
                    <div className="android-nav-bar" onClick={() => { setActiveApp(null); setShowAssistant(false); }}>
                        <div className="android-home-pill"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AndroidOS;
