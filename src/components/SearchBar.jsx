import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import './SearchBar.css';

const API = import.meta.env.VITE_API_URL || '/api';

// ── Trending searches for Livaani ────────────────────────────────────────────
const TRENDING = ['Floral Kurti', 'Cotton Co-ord Set', 'Sleeveless Kurti', 'Embroidered Kurta', 'Wedding Outfit'];

// ── Color / fabric / occasion keyword maps for fuzzy intent matching ─────────
const KEYWORD_MAP = {
  pink: ['pink', 'rose', 'blush', 'baby pink', 'light pink'],
  red: ['red', 'maroon', 'crimson', 'scarlet'],
  blue: ['blue', 'navy', 'indigo', 'sky blue', 'royal blue'],
  green: ['green', 'olive', 'mint', 'sage', 'emerald'],
  yellow: ['yellow', 'mustard', 'golden', 'saffron'],
  white: ['white', 'ivory', 'cream', 'off white'],
  black: ['black', 'charcoal', 'dark'],
  purple: ['purple', 'lavender', 'violet', 'lilac'],
  orange: ['orange', 'peach', 'coral', 'rust'],
  cotton: ['cotton', 'linen', 'khadi', 'chanderi'],
  silk: ['silk', 'satin', 'georgette', 'chiffon', 'crepe'],
  floral: ['floral', 'flower', 'botanical', 'printed', 'print'],
  embroidered: ['embroidered', 'embroidery', 'zari', 'mirror work', 'thread work'],
  wedding: ['wedding', 'bridal', 'festive', 'heavy', 'silk', 'occasion', 'function'],
  office: ['office', 'formal', 'work', 'professional', 'minimal', 'straight', 'simple'],
  casual: ['casual', 'daily', 'everyday', 'cotton', 'comfortable', 'simple'],
  party: ['party', 'evening', 'sequin', 'glam', 'festive', 'occasion'],
  sleeveless: ['sleeveless', 'tank', 'strap', 'noodle strap', 'halter'],
  fullsleeve: ['full sleeve', 'long sleeve', 'winter', 'full sleeves'],
  kurta: ['kurta', 'kurti', 'kurthi', 'top', 'tunic'],
  set: ['set', 'co-ord', 'coord', 'ensemble', 'combo', 'suit'],
};

// ── Simple fuzzy: check if query chars exist in order in text ────────────────
const fuzzyMatch = (text, query) => {
  if (!text || !query) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  // Direct includes first (fastest)
  if (t.includes(q)) return true;
  // Typo tolerance: allow 1 char difference for words > 4 chars
  const words = q.split(/\s+/);
  return words.every(word => {
    if (word.length <= 3) return t.includes(word);
    // Check if any word in text is within 1 edit distance
    return t.split(/\s+/).some(tw => levenshtein(tw, word) <= 1);
  });
};

// ── Levenshtein distance (edit distance) ─────────────────────────────────────
const levenshtein = (a, b) => {
  if (!a) return b.length;
  if (!b) return a.length;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

// ── Expand query using keyword map ───────────────────────────────────────────
const expandQuery = (query) => {
  const q = query.toLowerCase();
  const extra = [];
  Object.entries(KEYWORD_MAP).forEach(([key, synonyms]) => {
    if (synonyms.some(s => q.includes(s) || s.includes(q))) {
      extra.push(...synonyms);
    }
  });
  return [...new Set([q, ...extra])];
};

// ── Score a product against query terms ──────────────────────────────────────
const scoreProduct = (product, terms) => {
  let score = 0;
  const fields = [
    product.name?.toLowerCase() || '',
    product.category?.toLowerCase() || '',
    product.description?.toLowerCase() || '',
    (product.tags || []).join(' ').toLowerCase(),
    (product.keywords || []).join(' ').toLowerCase(),
  ];
  const fullText = fields.join(' ');
  terms.forEach(term => {
    if (product.name?.toLowerCase().includes(term)) score += 10;
    if (product.category?.toLowerCase().includes(term)) score += 6;
    if (product.description?.toLowerCase().includes(term)) score += 3;
    if (fullText.includes(term)) score += 1;
  });
  return score;
};

// ── Smart local search ───────────────────────────────────────────────────────
const smartSearch = (query, allProducts) => {
  if (!query || query.trim().length < 2) return [];
  const terms = expandQuery(query.trim());
  const scored = allProducts
    .map(p => ({ product: p, score: scoreProduct(p, terms) }))
    .filter(({ score, product }) => score > 0 || fuzzyMatch(product.name + ' ' + product.category, query))
    .sort((a, b) => b.score - a.score);
  return scored.map(s => s.product).slice(0, 8);
};

// ── Highlight matching keyword in text ───────────────────────────────────────
const Highlight = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
        )}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
};

// ── Recent searches storage ───────────────────────────────────────────────────
const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem('livn_recent_searches') || '[]'); }
  catch { return []; }
};
const saveRecentSearch = (q) => {
  if (!q?.trim()) return;
  const existing = getRecentSearches().filter(s => s !== q.trim());
  const updated = [q.trim(), ...existing].slice(0, 5);
  localStorage.setItem('livn_recent_searches', JSON.stringify(updated));
};
const removeRecentSearch = (q) => {
  const updated = getRecentSearches().filter(s => s !== q);
  localStorage.setItem('livn_recent_searches', JSON.stringify(updated));
};

// ── Main SearchBar ────────────────────────────────────────────────────────────
const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [allProducts, setAllProducts] = useState(PRODUCTS);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Load DB products in background for richer search
  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.length > 0) {
          const dbNames = new Set(data.data.map(p => p.name));
          const staticOnly = PRODUCTS.filter(p => !dbNames.has(p.name));
          setAllProducts([...data.data, ...staticOnly]);
        }
      })
      .catch(() => {}); // Silent fail — fallback to static products
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const found = smartSearch(value, allProducts);
      setResults(found);
      setLoading(false);
    }, 300);
  }, [allProducts]);

  const handleSelect = (product) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    navigate(`/product/${product.id || product._id}`);
    onClose?.();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    navigate(`/collections?search=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    handleSearch(term);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (e, term) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const showDropdown = focused;
  const showResults = query.trim().length >= 2;

  return (
    <div className="search-bar-wrapper">
      {/* ── Input Container (new glassmorphism style) ── */}
      <div className="input__container">
        <div className="shadow__input" />
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <button type="submit" className="input__button__shadow" aria-label="Search">
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20px" width="20px">
              <path d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z" fillRule="evenodd" fill="#17202A" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            name="text"
            className="input__search"
            placeholder="Search kurtis, colors, occasions..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            autoComplete="off"
            onKeyDown={e => {
              if (e.key === 'Escape') { onClose?.(); }
            }}
          />
          {query && (
            <button type="button" className="input__clear__btn" aria-label="Clear search"
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
              <X size={16} />
            </button>
          )}
          {loading && <div className="input__spinner" />}
        </form>

        {onClose && (
          <button type="button" className="search-close-btn" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="search-dropdown">
          {!showResults ? (
            /* Show recent + trending when no query */
            <>
              {recentSearches.length > 0 && (
                <>
                  <div className="search-section-label">
                    <Clock size={13} /> Recent Searches
                  </div>
                  {recentSearches.map((term, i) => (
                    <button key={i} className="search-suggestion-item" onMouseDown={() => handleSuggestionClick(term)}>
                      <Clock size={14} className="suggestion-icon" />
                      <span>{term}</span>
                      <button className="suggestion-remove" onMouseDown={e => handleRemoveRecent(e, term)} aria-label="Remove">
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                </>
              )}
              <div className="search-section-label">
                <TrendingUp size={13} /> Trending
              </div>
              {TRENDING.map((term, i) => (
                <button key={i} className="search-suggestion-item" onMouseDown={() => handleSuggestionClick(term)}>
                  <TrendingUp size={14} className="suggestion-icon trending" />
                  <span>{term}</span>
                  <ArrowRight size={13} className="suggestion-arrow" />
                </button>
              ))}
            </>
          ) : results.length === 0 ? (
            /* No results */
            <div className="search-no-results">
              <Search size={20} />
              <span>No products found for "<strong>{query}</strong>"</span>
              <p className="search-no-results-tip">Try: floral, cotton, pink, office wear…</p>
            </div>
          ) : (
            /* Show matched products */
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
                      <span>
                        ₹{(product.offer_price || product.price)?.toLocaleString('en-IN')}
                      </span>
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
