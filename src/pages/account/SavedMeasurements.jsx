import { useState } from 'react';
import { Ruler, Plus, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AccountPages.css';

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest', unit: 'inches' },
  { key: 'waist', label: 'Waist', unit: 'inches' },
  { key: 'hips', label: 'Hips', unit: 'inches' },
  { key: 'shoulder', label: 'Shoulder Width', unit: 'inches' },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches' },
  { key: 'length', label: 'Garment Length', unit: 'inches' },
  { key: 'neck', label: 'Neck', unit: 'inches' },
  { key: 'height', label: 'Height', unit: 'cm' },
  { key: 'weight', label: 'Weight', unit: 'kg' },
];

const emptyForm = MEASUREMENT_FIELDS.reduce((acc, f) => { acc[f.key] = ''; return acc; }, {});

const SavedMeasurements = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(null); // saved measurement object
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaved(form);
      setShowForm(false);
      setSaving(false);
    }, 600);
  };

  return (
    <div className="account-page">
      <div className="page-header-row">
        <h2 className="account-section-title">Saved Measurements</h2>
        <button className="add-address-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Measurements</>}
        </button>
      </div>

      <div className="measurements-info">
        <Ruler size={16} />
        <span>Your measurements are used for personalized bespoke tailoring orders.</span>
        <button className="measurements-bespoke-btn" onClick={() => navigate('/bespoke')}>
          Start Bespoke Order →
        </button>
      </div>

      {showForm && (
        <div className="address-form-card">
          <div className="address-form-header">
            <h3>Your Measurements</h3>
            <button className="icon-close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="address-form">
            <div className="form-row-3">
              {MEASUREMENT_FIELDS.map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label} ({f.unit})</label>
                  <input
                    type="number" step="0.1" name={f.key}
                    value={form[f.key]} onChange={handleChange}
                    placeholder={`e.g. ${f.unit === 'cm' ? '170' : f.unit === 'kg' ? '65' : '36'}`}
                  />
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Measurements'}
              </button>
            </div>
          </form>
        </div>
      )}

      {saved ? (
        <div className="measurements-card">
          <div className="measurements-card-header">
            <h3>My Measurements</h3>
            <button className="edit-btn" onClick={() => { setForm(saved); setShowForm(true); }}>
              Edit
            </button>
          </div>
          <div className="measurements-grid">
            {MEASUREMENT_FIELDS.filter(f => saved[f.key]).map(f => (
              <div className="measurement-item" key={f.key}>
                <span className="measurement-label">{f.label}</span>
                <span className="measurement-value">{saved[f.key]} {f.unit}</span>
              </div>
            ))}
          </div>
        </div>
      ) : !showForm && (
        <div className="empty-state">
          <Ruler size={48} />
          <h3>No Saved Measurements</h3>
          <p>Add your body measurements to make bespoke ordering faster and more accurate.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Measurements
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedMeasurements;
