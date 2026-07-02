import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Info } from 'lucide-react';
import './BespokeMeasurements.css';

const BespokeMeasurements = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    
    // Body Measurements (in inches)
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    neckCircumference: '',
    inseam: '',
    outseam: '',
    thigh: '',
    calf: '',
    armhole: '',
    bicep: '',
    wrist: '',
    backWidth: '',
    frontLength: '',
    backLength: '',
    crotchDepth: '',
    
    // Additional Info
    height: '',
    weight: '',
    bodyType: '',
    fitPreference: 'regular',
    notes: ''
  });

  const [savedProgress, setSavedProgress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProgress = () => {
    localStorage.setItem('bespokeMeasurements', JSON.stringify(formData));
    setSavedProgress(true);
    setTimeout(() => setSavedProgress(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('bespokeMeasurements', JSON.stringify(formData));
    navigate('/bespoke/fabrics');
  };

  // Load saved progress on mount
  useState(() => {
    const saved = localStorage.getItem('bespokeMeasurements');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="bespoke-measurements-page">
      {/* Hero Section */}
      <section className="measurements-hero">
        <div className="container">
          <h1>Precision Measurements</h1>
          <p>Accurate measurements are the foundation of perfect tailoring. Follow our guide carefully.</p>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="container">
          <div className="progress-steps">
            <div className="progress-step active">
              <div className="step-circle">1</div>
              <span>Measurements</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
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

      {/* Main Form */}
      <section className="section-padding measurements-form-section">
        <div className="container">
          <div className="form-grid">
            {/* Instructions Panel */}
            <div className="instructions-panel">
              <h3>Measurement Guide</h3>
              
              <div className="instruction-item">
                <img src="/images/category_full_sleeve_kurti.jpeg" alt="Measuring guide" />
                <h4>How to Measure</h4>
                <ul>
                  <li>Use a flexible measuring tape</li>
                  <li>Wear fitted clothing</li>
                  <li>Stand naturally, don't hold breath</li>
                  <li>Measure over undergarments only</li>
                  <li>Get help for accuracy</li>
                </ul>
              </div>

              <div className="tip-box">
                <Info size={20} />
                <div>
                  <h4>Professional Tip</h4>
                  <p>For best results, have someone help you measure. If measurements seem unusual, remeasure to confirm.</p>
                </div>
              </div>

              <div className="tip-box">
                <Save size={20} />
                <div>
                  <h4>Save Your Progress</h4>
                  <p>Your measurements are automatically saved as you type. You can return anytime to complete the form.</p>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="form-panel">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Upper Body Measurements */}
                <div className="form-section">
                  <h3>Upper Body Measurements (inches)</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Chest *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="chest"
                        value={formData.chest}
                        onChange={handleChange}
                        required
                        placeholder="38.0"
                      />
                      <span className="help-text">Around fullest part</span>
                    </div>
                    <div className="form-group">
                      <label>Waist *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="waist"
                        value={formData.waist}
                        onChange={handleChange}
                        required
                        placeholder="32.0"
                      />
                      <span className="help-text">At natural waistline</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Shoulder Width *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="shoulder"
                        value={formData.shoulder}
                        onChange={handleChange}
                        required
                        placeholder="17.0"
                      />
                      <span className="help-text">Across shoulders</span>
                    </div>
                    <div className="form-group">
                      <label>Sleeve Length *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="sleeveLength"
                        value={formData.sleeveLength}
                        onChange={handleChange}
                        required
                        placeholder="33.0"
                      />
                      <span className="help-text">Shoulder to wrist</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Neck Circumference *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="neckCircumference"
                        value={formData.neckCircumference}
                        onChange={handleChange}
                        required
                        placeholder="15.5"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bicep</label>
                      <input
                        type="number"
                        step="0.1"
                        name="bicep"
                        value={formData.bicep}
                        onChange={handleChange}
                        placeholder="14.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Lower Body Measurements */}
                <div className="form-section">
                  <h3>Lower Body Measurements (inches)</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Hips *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="hips"
                        value={formData.hips}
                        onChange={handleChange}
                        required
                        placeholder="40.0"
                      />
                      <span className="help-text">Around fullest part</span>
                    </div>
                    <div className="form-group">
                      <label>Inseam *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="inseam"
                        value={formData.inseam}
                        onChange={handleChange}
                        required
                        placeholder="32.0"
                      />
                      <span className="help-text">Inside leg</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Thigh</label>
                      <input
                        type="number"
                        step="0.1"
                        name="thigh"
                        value={formData.thigh}
                        onChange={handleChange}
                        placeholder="22.0"
                      />
                      <span className="help-text">Around fullest part</span>
                    </div>
                    <div className="form-group">
                      <label>Calf</label>
                      <input
                        type="number"
                        step="0.1"
                        name="calf"
                        value={formData.calf}
                        onChange={handleChange}
                        placeholder="15.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h3>Additional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Height (cm) *</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        required
                        placeholder="175"
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg) *</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                        placeholder="70"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Body Type</label>
                      <select
                        name="bodyType"
                        value={formData.bodyType}
                        onChange={handleChange}
                      >
                        <option value="">Select body type</option>
                        <option value="slim">Slim/Athletic</option>
                        <option value="average">Average</option>
                        <option value="muscular">Muscular</option>
                        <option value="heavyset">Heavyset</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fit Preference *</label>
                      <select
                        name="fitPreference"
                        value={formData.fitPreference}
                        onChange={handleChange}
                        required
                      >
                        <option value="slim">Slim Fit</option>
                        <option value="regular">Regular Fit</option>
                        <option value="relaxed">Relaxed Fit</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Any special requirements, posture considerations, or fit preferences..."
                    ></textarea>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleSaveProgress}
                  >
                    <Save size={18} />
                    {savedProgress ? 'Saved!' : 'Save Progress'}
                  </button>
                  <button type="submit" className="btn btn-gold">
                    Continue to Fabric Selection
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Measurement CTA */}
      <section className="section-padding professional-cta">
        <div className="container">
          <div className="cta-card">
            <h3>Need Professional Help?</h3>
            <p>
              Not confident with self-measurements? Book an appointment with our master tailors 
              for precise digital 3D scanning and professional measurement service.
            </p>
            <Link to="/bespoke/consultation" className="btn btn-primary">
              Book Professional Measurement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeMeasurements;
