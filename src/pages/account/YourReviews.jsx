import { MessageSquare, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AccountPages.css';

const YourReviews = () => {
  const navigate = useNavigate();

  return (
    <div className="account-page">
      <h2 className="account-section-title">Your Reviews</h2>

      <div className="empty-state">
        <MessageSquare size={48} />
        <h3>No Reviews Yet</h3>
        <p>After receiving your orders, you can share your experience here to help other shoppers.</p>
        <button className="btn-primary" onClick={() => navigate('/account?tab=orders')}>
          <ShoppingBag size={16} /> View Your Orders
        </button>
      </div>
    </div>
  );
};

export default YourReviews;
