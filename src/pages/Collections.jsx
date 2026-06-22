import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDrawer from '../components/ProductDrawer';
import { MOCK_PRODUCTS } from '../data/products';
import './Collections.css';

const Collections = () => {
  const [searchParams] = useSearchParams();
  const [drawerProduct, setDrawerProduct] = useState(null);
  const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('animate-fade-in-up');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    // Scroll to category if query param present
    const category = searchParams.get('category');
    if (category) {
      setTimeout(() => {
        const el = document.getElementById(category);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    return () => observer.disconnect();
  }, [searchParams]);

  return (
    <div className="collections-page">
      <div className="collections-header reveal-on-scroll">
        <h1 className="collections-title">Kurti Collections</h1>
        <p className="collections-desc">Explore our full range of kurti styles, crafted for every mood and occasion.</p>
      </div>

      {categories.map(category => {
        const products = MOCK_PRODUCTS.filter(p => p.category === category);
        const sectionId = category.toLowerCase().replace(/\s+/g, '-');
        return (
          <section key={category} id={sectionId} className="collection-section container">
            <div className="collection-category-header reveal-on-scroll">
              <h2 className="collection-category-name">{category}</h2>
              <div className="collection-divider"></div>
            </div>
            <div className="product-grid grid grid-cols-4">
              {products.map((product, index) => (
                <div key={product.id} className="reveal-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} onClick={setDrawerProduct} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />}
    </div>
  );
};

export default Collections;
