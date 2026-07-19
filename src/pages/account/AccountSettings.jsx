import { useState, useEffect } from 'react';
import { Edit2, Save, X, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const API = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'livn_auth_state';

const AccountSettings = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '',
  });

  // Sync form with current user on load / user change
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        dob: currentUser.dob ? currentUser.dob.split('T')[0] : '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = accessToken || localStorage.getItem('livn_token');
      const res = await fetch(`${API}/auth/profile/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      // Update stored user so Navbar shows new name
      const updated = { ...currentUser, ...data.user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // If context exposes setter, use it
      if (typeof setCurrentUser === 'function') setCurrentUser(updated);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      gender: currentUser?.gender || '',
      dob: currentUser?.dob ? currentUser.dob.split('T')[0] : '',
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="account-page">
      <h2 className="account-section-title">Account Settings</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* ── Personal Info ── */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <button className="edit-btn" onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>
            {isEditing ? <><X size={15} /> Cancel</> : <><Edit2 size={15} /> Edit</>}
          </button>
        </div>

        {/* Non-edit summary */}
        {!isEditing && (
          <div className="profile-summary">
            <div className="profile-avatar-large">
              {currentUser?.profilePhoto
                ? <img src={currentUser.profilePhoto} alt="profile" className="profile-img-lg" />
                : <div className="profile-initials">{(currentUser?.name || currentUser?.email || 'U')[0].toUpperCase()}</div>
              }
            </div>
            <div className="profile-details-list">
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{currentUser?.name || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{currentUser?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{currentUser?.phone || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{currentUser?.gender || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">
                  {currentUser?.dob ? new Date(currentUser.dob).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Login via</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                  {currentUser?.provider || 'Email'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {isEditing && (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={currentUser?.email} disabled />
                <small>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
            </div>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        )}
      </div>

      {/* ── Security ── */}
      <div className="settings-section">
        <h3>Security</h3>
        <div className="security-item">
          <div>
            <h4>Password</h4>
            <p>{currentUser?.provider === 'email'
              ? 'Change your account password'
              : `You signed in with ${currentUser?.provider} — no password required`}
            </p>
          </div>
          {currentUser?.provider === 'email' && (
            <button className="change-password-btn">Change Password</button>
          )}
        </div>
        <div className="security-item">
          <div>
            <h4>Linked Accounts</h4>
            <p>Connected: {currentUser?.provider || 'Email'}</p>
          </div>
        </div>
      </div>

      {/* ── Account Management ── */}
      <div className="settings-section danger-zone">
        <h3>Account Management</h3>
        <div className="danger-item">
          <div>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button className="delete-account-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
