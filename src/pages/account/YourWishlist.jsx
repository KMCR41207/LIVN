import { Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AccountPages.css';

const YourWishlist = () => {
  const navigate = useNavigate();

  return (
    <div className="account-page">
      <h2 className="account-section-title">Your Wishlist</h2>

      <div className="empty-state">
        <Heart size={48} />
        <h3>Wishlist is Empty</h3>
        <p>Save items you love by clicking the ♡ heart icon on any product. They'll be waiting for you here.</p>
        <button className="btn-primary" onClick={() => navigate('/collections')}>
          <ShoppingBag size={16} /> Browse Collections
        </button>
      </div>
    </div>
  );
};

export default YourWishlist;
