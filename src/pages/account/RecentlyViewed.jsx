import { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRecentlyViewed, clearRecentlyViewed } from '../../hooks/useRecentlyViewed';
import './AccountPages.css';

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="account-page">
      <div className="page-header-row">
        <h2 className="account-section-title">Recently Viewed</h2>
        {items.length > 0 && (
          <button className="addr-action-btn delete" onClick={handleClear}>
            <Trash2 size={13} /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Eye size={48} />
          <h3>No Recently Viewed Items</h3>
          <p>Products you visit will appear here automatically.</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/collections')}
            type="button"
          >
            <ShoppingBag size={16} /> Start Browsing
          </button>
        </div>
      ) : (
        <>
          <p className="rv-count">{items.length} item{items.length !== 1 ? 's' : ''} viewed recently</p>
          <div className="recently-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="recently-card"
                onClick={() => navigate(`/product/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${item.id}`)}
              >
                <div className="recently-img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" />
                  ) : (
                    <div className="recently-no-img"><Eye size={24} /></div>
                  )}
                </div>
                <div className="recently-info">
                  <p className="recently-name">{item.name}</p>
                  <p className="recently-price">₹{Number(item.price).toLocaleString('en-IN')}</p>
                  {item.originalPrice && item.originalPrice !== item.price && (
                    <p className="recently-orig">₹{Number(item.originalPrice).toLocaleString('en-IN')}</p>
                  )}
                  <p className="recently-time"><Clock size={11} /> {timeAgo(item.viewedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentlyViewed;
