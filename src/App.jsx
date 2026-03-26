import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import VoiceAssistant from './components/VoiceAssistant';
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
        <VoiceAssistant />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/merch" element={<Merch addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
            <Route path="/try-os" element={<TryOS />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/color-picker" element={<ColorPicker />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/talking-elon" element={<TalkingElon />} />
            <Route path="/editor" element={<VideoEditor />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
