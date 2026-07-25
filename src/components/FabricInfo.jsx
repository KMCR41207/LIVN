import React, { useState } from 'react';
import { Info, Droplets, Sun, Wind, Sparkles } from 'lucide-react';
import './FabricInfo.css';

const FabricInfo = ({ fabric = 'cotton', className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fabricData = {
    cotton: {
      name: 'Cotton',
      description: 'Natural, breathable fabric perfect for daily wear',
      properties: {
        breathability: 5,
        comfort: 5,
        durability: 4,
        careEase: 4
      },
      features: [
        'Highly breathable and moisture-absorbing',
        'Soft and comfortable against skin',
        'Machine washable and easy to care for',
        'Perfect for Indian climate'
      ],
      care: [
        'Machine wash in cold water',
        'Use mild detergent',
        'Air dry in shade',
        'Iron on medium heat if needed'
      ],
      icon: Wind,
      color: '#90EE90'
    },
    silk: {
      name: 'Silk',
      description: 'Luxurious natural fabric with elegant drape',
      properties: {
        breathability: 3,
        comfort: 4,
        durability: 3,
        careEase: 2
      },
      features: [
        'Luxurious feel and natural sheen',
        'Temperature regulating properties',
        'Elegant drape and movement',
        'Naturally hypoallergenic'
      ],
      care: [
        'Dry clean recommended',
        'Hand wash in cold water if needed',
        'Use silk-specific detergent',
        'Air dry away from direct sunlight'
      ],
      icon: Sparkles,
      color: '#FFD700'
    },
    linen: {
      name: 'Linen',
      description: 'Lightweight, breathable fabric ideal for summers',
      properties: {
        breathability: 5,
        comfort: 4,
        durability: 4,
        careEase: 3
      },
      features: [
        'Exceptional breathability',
        'Gets softer with each wash',
        'Naturally antimicrobial',
        'Perfect for hot weather'
      ],
      care: [
        'Machine wash in warm water',
        'Use gentle cycle',
        'Air dry for best results',
        'Iron while slightly damp'
      ],
      icon: Sun,
      color: '#F5DEB3'
    },
    georgette: {
      name: 'Georgette',
      description: 'Flowing, lightweight fabric with beautiful drape',
      properties: {
        breathability: 4,
        comfort: 4,
        durability: 3,
        careEase: 3
      },
      features: [
        'Beautiful flowing drape',
        'Lightweight and airy',
        'Elegant movement',
        'Perfect for ethnic wear'
      ],
      care: [
        'Hand wash or gentle machine cycle',
        'Use cold water',
        'Air dry flat',
        'Steam iron on low heat'
      ],
      icon: Droplets,
      color: '#E6E6FA'
    }
  };

  const currentFabric = fabricData[fabric.toLowerCase()] || fabricData.cotton;
  const IconComponent = currentFabric.icon;

  const PropertyBar = ({ label, value, max = 5 }) => (
    <div className="property-bar">
      <span className="property-label">{label}</span>
      <div className="property-track">
        <div 
          className="property-fill" 
          style={{ 
            width: `${(value / max) * 100}%`,
            backgroundColor: currentFabric.color
          }} 
        />
      </div>
      <span className="property-value">{value}/{max}</span>
    </div>
  );

  return (
    <div className={`fabric-info ${className}`}>
      <div className="fabric-info-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="fabric-icon" style={{ color: currentFabric.color }}>
          <IconComponent size={20} />
        </div>
        <div className="fabric-basic">
          <h4>{currentFabric.name} Fabric</h4>
          <p>{currentFabric.description}</p>
        </div>
        <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          <Info size={16} />
        </button>
      </div>

      {isExpanded && (
        <div className="fabric-details">
          <div className="fabric-properties">
            <h5>Fabric Properties</h5>
            <div className="properties-grid">
              <PropertyBar label="Breathability" value={currentFabric.properties.breathability} />
              <PropertyBar label="Comfort" value={currentFabric.properties.comfort} />
              <PropertyBar label="Durability" value={currentFabric.properties.durability} />
              <PropertyBar label="Care Ease" value={currentFabric.properties.careEase} />
            </div>
          </div>

          <div className="fabric-features">
            <h5>Key Features</h5>
            <ul>
              {currentFabric.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="fabric-care">
            <h5>Care Instructions</h5>
            <ul>
              {currentFabric.care.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricInfo;