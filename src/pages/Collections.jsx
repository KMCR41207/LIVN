import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDrawer from '../components/ProductDrawer';
import { MOCK_PRODUCTS } from '../data/products';
import { getCurrentUser, deleteProduct } from '../lib/api';
import { Trash2, Plus } from 'lucide-react';
import './Collections.css';

const Collections = () => {
  const [searchParams] = useSearchParams();
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const categories = [...new Set(products.map(p => p.category))];

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if admin is logged in
    const user = getCurrentUser();
    if (user?.role === 'admin') setAdminMode(true);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('animate-fade-in-up');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    const category = searchParams.get('category');
    if (category) {
      setTimeout(() => {
        const el = document.getElementById(category);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    return () => observer.disconnect();
  }, [searchParams]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    // For DB products (have _id), call API; for mock products (have id), just remove from local state
    if (product._id) {
      const { error } = await deleteProduct(product._id);
      if (error) { alert('Failed to delete: ' + error); return; }
    }
    setProducts(prev => prev.filter(p => (p._id || p.id) !== (product._id || product.id)));
  };

  return (
    <div className="collections-page">
      <div className="collections-header reveal-on-scroll">
        <h1 className="collections-title">Kurti Collections</h1>
        <p className="collections-desc">Explore our full range of kurti styles, crafted for every mood and occasion.</p>
      </div>

      {categories.map(category => {
        const catProducts = products.filter(p => p.category === category);
        const sectionId = category.toLowerCase().replace(/\s+/g, '-');
        return (
          <section key={category} id={sectionId} className="collection-section container">
            <div className="collection-category-header reveal-on-scroll">
              <h2 className="collection-category-name">{category}</h2>
              <div className="collection-divider"></div>
            </div>
            <div className="product-grid grid grid-cols-4">
              {catProducts.map((product, index) => (
                <div key={product._id || product.id} className="reveal-on-scroll product-card-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} onClick={setDrawerProduct} />
                  {adminMode && (
                    <button
                      className="admin-delete-overlay"
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* Admin: Add Product button at end of each category */}
              {adminMode && (
                <div className="admin-add-card" onClick={() => window.location.href = '/admin'}>
                  <Plus size={32} />
                  <span>Add Product</span>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />}
    </div>
  );
};

export default Collections;
