import React, { useState } from 'react';

const WindowsOS = () => {
    const [activeWindows, setActiveWindows] = useState([]);
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Update clock
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const taskbarIcons = [
        { icon: '📁', name: 'File Explorer' },
        { icon: '🌐', name: 'Edge' },
        { icon: '📝', name: 'Notepad' },
        { icon: '🛒', name: 'Store' },
        { icon: '🖼️', name: 'Photos' }
    ];

    const openWindow = (name) => {
        if (!activeWindows.includes(name)) {
            setActiveWindows([...activeWindows, name]);
        }
        setIsStartOpen(false);
    };

    const closeWindow = (name) => {
        setActiveWindows(activeWindows.filter(win => win !== name));
    };

    return (
        <div className="os-desktop windows-desktop">
            {/* Windows */}
            {activeWindows.map(win => (
                <div key={win} className="sim-window" style={{
                    top: 80 + activeWindows.indexOf(win) * 30,
                    left: 120 + activeWindows.indexOf(win) * 30,
                    borderRadius: '8px',
                    background: 'rgba(32, 32, 32, 0.95)'
                }}>
                    <div className="sim-window-header" style={{ height: '40px', background: 'rgba(40, 40, 40, 0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>{taskbarIcons.find(i => i.name === win)?.icon || '📄'}</span>
                            <span style={{ fontSize: '13px' }}>{win}</span>
                        </div>
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ padding: '0 15px', display: 'flex', alignItems: 'center' }}>─</div>
                            <div style={{ padding: '0 15px', display: 'flex', alignItems: 'center' }}>🗠</div>
                            <div
                                style={{ padding: '0 15px', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                                className="win-close-hover"
                                onClick={() => closeWindow(win)}
                            >✕</div>
                        </div>
                    </div>
                    <div className="sim-window-content">
                        {win === 'Notepad' && (
                            <textarea
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'sans-serif'
                                }}
                                placeholder="Start typing..."
                                defaultValue="Welcome to Windows 11 Simulation!&#13;&#10;&#13;&#10;Try out the interface."
                            />
                        )}
                        {win === 'File Explorer' && (
                            <div style={{ display: 'flex', height: '100%' }}>
                                <div style={{ width: '150px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '10px' }}>
                                    <p>⭐ Quick Access</p>
                                    <p>☁️ OneDrive</p>
                                    <p>💻 This PC</p>
                                </div>
                                <div style={{ flex: 1, paddingLeft: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <div>📁 Downloads</div>
                                        <div>📁 Documents</div>
                                        <div>📁 Music</div>
                                        <div>📁 Videos</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!['Notepad', 'File Explorer'].includes(win) && (
                            <p>This is {win} app in Windows 11.</p>
                        )}
                    </div>
                </div>
            ))}

            {/* Start Menu */}
            <div className={`windows-start-menu ${isStartOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0 }}>Pinned</h4>
                    <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>All apps {'>'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', textAlign: 'center' }}>
                    {taskbarIcons.map(item => (
                        <div key={item.name} onClick={() => openWindow(item.name)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '28px', marginBottom: '5px' }}>{item.icon}</div>
                            <div style={{ fontSize: '11px' }}>{item.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Taskbar */}
            <div className="windows-taskbar">
                <div className="windows-taskbar-left">
                    <span>🌤️ 22°C</span>
                </div>

                <div className="windows-taskbar-center">
                    <div
                        className="windows-taskbar-icon"
                        style={{ color: '#00a4ef' }}
                        onClick={() => setIsStartOpen(!isStartOpen)}
                    >🪟</div>
                    {taskbarIcons.map(item => (
                        <div
                            key={item.name}
                            className="windows-taskbar-icon"
                            onClick={() => openWindow(item.name)}
                            style={{ borderBottom: activeWindows.includes(item.name) ? '2px solid #00a4ef' : 'none' }}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>

                <div className="windows-taskbar-right" style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '12px' }}>
                    <span>📶</span>
                    <span>🔊</span>
                    <div style={{ textAlign: 'right' }}>
                        <div>{currentTime}</div>
                        <div>{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WindowsOS;
