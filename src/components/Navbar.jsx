import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        document.body.className = theme === 'light' ? 'light-mode' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="navbar">
            <div className="logo">prayag</div>
            
            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/" className="nav-btn" onClick={() => setIsMenuOpen(false)}>home</Link>
                <Link to="/contact" className="nav-btn" onClick={() => setIsMenuOpen(false)}>contact</Link>
                <Link to="/portfolio" className="nav-btn" onClick={() => setIsMenuOpen(false)}>portfolio</Link>
                <Link to="/weather" className="nav-btn" onClick={() => setIsMenuOpen(false)}>weather</Link>
                <Link to="/merch" className="nav-btn" onClick={() => setIsMenuOpen(false)}>merch {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
                <Link to="/try-os" className="nav-btn" onClick={() => setIsMenuOpen(false)}>try os</Link>
                <Link to="/comments" className="nav-btn" onClick={() => setIsMenuOpen(false)}>comments</Link>
                <Link to="/color-picker" className="nav-btn" onClick={() => setIsMenuOpen(false)}>colors</Link>
                <Link to="/talking-elon" className="nav-btn" onClick={() => setIsMenuOpen(false)}>talking elon</Link>
                <Link to="/explore" className="nav-btn" onClick={() => setIsMenuOpen(false)}>explore</Link>
                <Link to="/vault" className="nav-btn vault-link" onClick={() => setIsMenuOpen(false)}>vault</Link>

                <Link to="/meet-boss" className="nav-btn special" onClick={() => setIsMenuOpen(false)}>meet boss</Link>
                <Link to="/chat" className="nav-btn special" onClick={() => setIsMenuOpen(false)}>chat with ai</Link>
                <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <button 
                className={`burger-btn ${isMenuOpen ? 'open' : ''}`} 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    );
};

export default Navbar;
