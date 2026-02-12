import React, { useState } from 'react';
import './Merch.css';
import CartModal from '../components/CartModal';

const products = [
    { id: 1, name: 'Premium T-Shirt', price: 25.99, image: '👕' },
    { id: 2, name: 'Heavy Duty Mug', price: 14.99, image: '☕' },
    { id: 3, name: 'Logo Sticker Pack', price: 5.99, image: '🏷️' },
    { id: 4, name: 'Cozy Hoodie', price: 45.99, image: '🧥' },
    { id: 5, name: 'Snapback Cap', price: 19.99, image: '🧢' },
    { id: 6, name: 'Eco Bottle', price: 22.99, image: '🧉' },
];

const Merch = ({ addToCart, cart, removeFromCart, clearCart }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="merch-container">
            <div className="merch-header">
                <h1>Official Merch</h1>
                <button
                    className="view-cart-btn"
                    onClick={() => setIsCartOpen(true)}
                >
                    View Cart ({cart.length})
                </button>
            </div>

            <div className="merch-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image">{product.image}</div>
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">${product.price.toFixed(2)}</p>
                        <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(product)}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {isCartOpen && (
                <CartModal
                    cart={cart}
                    onClose={() => setIsCartOpen(false)}
                    removeFromCart={removeFromCart}
                    clearCart={clearCart}
                />
            )}
        </div>
    );
};

export default Merch;
