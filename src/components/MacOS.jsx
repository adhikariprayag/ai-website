import React, { useState } from 'react';

const MacOS = () => {
    const [activeWindows, setActiveWindows] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Update clock
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const dockItems = [
        { icon: '📁', name: 'Finder' },
        { icon: '🌐', name: 'Safari' },
        { icon: '⌨️', name: 'Terminal' },
        { icon: '🖼️', name: 'Photos' },
        { icon: '⚙️', name: 'Settings' }
    ];

    const openWindow = (name) => {
        if (!activeWindows.includes(name)) {
            setActiveWindows([...activeWindows, name]);
        }
    };

    const closeWindow = (name) => {
        setActiveWindows(activeWindows.filter(win => win !== name));
    };

    return (
        <div className="os-desktop macos-desktop">
            {/* Menubar */}
            <div className="macos-menubar">
                <div className="left">
                    <span style={{ fontWeight: 800 }}></span>
                    <span style={{ fontWeight: 700 }}>Finder</span>
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Go</span>
                </div>
                <div className="right">
                    <span>🔋 100%</span>
                    <span>📶</span>
                    <span>🔍</span>
                    <span>{currentTime}</span>
                </div>
            </div>

            {/* Windows */}
            {activeWindows.map(win => (
                <div key={win} className="sim-window" style={{ top: 100 + activeWindows.indexOf(win) * 30, left: 100 + activeWindows.indexOf(win) * 30 }}>
                    <div className="sim-window-header">
                        <div className="macos-window-controls">
                            <div className="macos-dot close" onClick={() => closeWindow(win)}></div>
                            <div className="macos-dot minimize"></div>
                            <div className="macos-dot maximize"></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{win}</span>
                        <div style={{ width: '40px' }}></div>
                    </div>
                    <div className="sim-window-content">
                        {win === 'Terminal' && (
                            <div style={{ fontFamily: 'monospace', color: '#0f0' }}>
                                <p>Last login: {new Date().toDateString()} on ttys000</p>
                                <p>prayag@macbook-pro ~ % ls -la</p>
                                <p>total 0</p>
                                <p>drwxr-xr-x   3 prayag  staff    96 Feb 11 20:30 .</p>
                                <p>drwxr-xr-x  14 prayag  staff   448 Feb 11 15:00 ..</p>
                                <p>prayag@macbook-pro ~ % <span className="cursor">_</span></p>
                            </div>
                        )}
                        {win === 'Finder' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                                <div>📁 Documents</div>
                                <div>📁 Desktop</div>
                                <div>📁 Downloads</div>
                                <div>📁 Pictures</div>
                            </div>
                        )}
                        {win === 'Photos' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                <div style={{ background: '#333', height: '100px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌅 Sunset.jpg</div>
                                <div style={{ background: '#333', height: '100px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏔️ Mountains.png</div>
                            </div>
                        )}
                        {!['Terminal', 'Finder', 'Photos'].includes(win) && (
                            <p>Welcome to {win}. This is a simulated environment.</p>
                        )}
                    </div>
                </div>
            ))}

            {/* Dock */}
            <div className="macos-dock-container">
                {dockItems.map(item => (
                    <div
                        key={item.name}
                        className={`macos-dock-item ${activeWindows.includes(item.name) ? 'active' : ''}`}
                        onClick={() => openWindow(item.name)}
                        title={item.name}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MacOS;
