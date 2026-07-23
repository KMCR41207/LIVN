import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import './AccountPages.css';

const YourCart = ({ user }) => {
  const { cartItems, removeFromCart, updateQty, totalPrice, isLoading } = useCart();
  const [localCart, setLocalCart] = useState(cartItems);

  useEffect(() => {
    setLocalCart(cartItems);
  }, [cartItems]);

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) {
      await removeFromCart(item.product.id, item.size);
    } else {
      await updateQty(item.product.id, item.size, newQty);
    }
  };

  const handleRemove = async (item) => {
    await removeFromCart(item.product.id, item.size);
  };

  if (isLoading) return <Loader />;

  if (localCart.length === 0) {
    return (
      <div className="account-page">
        <h2 className="account-section-title">Your Cart</h2>
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h3>Cart is Empty</h3>
          <p>Add items to your cart to see them here. Your cart is saved to your account.</p>
          <Link to="/collections" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = localCart.reduce(
    (sum, item) => sum + (item.product.offer_price || item.product.price) * item.qty,
    0
  );
  const tax = subtotal * 0.18; // 18% GST (adjust as needed)
  const total = subtotal + tax;

  return (
    <div className="account-page">
      <h2 className="account-section-title">Your Cart ({localCart.length} items)</h2>

      <div className="cart-container">
        <div className="cart-items">
          {localCart.map((item) => (
            <div key={`${item.product.id}-${item.size}`} className="cart-item">
              <div className="cart-item-image">
                {item.product.image && (
                  <img src={item.product.image} alt={item.product.name} />
                )}
              </div>

              <div className="cart-item-details">
                <h4>{item.product.name}</h4>
                <p className="cart-item-size">Size: {item.size}</p>
                <p className="cart-item-price">
                  ₹{item.product.offer_price || item.product.price}
                  {item.product.offer_price && (
                    <span className="original-price">₹{item.product.price}</span>
                  )}
                </p>
              </div>

              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item, item.qty - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-value">{item.qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item, item.qty + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="cart-item-subtotal">
                ₹{((item.product.offer_price || item.product.price) * item.qty).toFixed(2)}
              </div>

              <button
                className="cart-item-remove"
                onClick={() => handleRemove(item)}
                title="Remove from cart"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-checkout">
            Proceed to Checkout
          </Link>
          <Link to="/collections" className="btn-continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default YourCart;
