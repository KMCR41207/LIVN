import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './ColorPicker.css';

const ColorPicker = ({ 
  colors = [], 
  selectedColor, 
  onColorChange, 
  size = 'medium',
  className = '' 
}) => {
  const [hoveredColor, setHoveredColor] = useState(null);

  const colorSizes = {
    small: 24,
    medium: 32,
    large: 40
  };

  const colorSize = colorSizes[size] || colorSizes.medium;

  return (
    <div className={`color-picker ${className}`}>
      {colors.map((color) => {
        const isSelected = selectedColor === color.value;
        const isHovered = hoveredColor === color.value;
        
        return (
          <button
            key={color.value}
            type="button"
            className={`color-option ${isSelected ? 'selected' : ''}`}
            style={{
              width: colorSize,
              height: colorSize,
              backgroundColor: color.hex || color.value,
            }}
            onClick={() => onColorChange?.(color.value)}
            onMouseEnter={() => setHoveredColor(color.value)}
            onMouseLeave={() => setHoveredColor(null)}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          >
            {isSelected && (
              <Check 
                size={colorSize * 0.5} 
                color={color.textColor || (color.hex === '#FFFFFF' || color.value === 'white' ? '#000' : '#fff')}
              />
            )}
            {(isHovered || isSelected) && (
              <div className="color-tooltip">
                {color.name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ColorPicker;