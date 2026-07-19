import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const API = import.meta.env.VITE_API_URL || '/api';

const emptyForm = {
  name: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', country: 'India', isDefault: false,
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

const ManageAddresses = () => {
  const { accessToken } = useAuth();
  // Always use fresh token: prefer context, fall back to localStorage
  const getToken = () => accessToken || localStorage.getItem('livn_token');

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/addresses`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load addresses');
      setAddresses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const url = editingId ? `${API}/auth/addresses/${editingId}` : `${API}/auth/addresses`;
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');
      setAddresses(data.data || []);
      setSuccess(editingId ? 'Address updated!' : 'Address added!');
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      name: addr.name || '', phone: addr.phone || '',
      line1: addr.line1 || '', line2: addr.line2 || '',
      city: addr.city || '', state: addr.state || '',
      pincode: addr.pincode || '', country: addr.country || 'India',
      isDefault: addr.isDefault || false,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setError(null);
    try {
      const res = await fetch(`${API}/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setAddresses(data.data || []);
      setSuccess('Address deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (id) => {
    setError(null);
    try {
      const res = await fetch(`${API}/auth/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setAddresses(data.data || []);
      setSuccess('Default address updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  if (loading) return <div className="loading">Loading addresses…</div>;

  return (
    <div className="account-page">
      <div className="page-header-row">
        <h2 className="account-section-title">Manage Addresses</h2>
        {!showForm && (
          <button className="add-address-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add New Address
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="address-form-card">
          <div className="address-form-header">
            <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <button className="icon-close-btn" onClick={resetForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Recipient name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
              </div>
            </div>
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input name="line1" value={form.line1} onChange={handleChange} required placeholder="House/Flat No., Street, Area" />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input name="line2" value={form.line2} onChange={handleChange} placeholder="Landmark, Colony (optional)" />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
              </div>
              <div className="form-group">
                <label>State *</label>
                <select name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="6-digit pincode" maxLength={6} />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                Set as default delivery address
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h3>No Saved Addresses</h3>
          <p>Add a delivery address to make checkout faster.</p>
          <button type="button" className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <div key={addr._id} className={`address-card ${addr.isDefault ? 'default-address' : ''}`}>
              {addr.isDefault && <div className="default-badge"><Check size={12} /> Default</div>}
              <div className="address-body">
                <p className="addr-name">{addr.name}</p>
                {addr.phone && <p className="addr-phone">{addr.phone}</p>}
                <p className="addr-line">{addr.line1}</p>
                {addr.line2 && <p className="addr-line">{addr.line2}</p>}
                <p className="addr-line">{addr.city}, {addr.state} – {addr.pincode}</p>
                <p className="addr-line">{addr.country}</p>
              </div>
              <div className="address-actions">
                {!addr.isDefault && (
                  <button className="addr-action-btn" onClick={() => handleSetDefault(addr._id)}>Set Default</button>
                )}
                <button className="addr-action-btn" onClick={() => handleEdit(addr)}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="addr-action-btn delete" onClick={() => handleDelete(addr._id)}>
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAddresses;
