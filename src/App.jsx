import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import CursorParticles from './components/CursorParticles';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Portfolio from './pages/Portfolio';
import Chat from './pages/Chat';
import Weather from './pages/Weather';
import Merch from './pages/Merch';
import TryOS from './pages/TryOS';
import Comments from './pages/Comments';
import ColorPicker from './pages/ColorPicker';
import TalkingElon from './pages/TalkingElon';
import VideoEditor from './pages/VideoEditor';
import Explore from './pages/Explore';
import MeetBoss from './pages/MeetBoss';
const VaultLogin = React.lazy(() => import('./pages/VaultLogin'));
import CerebrasAgent from './components/CerebrasAgent';
import './App.css';

function App() {
  const [cart, setCart] = React.useState([]);

  const addToCart = (product) => {
    setCart(prevCart => [...prevCart, { ...product, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <div className="app-container">
        <CursorParticles />
        <Navbar cartCount={cart.length} />
        <MusicPlayer />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/merch" element={<Merch addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
            <Route path="/try-os" element={<TryOS />} />
            <Route path="/try-os/:osType" element={<TryOS />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/color-picker" element={<ColorPicker />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/talking-elon" element={<TalkingElon />} />
            <Route path="/editor" element={<VideoEditor />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/meet-boss" element={<MeetBoss />} />
            <Route path="/vault" element={<React.Suspense fallback={<div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading Neural Network Sequence...</div>}><VaultLogin /></React.Suspense>} />
          </Routes>
        </main>
        <CerebrasAgent />
      </div>
    </Router>
  );
}

export default App;
