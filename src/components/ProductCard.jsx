import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  const hasDiscount = product.offer_price && product.offer_price < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.offer_price) / product.price) * 100)
    : 0;

  return (
    <div className="product-card" onClick={() => onClick && onClick(product)} style={{ cursor: 'pointer' }}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {hasDiscount && (
          <span className="product-discount-badge">{discountPct}% OFF</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-price-row">
          {hasDiscount ? (
            <>
              <span className="product-offer-price">₹{product.offer_price.toLocaleString('en-IN')}</span>
              <span className="product-mrp">₹{product.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="product-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
