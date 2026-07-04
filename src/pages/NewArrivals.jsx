import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import './NewArrivals.css';

// Show the 12 most recently added products as "new arrivals"
const NEW_ARRIVALS = PRODUCTS.slice(0, 12);

const NewArrivals = () => {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="new-arrivals-page">
      <div className="new-arrivals-header">
        <h1 className="new-arrivals-title">New Arrivals</h1>
        <p className="new-arrivals-desc">Fresh drops. Clean cuts. Designed with precision and modern sophistication.</p>
      </div>

      <div className="container">
        <div className="product-grid grid grid-cols-4">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(p) => navigate(`/product/${p.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
