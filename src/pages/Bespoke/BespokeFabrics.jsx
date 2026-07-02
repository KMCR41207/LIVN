import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Filter } from 'lucide-react';
import './BespokeFabrics.css';

const BespokeFabrics = () => {
  const navigate = useNavigate();
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fabrics = [
    { id: 1, name: 'Banarasi Silk', type: 'silk', origin: 'Varanasi, India', weight: '200gsm', price: 25000, image: '/images/bespoke/ethnic3.jpeg' },
    { id: 2, name: 'Kanjeevaram Silk', type: 'silk', origin: 'Tamil Nadu, India', weight: '280gsm', price: 45000, image: '/images/bespoke/ethnic1.jpg' },
    { id: 3, name: 'Chanderi Cotton', type: 'cotton', origin: 'Madhya Pradesh, India', weight: '120gsm', price: 12000, image: '/images/bespoke/ethnic2.jpg' },
    { id: 4, name: 'Mysore Silk', type: 'silk', origin: 'Karnataka, India', weight: '180gsm', price: 30000, image: '/images/category_sleeveless_kurti.jpeg' },
    { id: 5, name: 'Lucknowi Chikankari', type: 'cotton', origin: 'Lucknow, India', weight: '140gsm', price: 18000, image: '/images/category_corset_kurti.jpeg' },
    { id: 6, name: 'Tussar Silk', type: 'silk', origin: 'Jharkhand, India', weight: '160gsm', price: 22000, image: '/images/category_halter_neck_kurti.jpeg' },
    { id: 7, name: 'Pochampally Ikat', type: 'cotton', origin: 'Telangana, India', weight: '200gsm', price: 15000, image: '/images/category_noodle_strap_kurti.jpeg' },
    { id: 8, name: 'Organza Silk', type: 'silk', origin: 'India', weight: '80gsm', price: 20000, image: '/images/bespoke/ethnic3.jpeg' },
    { id: 9, name: 'Cotton Mul Mul', type: 'cotton', origin: 'Rajasthan, India', weight: '100gsm', price: 8000, image: '/images/category_full_sleeve_kurti.jpeg' }
  ];

  const filteredFabrics = fabrics.filter(fabric => {
    const matchesType = filterType === 'all' || fabric.type === filterType;
    const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleContinue = () => {
    if (selectedFabric) {
      localStorage.setItem('bespokeFabric', JSON.stringify(selectedFabric));
      navigate('/bespoke/design');
    } else {
      alert('Please select a fabric to continue');
    }
  };

  return (
    <div className="bespoke-fabrics-page">
      {/* Hero */}
      <section className="fabrics-hero">
        <div className="container">
          <h1>Select Your Fabric</h1>
          <p>Choose from over 5,000 premium fabrics from the world's finest mills</p>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="container">
          <div className="progress-steps">
            <div className="progress-step completed">
              <div className="step-circle">✓</div>
              <span>Measurements</span>
            </div>
            <div className="progress-line active"></div>
            <div className="progress-step active">
              <div className="step-circle">2</div>
              <span>Fabrics</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-circle">3</div>
              <span>Design</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-circle">4</div>
              <span>Consultation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <section className="section-padding fabrics-section">
        <div className="container">
          <div className="fabrics-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search fabrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>
                All Fabrics
              </button>
              <button className={filterType === 'silk' ? 'active' : ''} onClick={() => setFilterType('silk')}>
                Silk
              </button>
              <button className={filterType === 'cotton' ? 'active' : ''} onClick={() => setFilterType('cotton')}>
                Cotton
              </button>
            </div>
          </div>

          {/* Fabric Grid */}
          <div className="fabric-grid">
            {filteredFabrics.map((fabric) => (
              <div
                key={fabric.id}
                className={`fabric-card ${selectedFabric?.id === fabric.id ? 'selected' : ''}`}
                onClick={() => setSelectedFabric(fabric)}
              >
                <div className="fabric-image">
                  <img src={fabric.image} alt={fabric.name} />
                  {selectedFabric?.id === fabric.id && (
                    <div className="selected-badge">✓ Selected</div>
                  )}
                </div>
                <div className="fabric-info">
                  <h3>{fabric.name}</h3>
                  <p className="fabric-origin">{fabric.origin}</p>
                  <div className="fabric-details">
                    <span className="fabric-weight">{fabric.weight}</span>
                    <span className="fabric-type">{fabric.type}</span>
                  </div>
                  <div className="fabric-price">₹{fabric.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="fabrics-actions">
            <button onClick={handleContinue} className="btn btn-gold btn-large" disabled={!selectedFabric}>
              Continue to Design Studio
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeFabrics;
