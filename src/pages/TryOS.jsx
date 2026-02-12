import React, { useState } from 'react';
import MacOS from '../components/MacOS';
import WindowsOS from '../components/WindowsOS';
import './TryOS.css';

const TryOS = () => {
    const [selectedOS, setSelectedOS] = useState(null); // 'macos' or 'windows'

    const handleOSSelect = (os) => {
        setSelectedOS(os);
    };

    const resetOS = () => {
        setSelectedOS(null);
    };

    return (
        <div className="try-os-container">
            {/* Switch OS Button (Float) */}
            {selectedOS && (
                <button className="switch-os-btn" onClick={resetOS}>
                    Switch OS
                </button>
            )}

            {/* Selection Overlay */}
            <div className={`os-selector-overlay ${selectedOS ? 'hidden' : ''}`}>
                <h1 className="os-selector-title">Select an Experience</h1>
                <div className="os-cards">
                    <div className="os-card" onClick={() => handleOSSelect('macos')}>
                        <div className="os-icon"></div>
                        <div className="os-name">macOS Sequoia</div>
                        <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>Experience the elegance of Apple's latest desktop OS.</p>
                    </div>
                    <div className="os-card" onClick={() => handleOSSelect('windows')}>
                        <div className="os-icon">🪟</div>
                        <div className="os-name">Windows 11</div>
                        <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>Experience the productivity of Microsoft's latest OS.</p>
                    </div>
                </div>
            </div>

            {/* Simulated Desktop */}
            {selectedOS === 'macos' && <MacOS />}
            {selectedOS === 'windows' && <WindowsOS />}
        </div>
    );
};

export default TryOS;
