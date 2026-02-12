import React from 'react';
import './CartModal.css';

const CartModal = ({ cart, onClose, removeFromCart, clearCart }) => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const handleOverlayClick = (e) => {
        if (e.target.className === 'cart-overlay') {
            onClose();
        }
    };

    return (
        <div className="cart-overlay" onClick={handleOverlayClick}>
            <div className="cart-modal">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Your Cart</h2>

                <div className="cart-content">
                    {cart.length === 0 ? (
                        <div className="empty-cart-msg">
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                <div className="item-info">
                                    <span className="item-icon">{item.image}</span>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <div>${item.price.toFixed(2)}</div>
                                    </div>
                                </div>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromCart(item.cartId)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn" onClick={() => alert('Proceeding to checkout...')}>
                            Checkout
                        </button>
                        <button className="clear-cart-btn" onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
