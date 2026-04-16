import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MacOS from '../components/MacOS';
import WindowsOS from '../components/WindowsOS';
import AndroidOS from '../components/AndroidOS';
import './TryOS.css';

const TryOS = () => {
    const { osType } = useParams();
    const navigate = useNavigate();
    const [selectedOS, setSelectedOS] = useState(osType || null);

    useEffect(() => {
        if (osType && ['macos', 'windows', 'android'].includes(osType)) {
            setSelectedOS(osType);
        } else {
            setSelectedOS(null);
        }
    }, [osType]);

    const handleOSSelect = (os) => {
        navigate(`/try-os/${os}`);
    };

    const resetOS = () => {
        navigate('/try-os');
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
                    <div className="os-card" onClick={() => handleOSSelect('android')}>
                        <div className="os-icon">📱</div>
                        <div className="os-name">Android 15</div>
                        <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>Experience a voice agentic OS on your simulated phone.</p>
                    </div>
                </div>
            </div>

            {/* Simulated Desktop */}
            {selectedOS === 'macos' && <MacOS />}
            {selectedOS === 'windows' && <WindowsOS />}
            {selectedOS === 'android' && <AndroidOS />}
        </div>
    );
};

export default TryOS;
