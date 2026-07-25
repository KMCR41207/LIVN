import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import './Dropdown.css';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  clearable = false,
  size = 'medium',
  className = '',
  renderOption = null,
  renderValue = null,
  maxHeight = 200,
  loading = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef([]);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.value && option.value.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  // Get selected options for display
  const selectedOptions = multiple 
    ? options.filter(option => value?.includes(option.value))
    : options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
    }
  };

  // Render the display value
  const renderDisplayValue = () => {
    if (multiple) {
      if (!selectedOptions || selectedOptions.length === 0) {
        return <span className="dropdown-placeholder">{placeholder}</span>;
      }
      return (
        <div className="dropdown-multi-values">
          {selectedOptions.slice(0, 2).map((option, index) => (
            <span key={option.value} className="dropdown-tag">
              {renderValue ? renderValue(option) : option.label}
            </span>
          ))}
          {selectedOptions.length > 2 && (
            <span className="dropdown-tag dropdown-tag-count">
              +{selectedOptions.length - 2}
            </span>
          )}
        </div>
      );
    }

    if (!selectedOptions) {
      return <span className="dropdown-placeholder">{placeholder}</span>;
    }

    return renderValue ? renderValue(selectedOptions) : selectedOptions.label;
  };

  const hasValue = multiple ? value?.length > 0 : value !== null && value !== undefined;

  return (
    <div 
      ref={dropdownRef}
      className={`dropdown dropdown-${size} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''} ${className}`}
    >
      <div 
        className="dropdown-trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <div className="dropdown-value">
          {renderDisplayValue()}
        </div>
        <div className="dropdown-actions">
          {clearable && hasValue && !disabled && (
            <button
              className="dropdown-clear"
              onClick={handleClear}
              type="button"
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          <ChevronDown 
            className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}
            size={16}
          />
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu" style={{ maxHeight }}>
          {searchable && (
            <div className="dropdown-search">
              <Search size={14} className="dropdown-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="dropdown-search-input"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
          
          <div className="dropdown-options" role="listbox">
            {loading ? (
              <div className="dropdown-loading">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="dropdown-no-options">
                {searchTerm ? 'No matching options' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = multiple 
                  ? value?.includes(option.value)
                  : value === option.value;
                const isFocused = index === focusedIndex;
                
                return (
                  <div
                    key={option.value}
                    ref={el => optionsRef.current[index] = el}
                    className={`dropdown-option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${option.disabled ? 'disabled' : ''}`}
                    onClick={() => !option.disabled && handleSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="dropdown-option-content">
                      {renderOption ? renderOption(option) : option.label}
                    </div>
                    {isSelected && (
                      <Check size={14} className="dropdown-check" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="dropdown-error">{error}</div>
      )}
    </div>
  );
};

export default Dropdown;