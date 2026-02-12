import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');

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
            <div className="nav-links">
                <Link to="/" className="nav-btn">home</Link>
                <Link to="/contact" className="nav-btn">contact</Link>
                <Link to="/portfolio" className="nav-btn">portfolio</Link>
                <Link to="/weather" className="nav-btn">weather</Link>
                <Link to="/merch" className="nav-btn">merch {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
                <Link to="/try-os" className="nav-btn">try os</Link>
                <Link to="/comments" className="nav-btn">comments</Link>

                <Link to="/chat" className="nav-btn special">chat with ai</Link>
                <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
