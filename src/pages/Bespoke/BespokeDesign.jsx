import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './BespokeDesign.css';

const BespokeDesign = () => {
  const navigate = useNavigate();
  const [design, setDesign] = useState({
    garmentType: 'lehenga',
    style: 'traditional',
    lapel: 'round',
    pockets: 'hidden',
    buttons: 2,
    lining: 'full',
    vent: 'none',
    extras: []
  });

  const handleChange = (field, value) => {
    setDesign(prev => ({ ...prev, [field]: value }));
  };

  const handleExtras = (extra) => {
    setDesign(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }));
  };

  const handleContinue = () => {
    localStorage.setItem('bespokeDesign', JSON.stringify(design));
    navigate('/bespoke/consultation');
  };

  return (
    <div className="bespoke-design-page">
      <section className="design-hero">
        <div className="container">
          <h1>Design Studio</h1>
          <p>Customize every detail of your garment</p>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="container">
          <div className="progress-steps">
            <div className="progress-step completed"><div className="step-circle">✓</div><span>Measurements</span></div>
            <div className="progress-line active"></div>
            <div className="progress-step completed"><div className="step-circle">✓</div><span>Fabrics</span></div>
            <div className="progress-line active"></div>
            <div className="progress-step active"><div className="step-circle">3</div><span>Design</span></div>
            <div className="progress-line"></div>
            <div className="progress-step"><div className="step-circle">4</div><span>Consultation</span></div>
          </div>
        </div>
      </div>

      <section className="section-padding design-section">
        <div className="container">
          <div className="design-grid">
            <div className="design-preview">
              <h3>Live Preview</h3>
              <div className="preview-image">
                <img src="/images/bespoke/ethnic2.jpg" alt="Design preview" />
                <div className="preview-overlay">
                  <p>Your custom {design.garmentType}</p>
                  <p>{design.style} style</p>
                </div>
              </div>
            </div>

            <div className="design-options">
              <div className="option-group">
                <h3>Garment Type</h3>
                <div className="option-buttons">
                  {['lehenga', 'saree', 'kurti', 'dress', 'blouse', 'palazzo'].map(type => (
                    <button
                      key={type}
                      className={design.garmentType === type ? 'active' : ''}
                      onClick={() => handleChange('garmentType', type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Style</h3>
                <div className="option-buttons">
                  {['traditional', 'contemporary', 'fusion', 'indo-western'].map(style => (
                    <button
                      key={style}
                      className={design.style === style ? 'active' : ''}
                      onClick={() => handleChange('style', style)}
                    >
                      {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Neckline Style</h3>
                <div className="option-buttons">
                  {['round', 'v-neck', 'sweetheart', 'boat'].map(lapel => (
                    <button
                      key={lapel}
                      className={design.lapel === lapel ? 'active' : ''}
                      onClick={() => handleChange('lapel', lapel)}
                    >
                      {lapel.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Number of Buttons</h3>
                <div className="option-buttons">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      className={design.buttons === num ? 'active' : ''}
                      onClick={() => handleChange('buttons', num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Extras</h3>
                <div className="extras-grid">
                  {['monogram', 'contrast-lining', 'working-cuffs', 'ticket-pocket'].map(extra => (
                    <label key={extra} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={design.extras.includes(extra)}
                        onChange={() => handleExtras(extra)}
                      />
                      <span>{extra.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={handleContinue} className="btn btn-gold btn-large btn-full">
                Continue to Consultation
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeDesign;
