import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import './SearchBar.css';

// Highlight matching keyword in text
const Highlight = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
      )}
    </span>
  );
};

// Search static products locally (fast, no API needed for suggestions)
const searchLocal = (query) => {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  ).slice(0, 8);
};

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const found = searchLocal(value);
      setResults(found);
      setLoading(false);
    }, 200);
  }, []);

  const handleSelect = (product) => {
    navigate(`/product/${product.id || product._id}`);
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/collections?search=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const showDropdown = focused && query.trim().length >= 2;

  return (
    <div className="search-bar-wrapper">
      <form className="search-form" onSubmit={handleSubmit}>
        <Search size={18} className="search-form-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search kurtis, sets, fabrics..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoComplete="off"
        />
        {loading && <Loader size={16} className="search-spinner" />}
        {query && !loading && (
          <button type="button" className="search-clear-btn" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
            <X size={16} />
          </button>
        )}
        {onClose && (
          <button type="button" className="search-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-no-results">
              <Search size={20} />
              <span>No products found for "<strong>{query}</strong>"</span>
            </div>
          ) : (
            <>
              <div className="search-results-header">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              {results.map(product => (
                <button
                  key={product.id || product._id}
                  className="search-result-item"
                  onMouseDown={() => handleSelect(product)}
                >
                  {product.image && (
                    <img src={product.image} alt={product.name} className="search-result-img" />
                  )}
                  <div className="search-result-info">
                    <div className="search-result-name">
                      <Highlight text={product.name} query={query} />
                    </div>
                    <div className="search-result-meta">
                      <Highlight text={product.category} query={query} />
                      {product.offer_price
                        ? <span>₹{product.offer_price?.toLocaleString('en-IN')}</span>
                        : <span>₹{product.price?.toLocaleString('en-IN')}</span>
                      }
                    </div>
                  </div>
                </button>
              ))}
              <button className="search-view-all" onMouseDown={handleSubmit}>
                View all results for "{query}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
