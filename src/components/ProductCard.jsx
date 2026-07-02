import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={() => onClick && onClick(product)} style={{ cursor: 'pointer' }}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default ProductCard;
