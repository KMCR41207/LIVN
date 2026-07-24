import React, { useState, useRef } from 'react';
import { Star, Camera, X, Send, Heart, ThumbsUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from './NotificationSystem';
import './ReviewSystem.css';

const StarRating = ({ rating, onRatingChange, size = 20, interactive = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hover || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          disabled={!interactive}
        >
          <Star size={size} fill={star <= (hover || rating) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
};

const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 5 }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // 5MB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result,
            name: file.name,
          };
          onPhotosChange([...photos, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (photoId) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  return (
    <div className="photo-upload">
      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <img src={photo.preview} alt="Review photo" />
            <button
              type="button"
              className="remove-photo"
              onClick={() => removePhoto(photo.id)}
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            className="add-photo-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={24} />
            <span>Add Photo</span>
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <p className="photo-help-text">
        Add up to {maxPhotos} photos (max 5MB each). Show off your style!
      </p>
    </div>
  );
};

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      showError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      showError('Please write a review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const review = {
        id: Date.now(),
        productId,
        userId: currentUser?.id,
        userName: currentUser?.name || 'Anonymous',
        userAvatar: currentUser?.profilePhoto,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos: photos.map(p => p.preview), // In real app, upload to server first
        createdAt: new Date().toISOString(),
        likes: 0,
        verified: true, // If user bought the product
      };
      
      onSubmit?.(review);
      showSuccess('Review posted successfully!');
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setPhotos([]);
      
    } catch (error) {
      showError('Failed to post review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-header">
        <h3>Write a Review</h3>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      {/* Rating */}
      <div className="form-group">
        <label>Your Rating *</label>
        <StarRating rating={rating} onRatingChange={setRating} size={24} interactive />
        <span className="rating-text">
          {rating === 0 && 'Select a rating'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </span>
      </div>

      {/* Title */}
      <div className="form-group">
        <label htmlFor="review-title">Review Title (Optional)</label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="form-group">
        <label htmlFor="review-comment">Your Review *</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience with this product..."
          rows={4}
          maxLength={1000}
          required
        />
        <div className="char-count">{comment.length}/1000</div>
      </div>

      {/* Photo Upload */}
      <div className="form-group">
        <label>Add Photos</label>
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-submit" 
          disabled={!rating || !comment.trim() || isSubmitting}
        >
          <Send size={16} />
          {isSubmitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </form>
  );
};

const ReviewItem = ({ review, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [photosExpanded, setPhotosExpanded] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(review.id, !liked);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          {review.userAvatar ? (
            <img src={review.userAvatar} alt="" className="reviewer-avatar" />
          ) : (
            <div className="reviewer-avatar reviewer-avatar-placeholder">
              {review.userName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
          <div>
            <div className="reviewer-name">
              {review.userName}
              {review.verified && <span className="verified-badge">✓ Verified Purchase</span>}
            </div>
            <div className="review-date">{timeAgo(review.createdAt)}</div>
          </div>
        </div>
        <StarRating rating={review.rating} size={16} />
      </div>

      {review.title && <h4 className="review-title">{review.title}</h4>}
      
      <p className="review-comment">{review.comment}</p>

      {review.photos && review.photos.length > 0 && (
        <div className="review-photos">
          <div className={`photo-grid ${photosExpanded ? 'expanded' : ''}`}>
            {review.photos.slice(0, photosExpanded ? review.photos.length : 3).map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt=""
                className="review-photo"
                onClick={() => setPhotosExpanded(!photosExpanded)}
              />
            ))}
          </div>
          {review.photos.length > 3 && !photosExpanded && (
            <button 
              className="show-more-photos"
              onClick={() => setPhotosExpanded(true)}
            >
              +{review.photos.length - 3} more photos
            </button>
          )}
        </div>
      )}

      <div className="review-actions">
        <button 
          className={`review-like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <ThumbsUp size={14} />
          Helpful ({review.likes + (liked ? 1 : 0)})
        </button>
      </div>
    </div>
  );
};

const ReviewSystem = ({ productId, reviews: initialReviews = [] }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { isAuthenticated } = useAuth();
  const { showError } = useNotifications();

  const handleSubmitReview = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowForm(false);
  };

  const handleLikeReview = (reviewId, liked) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + (liked ? 1 : -1) }
        : review
    ));
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      showError('Please sign in to write a review');
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="review-system">
      <div className="review-summary">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-score">{averageRating.toFixed(1)}</span>
            <StarRating rating={Math.round(averageRating)} size={20} />
            <span className="review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
          
          <div className="rating-breakdown">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating}</span>
                <Star size={12} fill="currentColor" />
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${percentage}%` }} />
                </div>
                <span className="rating-count">({count})</span>
              </div>
            ))}
          </div>
        </div>

        <button className="write-review-btn" onClick={handleWriteReview}>
          Write a Review
        </button>
      </div>

      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowForm(false)}
        />
      )}

      {reviews.length > 0 && (
        <>
          <div className="review-controls">
            <label htmlFor="sort-reviews">Sort by:</label>
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="reviews-list">
            {sortedReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onLike={handleLikeReview}
              />
            ))}
          </div>
        </>
      )}

      {reviews.length === 0 && !showForm && (
        <div className="no-reviews">
          <Star size={48} className="no-reviews-icon" />
          <h3>No reviews yet</h3>
          <p>Be the first to review this product!</p>
          <button className="write-review-btn" onClick={handleWriteReview}>
            Write the First Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;
export { StarRating, ReviewForm, ReviewItem };