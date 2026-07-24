import React from 'react';
import './ProductSkeleton.css';

const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="products-skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="product-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-category"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-buttons">
              <div className="skeleton-btn skeleton-btn-primary"></div>
              <div className="skeleton-btn skeleton-btn-heart"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;