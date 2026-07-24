import React, { useState, useEffect } from 'react';
import { Sliders, X } from 'lucide-react';
import './PriceFilter.css';

const PriceFilter = ({ 
  minPrice = 0, 
  maxPrice = 10000, 
  currentRange = [0, 10000],
  onChange,
  className = '' 
}) => {
  const [range, setRange] = useState(currentRange);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setRange(currentRange);
  }, [currentRange]);

  const handleRangeChange = (index, value) => {
    const newRange = [...range];
    newRange[index] = Number(value);
    
    // Ensure min doesn't exceed max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    }
    // Ensure max doesn't go below min
    if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setRange(newRange);
    onChange?.(newRange);
  };

  const presetRanges = [
    { label: 'Under ₹2,000', range: [0, 2000] },
    { label: '₹2,000 - ₹4,000', range: [2000, 4000] },
    { label: '₹4,000 - ₹6,000', range: [4000, 6000] },
    { label: '₹6,000 - ₹8,000', range: [6000, 8000] },
    { label: 'Above ₹8,000', range: [8000, maxPrice] },
  ];

  const handlePresetClick = (presetRange) => {
    setRange(presetRange);
    onChange?.(presetRange);
  };

  const clearFilter = () => {
    const defaultRange = [minPrice, maxPrice];
    setRange(defaultRange);
    onChange?.(defaultRange);
  };

  const hasFilter = range[0] !== minPrice || range[1] !== maxPrice;

  return (
    <div className={`price-filter ${className}`}>
      <button 
        className={`price-filter-toggle ${isOpen ? 'active' : ''} ${hasFilter ? 'has-filter' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sliders size={16} />
        Price
        {hasFilter && (
          <span className="price-filter-badge">
            ₹{range[0].toLocaleString()} - ₹{range[1].toLocaleString()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="price-filter-dropdown">
          <div className="price-filter-header">
            <h4>Filter by Price</h4>
            {hasFilter && (
              <button className="price-filter-clear" onClick={clearFilter}>
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Range Inputs */}
          <div className="price-range-inputs">
            <div className="price-input-group">
              <label>Min Price</label>
              <input
                type="number"
                value={range[0]}
                onChange={(e) => handleRangeChange(0, e.target.value)}
                min={minPrice}
                max={maxPrice}
                className="price-input"
              />
            </div>
            <div className="price-input-separator">-</div>
            <div className="price-input-group">
              <label>Max Price</label>
              <input
                type="number"
                value={range[1]}
                onChange={(e) => handleRangeChange(1, e.target.value)}
                min={minPrice}
                max={maxPrice}
                className="price-input"
              />
            </div>
          </div>

          {/* Range Sliders */}
          <div className="price-range-sliders">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={range[0]}
              onChange={(e) => handleRangeChange(0, e.target.value)}
              className="price-slider price-slider-min"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={range[1]}
              onChange={(e) => handleRangeChange(1, e.target.value)}
              className="price-slider price-slider-max"
            />
          </div>

          {/* Preset Ranges */}
          <div className="price-presets">
            <div className="price-presets-label">Quick Select:</div>
            {presetRanges.map((preset, index) => (
              <button
                key={index}
                className={`price-preset ${
                  range[0] === preset.range[0] && range[1] === preset.range[1] ? 'active' : ''
                }`}
                onClick={() => handlePresetClick(preset.range)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceFilter;