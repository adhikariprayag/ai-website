import React, { useEffect, useState } from 'react';
import './LanguageSelector.css';

const LanguageSelector = () => {
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        // Prevent adding multiple scripts if component remounts
        if (!document.querySelector('#google-translate-script')) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,es,ne,zh-CN',
                    autoDisplay: false,
                }, 'google_translate_element');
            };

            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            addScript.async = true;
            document.body.appendChild(addScript);
        }
    }, []);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setCurrentLang(lang);
        
        // Google Translate dropdown logic
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang === 'en' ? 'en' : lang;
            select.dispatchEvent(new Event('change'));
        }
    };

    return (
        <div className="language-selector-container">
            <div id="google_translate_element"></div>
            <div className="custom-select-wrapper">
                <svg className="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <select 
                    className="custom-lang-select" 
                    value={currentLang} 
                    onChange={handleLanguageChange}
                >
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                    <option value="zh-CN">Chinese</option>
                    <option value="es">Spanish</option>
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
