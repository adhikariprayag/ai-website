import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentResponse } from '../services/cerebrasAgent';
import { sendMessageToCerebras, sendMessageToCerebrasWithImages } from '../services/cerebras';
import Markdown from 'markdown-to-jsx';
import './CerebrasAgent.css';

const generateId = () => Math.random().toString(36).substr(2, 9);
const createNewSession = () => ({
    id: generateId(),
    title: 'New Chat',
    messages: [
        { role: 'assistant', content: 'Hi! I am your Cerebras AI Agent. I can help navigate the site or act as a smart conversational agent. How can I help?' }
    ],
    updatedAt: Date.now()
});

const CerebrasAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem('ai_chat_sessions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) return parsed;
            } catch (e) {
                console.error("Failed to parse sessions", e);
            }
        }
        return [createNewSession()];
  });
  
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || null);
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const [size, setSize] = useState({ width: window.innerWidth > 768 ? 800 : window.innerWidth, height: 500 });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
      localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.content.includes('glitched out')) {
            speakText(lastMsg.content);
        }
        prevMessagesLength.current = messages.length;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setInput(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          const submitBtn = document.getElementById('agent-send-btn');
          if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
          }
        }, 100);
      };
    }
    return () => {
       if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, []);

  const handleMouseDownResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.width;
    const startH = size.height;

    const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY; // Negative because bottom is anchored
        setSize({
            width: Math.max(380, startW + deltaX),
            height: Math.max(400, startH - deltaY)
        });
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'nwse-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition isn't supported in your browser.");
      }
    }
  };

  const toggleAgent = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
      const newSession = createNewSession();
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setInput('');
      setAttachments([]);
  };

  const deleteSession = (e, id) => {
      e.stopPropagation();
      setSessions(prev => {
          const updated = prev.filter(s => s.id !== id);
          if (updated.length === 0) {
              const fresh = createNewSession();
              setActiveSessionId(fresh.id);
              return [fresh];
          }
          if (id === activeSessionId) {
              setActiveSessionId(updated[0].id);
          }
          return updated;
      });
  };

  const updateActiveSession = (newMessages, newTitle = null) => {
      setSessions(prev => prev.map(session => {
          if (session.id === activeSessionId) {
              return {
                  ...session,
                  messages: newMessages,
                  title: newTitle || session.title,
                  updatedAt: Date.now()
              };
          }
          return session;
      }).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const generateTitle = async (firstMessageText) => {
      try {
          const prompt = `Return ONLY a 2 to 4 word short summary title for this message, no quotes, no extra text: "${firstMessageText}"`;
          const title = await sendMessageToCerebras(prompt);
          return title.trim().replace(/^["']|["']$/g, '');
      } catch {
          return "New Chat";
      }
  };

  const handleInputChange = (e) => {
      setInput(e.target.value);
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend(e);
      }
  };

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      files.forEach(file => {
          const reader = new FileReader();
          if (file.type.startsWith('image/')) {
              reader.onload = (event) => {
                  const base64full = event.target.result;
                  const base64Data = base64full.split(',')[1];
                  setAttachments(prev => [...prev, { 
                      name: file.name, 
                      content: base64full, 
                      base64: base64Data, 
                      mimeType: file.type,
                      isImage: true
                  }]);
              };
              reader.readAsDataURL(file);
          } else {
              reader.onload = (event) => {
                  const text = event.target.result;
                  setAttachments(prev => [...prev, { name: file.name, content: text, isImage: false }]);
              };
              reader.readAsText(file);
          }
      });
      e.target.value = null;
  };

  const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault();
              const file = items[i].getAsFile();
              const reader = new FileReader();
              reader.onload = (event) => {
                  const base64full = event.target.result;
                  const base64Data = base64full.split(',')[1];
                  setAttachments(prev => [...prev, { 
                      name: `pasted-image-${Date.now()}.png`, 
                      content: base64full,
                      base64: base64Data,
                      mimeType: file.type,
                      isImage: true
                  }]);
              };
              reader.readAsDataURL(file);
          }
      }
  };

  const removeAttachment = (indexToRemove) => {
      setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleToolCalls = async (toolCalls) => {
    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'navigate_to') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate(args.path);
        updateActiveSession([...messages, { role: 'assistant', content: `Sure, I have navigated you to ${args.path}.` }]);
      } else if (toolCall.function.name === 'play_music') {
        const args = JSON.parse(toolCall.function.arguments);
        const playerBtn = document.querySelector('.music-player-btn');
        if (playerBtn) {
          playerBtn.click();
          updateActiveSession([...messages, { role: 'assistant', content: `I've toggled the music player for you.` }]);
        } else {
          updateActiveSession([...messages, { role: 'assistant', content: `I couldn't find the music player on the screen.` }]);
        }
      } else if (toolCall.function.name === 'talk_to_elon') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/talking-elon');
        updateActiveSession([...messages, { role: 'assistant', content: `I've sent your message to Elon: "${args.text}"` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_talk_to_elon', detail: args.text }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_talk_to_elon', { detail: args.text })), 800);
      } else if (toolCall.function.name === 'explore_country') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/explore');
        updateActiveSession([...messages, { role: 'assistant', content: `I am navigating the globe to ${args.country}.` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_explore_country', detail: args.country }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_explore_country', { detail: args.country })), 1000);
      } else if (toolCall.function.name === 'contact_submit') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/contact');
        updateActiveSession([...messages, { role: 'assistant', content: `Sending Message to Contact Form...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_contact_submit', detail: args }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_contact_submit', { detail: args })), 800);
      } else if (toolCall.function.name === 'add_to_cart') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/merch');
        updateActiveSession([...messages, { role: 'assistant', content: `Adding ${args.product_name} to cart...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_add_to_cart', detail: args.product_name }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_add_to_cart', { detail: args.product_name })), 800);
      } else if (toolCall.function.name === 'post_comment') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/comments');
        updateActiveSession([...messages, { role: 'assistant', content: `Posting comment...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_post_comment', detail: args }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_post_comment', { detail: args })), 800);
      } else if (toolCall.function.name === 'pick_color') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/color-picker');
        updateActiveSession([...messages, { role: 'assistant', content: `Setting color to ${args.hex_color}...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_pick_color', detail: args.hex_color }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_pick_color', { detail: args.hex_color })), 800);
      } else if (toolCall.function.name === 'set_video_persona') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/editor');
        updateActiveSession([...messages, { role: 'assistant', content: `Setting persona to ${args.persona_id}. Make sure you upload a video!` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_set_persona', detail: args.persona_id }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_set_persona', { detail: args.persona_id })), 800);
      } else if (toolCall.function.name === 'get_weather') {
        navigate('/weather');
        updateActiveSession([...messages, { role: 'assistant', content: `Fetching weather data...` }]);
      } else if (toolCall.function.name === 'try_os') {
        navigate('/try-os');
        updateActiveSession([...messages, { role: 'assistant', content: `Booting into TryOS...` }]);
      } else if (toolCall.function.name === 'play_tictactoe') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/portfolio');
        updateActiveSession([...messages, { role: 'assistant', content: `Playing Tic Tac Toe move...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_play_tictactoe', detail: args.move }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_play_tictactoe', { detail: args.move })), 800);
      } else if (toolCall.function.name === 'calculate_math') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/portfolio');
        updateActiveSession([...messages, { role: 'assistant', content: `Calculating ${args.expression}...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_calculate_math', detail: args.expression }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_calculate_math', { detail: args.expression })), 800);
      }
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (isLoading || (!input.trim() && attachments.length === 0)) return;

    const textAttachments = attachments.filter(a => !a.isImage);
    const imageAttachments = attachments.filter(a => a.isImage);

    let finalInput = input;
    if (textAttachments.length > 0) {
        const attachmentText = textAttachments.map(att => `--- File: ${att.name} ---\n${att.content}\n--- End of ${att.name} ---`).join('\n\n');
        finalInput = `I have attached some files for context:\n${attachmentText}\n\n${input ? `My question/prompt: ${input}` : 'Please analyze the attached files.'}`;
    }

    let displayMessage = input;
    if (attachments.length > 0) {
        const fileNames = attachments.map(a => a.name).join(', ');
        displayMessage = input ? `[Attached: ${fileNames}]\n${input}` : `[Attached: ${fileNames}] Please analyze these files.`;
    }

    const userMessage = { role: 'user', content: displayMessage };
    const updatedMessages = [...messages, userMessage];

    let newTitle = activeSession.title;
    if (activeSession.messages.length === 1) {
        generateTitle(input || "Image Analysis").then(title => {
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s));
        });
    }

    updateActiveSession(updatedMessages, newTitle);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
        if (imageAttachments.length > 0) {
            // Vision Route (No Tool Execution Supported natively on this flow right now)
            const responseText = await sendMessageToCerebrasWithImages(finalInput || "Describe this image.", imageAttachments);
            updateActiveSession([...updatedMessages, { role: 'assistant', content: responseText }]);
        } else {
            // Standard Agent Route (Detects Tools)
            const history = [...updatedMessages].map(msg => ({ role: msg.role, content: msg.content }));
            const response = await getAgentResponse(history);

            if (response.error) {
                updateActiveSession([...updatedMessages, { role: 'assistant', content: `Error: ${response.error}` }]);
                setIsLoading(false);
                return;
            }

            if (response.tool_calls && response.tool_calls.length > 0) {
                await handleToolCalls(response.tool_calls);
            } else if (response.content) {
                let content = response.content;
                let pseudoToolCalls = [];

                try {
                    let formatted = content.trim();
                    if (formatted.startsWith('{') && formatted.endsWith('}')) {
                        formatted = '[' + formatted.replace(/\}\s*\{/g, '},{') + ']';
                        const parsedArr = JSON.parse(formatted);
                        parsedArr.forEach(parsed => {
                            if (parsed.name && parsed.arguments !== undefined) {
                                pseudoToolCalls.push({ function: { name: parsed.name, arguments: JSON.stringify(parsed.arguments) } });
                            }
                        });
                        if (pseudoToolCalls.length > 0) content = ''; 
                    }
                } catch(e) {}

                if (pseudoToolCalls.length > 0) {
                    try {
                        await handleToolCalls(pseudoToolCalls);
                    } catch (e) {
                        updateActiveSession([...updatedMessages, { role: 'assistant', content: "Oops, I glitched out. Please try again!" }]);
                    }
                } else if (content) {
                    updateActiveSession([...updatedMessages, { role: 'assistant', content }]);
                }
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        updateActiveSession([...updatedMessages, { role: 'assistant', content: error.message || "Sorry, I encountered an error." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={`cerebras-agent-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="agent-trigger-btn" onClick={toggleAgent}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </button>
      )}

      {isOpen && (
        <div 
            className="agent-panel glassmorphism unified-chat-layout"
            style={{ width: size.width, height: size.height }}
        >
          {/* Top-Right Drag Resizer */}
          <div className="agent-resizer" onMouseDown={handleMouseDownResize}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15L15 21M21 8L8 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
             </svg>
          </div>

          <div className="agent-header unselectable">
            <h3>Cerebras Agent Workspace</h3>
            <button className="close-btn" onClick={toggleAgent}>&times;</button>
          </div>
          
          <div className="unified-chat-body">
              {/* Sidebar */}
              {size.width > 500 && (
                  <div className="agent-chat-sidebar">
                      <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>
                      <div className="chat-history-list">
                          {sessions.map(s => (
                              <div 
                                  key={s.id} 
                                  className={`chat-history-item ${s.id === activeSessionId ? 'active' : ''}`}
                                  onClick={() => setActiveSessionId(s.id)}
                              >
                                  <div className="chat-history-content">
                                      <div className="chat-history-title">{s.title}</div>
                                      <div className="chat-history-date">{new Date(s.updatedAt).toLocaleDateString()}</div>
                                  </div>
                                  <button className="chat-delete-btn" onClick={(e) => deleteSession(e, s.id)} title="Delete Chat">🗑️</button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Main Interface */}
              <div className="agent-main-chat">
                  <div className="agent-messages">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`message-container ${msg.role}`}>
                        <div className={`message-bubble ${msg.role === 'assistant' ? 'ai-bubble' : 'user-bubble'}`}>
                            {msg.role === 'assistant' ? (
                                <Markdown className="markdown-body">
                                    {msg.content}
                                </Markdown>
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="loading-indicator">
                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="agent-input-container">
                    {attachments.length > 0 && (
                        <div className="attachments-bar">
                            {attachments.map((att, index) => (
                                <div key={index} className="attachment-badge">
                                    {att.isImage ? (
                                        <img src={att.content} alt={att.name} className="attachment-thumbnail" />
                                    ) : (
                                        <span className="attachment-name">📄 {att.name}</span>
                                    )}
                                    <button className="attachment-remove" onClick={() => removeAttachment(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="agent-input-controls row-flex">
                        <button 
                            className="attach-btn" 
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach file"
                            disabled={isLoading}
                        >
                            📎
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange} 
                            multiple 
                            accept=".txt,.md,.json,.js,.py,.html,.css,.csv,.jpg,.jpeg,.png,.webp"
                        />
                        <button 
                            type="button" 
                            onClick={toggleListening}
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            title="Voice Typing"
                        >
                            {isListening ? '🛑' : '🎤'}
                        </button>
                        <textarea
                            ref={textareaRef}
                            value={input} 
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            disabled={isLoading}
                            placeholder={isListening ? "Listening..." : "Message Cerebras... (Shift+Enter for new line)"}
                            className="agent-textarea"
                            rows={1}
                        />
                        <button 
                            id="agent-send-btn" 
                            onClick={handleSend} 
                            disabled={isLoading || (!input.trim() && attachments.length === 0 && !isListening)} 
                            className="square-send-btn"
                        >
                            ➤
                        </button>
                    </div>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CerebrasAgent;
