import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
    { path: '/', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { path: '/contact', label: 'Contact', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
    { path: '/portfolio', label: 'Portfolio', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { path: '/weather', label: 'Weather', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> },
    { path: '/merch', label: 'Merch', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { path: '/try-os', label: 'Try OS', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg> },
    { path: '/comments', label: 'Comments', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { path: '/color-picker', label: 'Colors', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> },
    { path: '/talking-elon', label: 'Elon', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> },
    { path: '/explore', label: 'Explore', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> },
    { path: '/vault', label: 'Vault', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { path: '/meet-boss', label: 'Boss', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> },
];

const Navbar = ({ cartCount }) => {
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        document.body.className = theme === 'light' ? 'light-mode' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            {/* Top Minimal Bar */}
            <nav className="navbar minimal">
                <Link to="/" className="logo">prayag</Link>
                
                {/* Mobile Nav Links Layer (Hidden natively on Desktop via CSS) */}
                <div className={`nav-links mobile-only ${isMenuOpen ? 'open' : ''}`}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`nav-btn ${item.path === '/vault' ? 'vault-link' : ''} ${item.path === '/meet-boss' ? 'special' : ''} ${isActive ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="icon-wrapper">{item.icon}</span>
                                {item.label} {item.path === '/merch' && cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        )
                    })}
                </div>

                <div className="nav-controls">
                    {/* Mobile Hamburger Button */}
                    <button 
                        className={`burger-btn mobile-only ${isMenuOpen ? 'open' : ''}`} 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>

            {/* Bottom-Left Theme Toggle */}
            <div className="bottom-left-controls desktop-only">
                <button onClick={toggleTheme} className="theme-toggle-fixed" aria-label="Toggle theme">
                    <div className="icon-wrapper">
                        {theme === 'dark' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                        )}
                    </div>
                </button>
            </div>

            {/* Desktop Floating Right Dock */}
            <div className="desktop-right-dock">
                <div className="dock-container">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`dock-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="dock-icon">
                                    {item.icon}
                                    {item.path === '/merch' && cartCount > 0 && <div className="dock-badge">{cartCount}</div>}
                                </div>
                                <span className="dock-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Navbar;
