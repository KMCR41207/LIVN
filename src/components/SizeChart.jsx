import React, { useState } from 'react';
import { Ruler, X, Info } from 'lucide-react';
import './SizeChart.css';

const SizeChart = ({ isOpen, onClose, category = 'kurti' }) => {
  const [activeTab, setActiveTab] = useState('sizes');

  const sizeCharts = {
    kurti: {
      sizes: [
        { size: 'XS', bust: '32', waist: '26', hip: '34', length: '44' },
        { size: 'S', bust: '34', waist: '28', hip: '36', length: '44' },
        { size: 'M', bust: '36', waist: '30', hip: '38', length: '45' },
        { size: 'L', bust: '38', waist: '32', hip: '40', length: '45' },
        { size: 'XL', bust: '40', waist: '34', hip: '42', length: '46' },
        { size: 'XXL', bust: '42', waist: '36', hip: '44', length: '46' },
      ],
      tips: [
        'Measurements are in inches',
        'For best fit, measure over undergarments',
        'If between sizes, choose the larger size for comfort',
        'Length is measured from shoulder to hem',
        'All measurements have a tolerance of ±0.5 inches'
      ]
    },
    dress: {
      sizes: [
        { size: 'XS', bust: '32', waist: '25', hip: '35', length: '38' },
        { size: 'S', bust: '34', waist: '27', hip: '37', length: '38' },
        { size: 'M', bust: '36', waist: '29', hip: '39', length: '39' },
        { size: 'L', bust: '38', waist: '31', hip: '41', length: '39' },
        { size: 'XL', bust: '40', waist: '33', hip: '43', length: '40' },
        { size: 'XXL', bust: '42', waist: '35', hip: '45', length: '40' },
      ],
      tips: [
        'Measurements are in inches',
        'Measure at the fullest part of bust',
        'Waist at natural waistline',
        'Hip at fullest part',
        'Length varies by style - check product details'
      ]
    }
  };

  const currentChart = sizeCharts[category] || sizeCharts.kurti;

  if (!isOpen) return null;

  return (
    <div className="size-chart-overlay" onClick={onClose}>
      <div className="size-chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="size-chart-header">
          <div className="size-chart-title">
            <Ruler size={20} />
            <h3>Size Chart - {category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          </div>
          <button className="size-chart-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="size-chart-tabs">
          <button 
            className={`tab-btn ${activeTab === 'sizes' ? 'active' : ''}`}
            onClick={() => setActiveTab('sizes')}
          >
            Size Chart
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            Measuring Guide
          </button>
        </div>

        <div className="size-chart-content">
          {activeTab === 'sizes' && (
            <>
              <div className="size-table-container">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust (inches)</th>
                      <th>Waist (inches)</th>
                      <th>Hip (inches)</th>
                      <th>Length (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentChart.sizes.map((row) => (
                      <tr key={row.size}>
                        <td className="size-cell">{row.size}</td>
                        <td>{row.bust}</td>
                        <td>{row.waist}</td>
                        <td>{row.hip}</td>
                        <td>{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="size-tips">
                <h4><Info size={16} /> Sizing Tips</h4>
                <ul>
                  {currentChart.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === 'guide' && (
            <div className="measuring-guide">
              <div className="guide-section">
                <h4>How to Measure</h4>
                <div className="measurement-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Bust</h5>
                      <p>Measure around the fullest part of your bust, keeping the tape level and snug but not tight.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Waist</h5>
                      <p>Measure around your natural waistline, which is the narrowest part of your torso.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Hip</h5>
                      <p>Measure around the fullest part of your hips, typically 7-9 inches below your waistline.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h5>Length</h5>
                      <p>Measure from the highest point of your shoulder down to where you want the garment to end.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-tips">
                <h4>General Tips</h4>
                <ul>
                  <li>Use a soft measuring tape for accurate measurements</li>
                  <li>Wear fitted clothing or undergarments while measuring</li>
                  <li>Stand straight with arms at your sides</li>
                  <li>Have someone help you measure for better accuracy</li>
                  <li>Take measurements in front of a mirror</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeChart;