import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentResponse } from '../services/cerebrasAgent';
import './CerebrasAgent.css';

const CerebrasAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your Cerebras AI Agent. I can help navigate the site. Try "Go to Portfolio".' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a friendly voice if possible
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.05; // Slightly faster to feel like a snappy AI
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
    scrollToBottom();
  }, [messages, isOpen]);

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
        // Automatically submit when the user stops speaking
        setTimeout(() => {
          const submitBtn = document.getElementById('agent-send-btn');
          if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
          }
        }, 100);
      };
    }
    
    return () => {
       if (recognitionRef.current && isListening) {
         recognitionRef.current.stop();
       }
    };
  }, []);

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

  const handleToolCalls = async (toolCalls) => {
    // We execute tools directly on the frontend
    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'navigate_to') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate(args.path);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sure, I have navigated you to ${args.path}.`
        }]);
      } else if (toolCall.function.name === 'play_music') {
        const args = JSON.parse(toolCall.function.arguments);
        const playerBtn = document.querySelector('.music-player-btn');
        if (playerBtn) {
          playerBtn.click();
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I've toggled the music player for you.`
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I couldn't find the music player on the screen.`
          }]);
        }
      } else if (toolCall.function.name === 'talk_to_elon') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/talking-elon');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've sent your message to Elon: "${args.text}"`
        }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_talk_to_elon', detail: args.text }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_talk_to_elon', { detail: args.text }));
        }, 800); // Wait for navigation and render
      } else if (toolCall.function.name === 'explore_country') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/explore');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I am navigating the globe to ${args.country}.`
        }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_explore_country', detail: args.country }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_explore_country', { detail: args.country }));
        }, 1000); // Wait for GeoJson to load if not already
      } else if (toolCall.function.name === 'contact_submit') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/contact');
        setMessages(prev => [...prev, { role: 'assistant', content: `Sending Message to Contact Form...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_contact_submit', detail: args }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_contact_submit', { detail: args })), 800);
      } else if (toolCall.function.name === 'add_to_cart') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/merch');
        setMessages(prev => [...prev, { role: 'assistant', content: `Adding ${args.product_name} to cart...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_add_to_cart', detail: args.product_name }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_add_to_cart', { detail: args.product_name })), 800);
      } else if (toolCall.function.name === 'post_comment') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/comments');
        setMessages(prev => [...prev, { role: 'assistant', content: `Posting comment...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_post_comment', detail: args }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_post_comment', { detail: args })), 800);
      } else if (toolCall.function.name === 'pick_color') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/color-picker');
        setMessages(prev => [...prev, { role: 'assistant', content: `Setting color to ${args.hex_color}...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_pick_color', detail: args.hex_color }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_pick_color', { detail: args.hex_color })), 800);
      } else if (toolCall.function.name === 'set_video_persona') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/editor');
        setMessages(prev => [...prev, { role: 'assistant', content: `Setting persona to ${args.persona_id}. Make sure you upload a video!` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_set_persona', detail: args.persona_id }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_set_persona', { detail: args.persona_id })), 800);
      } else if (toolCall.function.name === 'get_weather') {
        navigate('/weather');
        setMessages(prev => [...prev, { role: 'assistant', content: `Fetching weather data...` }]);
      } else if (toolCall.function.name === 'try_os') {
        navigate('/try-os');
        setMessages(prev => [...prev, { role: 'assistant', content: `Booting into TryOS...` }]);
      } else if (toolCall.function.name === 'play_tictactoe') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/portfolio');
        setMessages(prev => [...prev, { role: 'assistant', content: `Playing Tic Tac Toe move...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_play_tictactoe', detail: args.move }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_play_tictactoe', { detail: args.move })), 800);
      } else if (toolCall.function.name === 'calculate_math') {
        const args = JSON.parse(toolCall.function.arguments);
        navigate('/portfolio');
        setMessages(prev => [...prev, { role: 'assistant', content: `Calculating ${args.expression}...` }]);
        sessionStorage.setItem('ai_action', JSON.stringify({ type: 'ai_calculate_math', detail: args.expression }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('ai_calculate_math', { detail: args.expression })), 800);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create chat history suitable for Cerebras API
      // We filter out any 'system' messages or custom ones, keeping standard role objects
      const history = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await getAgentResponse(history);

      if (response.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${response.error}` }]);
        setIsLoading(false);
        return;
      }

      if (response.tool_calls && response.tool_calls.length > 0) {
        // AI decided to execute a tool natively
        await handleToolCalls(response.tool_calls);
      } else if (response.content) {
        let content = response.content;
        let pseudoToolCalls = [];

        try {
            // Find anything resembling {"name": "...", "arguments": {...}}
            let formatted = content.trim();
            if (formatted.startsWith('{') && formatted.endsWith('}')) {
                // Wrap multiple objects in an array if needed
                formatted = '[' + formatted.replace(/\}\s*\{/g, '},{') + ']';
                const parsedArr = JSON.parse(formatted);
                parsedArr.forEach(parsed => {
                    if (parsed.name && parsed.arguments !== undefined) {
                        pseudoToolCalls.push({
                            function: { name: parsed.name, arguments: JSON.stringify(parsed.arguments) }
                        });
                    }
                });
                if (pseudoToolCalls.length > 0) content = ''; 
            }
        } catch(e) {}

        if (pseudoToolCalls.length === 0 && content.includes('{') && content.includes('}')) {
            // Very aggressive regex fallback
            const backupRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{.*?\})\s*\}/g;
            let match;
            while ((match = backupRegex.exec(content)) !== null) {
                pseudoToolCalls.push({
                    function: { name: match[1], arguments: match[2] }
                });
                content = content.replace(match[0], '').trim();
            }
        }
        
        if (pseudoToolCalls.length > 0) {
          try {
             await handleToolCalls(pseudoToolCalls);
          } catch (e) {
             setMessages(prev => [...prev, { role: 'assistant', content: "Oops, I glitched out. Please try again!" }]);
          }
        } else if (content) {
          if (content.includes('{"name":') || content.includes('"function"')) {
             setMessages(prev => [...prev, { role: 'assistant', content: "Oops, I glitched out. Could you try asking me again?" }]);
          } else {
             setMessages(prev => [...prev, { role: 'assistant', content }]);
          }
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
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
        <div className="agent-panel glassmorphism">
          <div className="agent-header">
            <h3>Cerebras Agent</h3>
            <button className="close-btn" onClick={toggleAgent}>&times;</button>
          </div>
          
          <div className="agent-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="agent-input-form" onSubmit={handleSend}>
            <button 
              type="button" 
              onClick={toggleListening}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title="Voice Typing"
            >
              {isListening ? (
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={isListening ? "Listening..." : "Ask agent to do something..."} 
            />
            <button id="agent-send-btn" type="submit" disabled={isLoading || (!input.trim() && !isListening)} className="send-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CerebrasAgent;
