import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Portfolio from './pages/Portfolio';
import Chat from './pages/Chat';
import Weather from './pages/Weather';
import Merch from './pages/Merch';
import TryOS from './pages/TryOS';
import Comments from './pages/Comments';
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

  console.log("App component rendering...");
  return (
    <Router>
      <div className="app-container">
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
            <Route path="/comments" element={<Comments />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
