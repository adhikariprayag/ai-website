import React, { useState } from 'react';
import './ColorPicker.css';

const ColorPicker = () => {
    const [color, setColor] = useState('#646cff');

    React.useEffect(() => {
        const handleAiColor = (e) => {
            setColor(e.detail);
        };
        window.addEventListener('ai_pick_color', handleAiColor);
        return () => window.removeEventListener('ai_pick_color', handleAiColor);
    }, []);

    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const hexToHsl = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: add a temporary "Copied!" tooltip logic here
    };

    return (
        <div className="color-picker-container animate-fade-in">
            <h1>Color Picker</h1>
            <p>Select a color and copy its values in different formats.</p>

            <div className="picker-card">
                <div className="picker-section">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="color-input"
                    />
                    <div className="color-preview" style={{ backgroundColor: color }}></div>
                </div>

                <div className="values-section">
                    <div className="value-item" onClick={() => copyToClipboard(color)}>
                        <span className="label">HEX</span>
                        <span className="value">{color.toUpperCase()}</span>
                        <span className="copy-icon">📋</span>
                    </div>
                    <div className="value-item" onClick={() => copyToClipboard(hexToRgb(color))}>
                        <span className="label">RGB</span>
                        <span className="value">{hexToRgb(color)}</span>
                        <span className="copy-icon">📋</span>
                    </div>
                    <div className="value-item" onClick={() => copyToClipboard(hexToHsl(color))}>
                        <span className="label">HSL</span>
                        <span className="value">{hexToHsl(color)}</span>
                        <span className="copy-icon">📋</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
