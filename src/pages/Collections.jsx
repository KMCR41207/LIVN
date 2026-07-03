import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDrawer from '../components/ProductDrawer';
import { MOCK_PRODUCTS } from '../data/products';
import { getCurrentUser, deleteProduct, getProducts } from '../lib/api';
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

    // Load DB products and merge with mock products
    getProducts().then(({ data }) => {
      if (data && data.length > 0) {
        // Merge: DB products first, then mock products (avoid duplicates by name)
        const dbNames = new Set(data.map(p => p.name));
        const filteredMock = MOCK_PRODUCTS.filter(p => !dbNames.has(p.name));
        setProducts([...data, ...filteredMock]);
      }
    }).catch(() => {
      // Server not reachable — keep mock products
    });

    const category = searchParams.get('category');
    if (category) {
      setTimeout(() => {
        const el = document.getElementById(category);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    if (product._id) {
      const { error } = await deleteProduct(product._id);
      if (error) { alert('Failed to delete: ' + error); return; }
    }
    setProducts(prev => prev.filter(p => (p._id || p.id) !== (product._id || product.id)));
  };

  return (
    <div className="collections-page">
      <div className="collections-header">
        <h1 className="collections-title">Kurti Collections</h1>
        <p className="collections-desc">Explore our full range of kurti styles, crafted for every mood and occasion.</p>
      </div>

      {categories.map(category => {
        const catProducts = products.filter(p => p.category === category);
        const sectionId = category.toLowerCase().replace(/\s+/g, '-');
        return (
          <section key={category} id={sectionId} className="collection-section container">
            <div className="collection-category-header">
              <h2 className="collection-category-name">{category}</h2>
              <div className="collection-divider"></div>
            </div>
            <div className="product-grid grid grid-cols-4">
              {catProducts.map((product) => (
                <div key={product._id || product.id} className="product-card-wrapper">
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
