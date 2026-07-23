import { useState, useEffect } from 'react';
import { MessageSquare, ShoppingBag, Star, Upload, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const API = import.meta.env.VITE_API_URL || '/api';

const YourReviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const getToken = () => accessToken || localStorage.getItem('livn_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      // Fetch user's orders (delivered only)
      const ordRes = await fetch(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch user's reviews
      const revRes = await fetch(`${API}/reviews/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        const deliveredOrders = (ordData.data || []).filter(
          o => o.status?.toLowerCase() === 'delivered'
        );
        setOrders(deliveredOrders);
      }

      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            src: event.target.result,
            file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !reviewText.trim()) {
      alert('Please select an order and write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('rating', rating);
      formData.append('review', reviewText);
      
      uploadedImages.forEach((img, idx) => {
        formData.append(`images`, img.file);
      });

      const response = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        alert('Review posted successfully!');
        setReviewText('');
        setRating(5);
        setUploadedImages([]);
        setSelectedOrder(null);
        setShowReviewForm(false);
        fetchData();
      } else {
        alert('Failed to post review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get orders that haven't been reviewed yet
  const reviewableOrders = orders.filter(
    order => !reviews.some(r => r.orderId === order._id)
  );

  const allOrders = activeTab === 'reviewed' 
    ? orders.filter(o => reviews.some(r => r.orderId === o._id))
    : reviewableOrders;

  if (isLoading) return <div className="loading">Loading your reviews…</div>;

  return (
    <div className="account-page">
      <div className="page-header-row">
        <h2 className="account-section-title">Your Reviews</h2>
        {reviewableOrders.length > 0 && !showReviewForm && (
          <button 
            className="btn-primary"
            onClick={() => setShowReviewForm(true)}
          >
            <MessageSquare size={14} /> Write a Review
          </button>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-container">
          <div className="review-form-card">
            <div className="review-form-header">
              <h3>Share Your Experience</h3>
              <button 
                className="close-btn"
                onClick={() => setShowReviewForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Select Order */}
            <div className="form-group">
              <label>Select Order *</label>
              <select 
                value={selectedOrder?._id || ''}
                onChange={(e) => {
                  const ord = reviewableOrders.find(o => o._id === e.target.value);
                  setSelectedOrder(ord);
                }}
                className="form-select"
              >
                <option value="">Choose an order...</option>
                {reviewableOrders.map(order => (
                  <option key={order._id} value={order._id}>
                    {order.product_name} (₹{order.price})
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <>
                {/* Rating */}
                <div className="form-group">
                  <label>Rating *</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        <Star size={24} fill={star <= rating ? '#ffc107' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="form-group">
                  <label>Your Review *</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="form-textarea"
                    rows={5}
                  />
                  <div className="char-count">
                    {reviewText.length}/500
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>Add Photos (Optional)</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="review-images"
                    />
                    <label htmlFor="review-images" className="upload-label">
                      <Upload size={28} />
                      <span>Click to upload or drag images</span>
                      <span className="upload-hint">Up to 5 images, PNG/JPG</span>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images">
                      <h4>Uploaded Images ({uploadedImages.length}/5)</h4>
                      <div className="images-grid">
                        {uploadedImages.map(img => (
                          <div key={img.id} className="image-preview">
                            <img src={img.src} alt="preview" />
                            <button
                              className="remove-img-btn"
                              onClick={() => removeImage(img.id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewText.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {reviews.length > 0 && (
        <div className="sub-tabs">
          <button
            className={`sub-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Can Review ({reviewableOrders.length})
          </button>
          <button
            className={`sub-tab-btn ${activeTab === 'reviewed' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviewed')}
          >
            Your Reviews ({reviews.length})
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'all' ? (
        reviewableOrders.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No Orders to Review</h3>
            <p>After receiving your orders, you can share your experience here to help other shoppers.</p>
            <button className="btn-primary" onClick={() => navigate('/account?tab=orders')}>
              <ShoppingBag size={16} /> View Your Orders
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {reviewableOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>{order.product_name}</h4>
                    <p className="order-date">Order placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="order-footer">
                  <span className="order-date">₹{order.price}</span>
                  <button
                    className="action-btn"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowReviewForm(true);
                    }}
                  >
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div>
                  <h4>{review.productName}</h4>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? '#ffc107' : 'none'}
                        color={i < review.rating ? '#ffc107' : '#ccc'}
                      />
                    ))}
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p className="review-text">{review.review}</p>
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`review-${idx}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourReviews;
