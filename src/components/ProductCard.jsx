import BorderGlow from './BorderGlow';
import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={() => onClick && onClick(product)} style={{ cursor: 'pointer' }}>
      <BorderGlow
        backgroundColor="transparent"
        borderRadius={4}
        glowRadius={30}
        edgeSensitivity={20}
        glowColor="40 60 90"
        glowIntensity={0.8}
        coneSpread={20}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
        fillOpacity={0.3}
        className="product-glow-wrapper"
      >
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </div>
      </BorderGlow>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default ProductCard;
