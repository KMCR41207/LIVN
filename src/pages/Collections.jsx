import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDrawer from '../components/ProductDrawer';
import { MOCK_PRODUCTS } from '../data/products';
import { getCurrentUser, deleteProduct, getProducts } from '../lib/api';
import { Trash2, Plus, Search, X } from 'lucide-react';
import './Collections.css';

// Preferred display order for categories
const CATEGORY_ORDER = [
  'Kurta Set',
  'Kurta Set with Dupatta',
  'Kurta',
  'Co-ord Set',
  'Sleeveless Kurti',
  'Full Sleeve Kurti',
  'Corset Kurti',
  'Noodle Strap Kurti',
  'Halter Neck Kurti',
];

const Collections = () => {
  const [searchParams] = useSearchParams();
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorted unique categories
  const categories = useMemo(() => {
    const raw = [...new Set(products.map(p => p.category))];
    return raw.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [products]);

  // Filtered products for display
  const displayProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  // Categories shown in the filtered view
  const visibleCategories = useMemo(() => {
    if (activeCategory !== 'All') return [activeCategory];
    return [...new Set(displayProducts.map(p => p.category))].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [displayProducts, activeCategory]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = getCurrentUser();
    if (user?.role === 'admin') setAdminMode(true);

    getProducts()
      .then(({ data }) => {
        if (data && data.length > 0) {
          const dbNames = new Set(data.map(p => p.name));
          const filteredMock = MOCK_PRODUCTS.filter(p => !dbNames.has(p.name));
          setProducts([...data, ...filteredMock]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const category = searchParams.get('category');
    if (category) {
      setActiveCategory(category);
      setTimeout(() => {
        const el = document.getElementById(category.toLowerCase().replace(/\s+/g, '-'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    } else {
      setLoading(false);
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
      {/* ── Header ── */}
      <div className="collections-header">
        <h1 className="collections-title">Our Collections</h1>
        <p className="collections-desc">
          {loading
            ? 'Loading products...'
            : `${products.length} styles crafted for every mood and occasion.`}
        </p>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="collections-controls container">
        <div className="collections-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="collections-search"
            type="text"
            placeholder="Search styles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="collections-filter-bar">
          <button
            className={`filter-chip ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            All ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="collections-loading container">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-skeleton" />
          ))}
        </div>
      )}

      {/* ── No Results ── */}
      {!loading && displayProducts.length === 0 && (
        <div className="collections-empty container">
          <p>No products found for "<strong>{searchQuery || activeCategory}</strong>".</p>
          <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Product Sections ── */}
      {!loading && visibleCategories.map(category => {
        const catProducts = displayProducts.filter(p => p.category === category);
        if (!catProducts.length) return null;
        const sectionId = category.toLowerCase().replace(/\s+/g, '-');
        return (
          <section key={category} id={sectionId} className="collection-section container">
            <div className="collection-category-header">
              <h2 className="collection-category-name">{category}</h2>
              <span className="collection-category-count">{catProducts.length}</span>
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
              {adminMode && activeCategory !== 'All' && (
                <div className="admin-add-card" onClick={() => window.location.href = '/admin'}>
                  <Plus size={32} />
                  <span>Add Product</span>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {drawerProduct && (
        <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />
      )}
    </div>
  );
};

export default Collections;
