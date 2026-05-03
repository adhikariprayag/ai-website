import React, { useState, useEffect } from 'react';
import './News.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const PRIMARY_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml";
const FALLBACK_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml";

const News = () => {
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summaryHtml, setSummaryHtml] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchNews = async () => {
        try {
            let response = await fetch(PRIMARY_URL);
            let data = await response.json();
            
            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                throw new Error("Primary feed failed");
            }
            
            setArticles(data.items);
            setError(false);
        } catch (err) {
            console.warn("Primary fetch failed, trying fallback...", err);
            try {
                let fallbackResponse = await fetch(FALLBACK_URL);
                let fallbackData = await fallbackResponse.json();
                if (fallbackData.status === 'ok' && fallbackData.items) {
                    setArticles(fallbackData.items);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch (fallbackError) {
                console.error("Both feeds failed.", fallbackError);
                setError(true);
            }
        }
    };

    const generateSummary = async () => {
        setIsModalOpen(true);
        setIsSummarizing(true);
        setSummaryHtml('');
        
        const topArticles = articles.slice(0, 15);
        if (topArticles.length === 0) {
            setSummaryHtml('<p>No dispatches to summarize.</p>');
            setIsSummarizing(false);
            return;
        }

        const articlesText = topArticles.map(a => `Title: ${a.title}\nSummary: ${a.description}`).join('\n\n');

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: "You are a witty, fast-talking 1920s newspaper editor. Summarize the provided headlines and news dispatches in exactly 5 punchy sentences. End with a witty or wry observation about the state of the world today." },
                        { role: "user", content: `Here are today's top dispatches:\n\n${articlesText}` }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            
            if (data.choices && data.choices.length > 0) {
                const summary = data.choices[0].message.content;
                const formattedHtml = summary.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
                setSummaryHtml(formattedHtml);
            } else {
                throw new Error("Invalid response from API");
            }
        } catch (error) {
            console.error("Groq API Error:", error);
            setSummaryHtml('<p><em>The Chief Editor is currently indisposed. Please check back after his coffee break.</em></p>');
        }
        setIsSummarizing(false);
    };

    const stripHtml = (html) => {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const tickerText = articles.slice(0, 10).map(item => item.title).join("  •••  ");

    const lead = articles[0];
    const secondary = articles.slice(1, 3);
    const remaining = articles.slice(3, 9);

    return (
        <section id="ai-news">
            <div className="newspaper-container">
                <div className="masthead">
                    <h1>THE DAILY WIRE</h1>
                </div>
                
                <div className="date-line">
                    <span>Edition: Global</span>
                    <span>{dateStr}</span>
                    <span>Two Pence</span>
                </div>

                <div className="ticker-container">
                    <div className="ticker-text">
                        LATEST DISPATCHES:  {tickerText || 'AWAITING TELEGRAMS...'}  •••  LATEST DISPATCHES:  {tickerText}
                    </div>
                </div>

                <div className="news-grid">
                    {error ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <h2>TELEGRAPH LINES DOWN. UNABLE TO RECEIVE DISPATCHES.</h2>
                        </div>
                    ) : articles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <h2>Awaiting transmission...</h2>
                        </div>
                    ) : (
                        <>
                            {/* Lead Story */}
                            <div className="lead-story">
                                <div style={{ textAlign: 'center' }}>
                                    <span className="breaking-badge">Breaking News</span>
                                </div>
                                <h2 className="headline">
                                    <a href={lead.link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{lead.title}</a>
                                </h2>
                                <div className="lead-story-content">
                                    {(lead.thumbnail || lead.enclosure?.link) && (
                                        <img src={lead.thumbnail || lead.enclosure?.link} className="lead-story-img" alt="Lead story" />
                                    )}
                                    <div className="lead-story-text article-content">
                                        <p><strong>(Special Dispatch) — </strong> {stripHtml(lead.description)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Stories */}
                            <div className="secondary-stories">
                                {secondary.map((item, idx) => (
                                    <div className="story" key={idx}>
                                        <h3 className="headline">
                                            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</a>
                                        </h3>
                                        {(item.thumbnail || item.enclosure?.link) && (
                                            <img src={item.thumbnail || item.enclosure?.link} className="story-img" alt="Story" />
                                        )}
                                        <div className="article-content">
                                            <p>{stripHtml(item.description)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Remaining Stories */}
                            <div className="remaining-stories">
                                {remaining.map((item, idx) => (
                                    <div className="story" key={idx}>
                                        <h4 className="headline">
                                            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</a>
                                        </h4>
                                        <div className="article-content">
                                            <p>{stripHtml(item.description).substring(0, 150)}...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* AI Summary Button */}
            <div className="ai-fab" onClick={generateSummary} title="Generate AI Briefing">
                <div className="fab-particles">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="fab-particle" style={{ '--i': i }}></div>
                    ))}
                </div>
                <svg className="ai-sparkle" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                        <linearGradient id="aiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B6B" />
                            <stop offset="100%" stopColor="#FF8E53" />
                        </linearGradient>
                    </defs>
                    <path stroke="url(#aiGlow)" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path stroke="url(#aiGlow)" d="M5 3v4"/>
                    <path stroke="url(#aiGlow)" d="M19 17v4"/>
                    <path stroke="url(#aiGlow)" d="M3 5h4"/>
                    <path stroke="url(#aiGlow)" d="M17 19h4"/>
                </svg>
                <span className="ai-fab-label">AI Briefing</span>
            </div>

            {/* Modal */}
            <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={(e) => { if(e.target.classList.contains('modal-overlay')) setIsModalOpen(false); }}>
                <div className="modal-content">
                    <div className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</div>
                    <h2 className="modal-header">Editor's Briefing</h2>
                    <div className="modal-body">
                        {isSummarizing ? (
                            <div className="loading-container">
                                <div className="news-spinner"></div>
                                <div>Drafting Editor's Briefing...</div>
                            </div>
                        ) : (
                            <div className="summary-text" dangerouslySetInnerHTML={{ __html: summaryHtml }}></div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default News;
