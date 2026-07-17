import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Edit2, Save, X, Upload, LogOut, Lock, AlertCircle } from 'lucide-react';
import './AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const API = import.meta.env.VITE_API_URL || '/api';

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Load current admin data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
      if (currentUser.profilePhoto) {
        setProfilePhoto(currentUser.profilePhoto);
      }
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result);
        setMessage('Photo selected. Click Save to apply changes.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('livn_token');
      if (!token) {
        setError('Not authenticated');
        navigate('/');
        return;
      }

      const updateData = {
        ...formData,
        profilePhoto: profilePhoto,
      };

      const response = await fetch(`${API}/auth/admin/profile/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);

      // Update local user data
      if (result.user) {
        localStorage.setItem('livn_auth_state', JSON.stringify(result.user));
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('livn_token');
      if (!token) {
        setError('Not authenticated');
        navigate('/');
        return;
      }

      const response = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setMessage('✅ Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/admin');
    }
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-container">
        {/* Header */}
        <div className="admin-profile-header">
          <div className="admin-profile-header-content">
            <div className="admin-badge">
              <Shield size={24} />
              Admin
            </div>
            <h1>Admin Profile</h1>
            <p className="admin-email">{currentUser?.email}</p>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Messages */}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-profile-content">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="sidebar-section">
              <h3>Menu</h3>
              <nav className="sidebar-nav">
                <button className="sidebar-link active">
                  <User size={18} />
                  Profile
                </button>
                <button className="sidebar-link" onClick={() => navigate('/admin')}>
                  Dashboard
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-main-content">
            {/* Profile Photo Section */}
            <section className="admin-section">
              <h2 className="admin-section-title">Profile Picture</h2>
              <div className="admin-photo-section">
                <div className="admin-photo-container">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Admin Profile" className="admin-photo" />
                  ) : (
                    <div className="admin-photo-placeholder">
                      <Shield size={80} />
                    </div>
                  )}
                  {isEditing && (
                    <label className="admin-photo-upload-label">
                      <Upload size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        hidden
                      />
                    </label>
                  )}
                </div>
                {isEditing && (
                  <p className="photo-hint">JPG, PNG (Max 5MB)</p>
                )}
              </div>
            </section>

            {/* Personal Information */}
            <section className="admin-section">
              <div className="section-header">
                <h2 className="admin-section-title">Personal Information</h2>
                {!showPasswordForm && (
                  !isEditing ? (
                    <button
                      type="button"
                      className="btn btn-small btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : null
                )}
              </div>

              <form className="admin-form" onSubmit={handleSaveProfile}>
                {/* Name */}
                <div className="admin-form-group">
                  <label htmlFor="admin-name" className="admin-form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="admin-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="admin-form-input"
                    placeholder="Enter admin name"
                  />
                </div>

                {/* Email */}
                <div className="admin-form-group">
                  <label htmlFor="admin-email" className="admin-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="admin-email"
                    value={formData.email}
                    disabled={true}
                    className="admin-form-input disabled"
                    placeholder="Email cannot be changed"
                  />
                  <p className="form-hint">Email cannot be changed for security</p>
                </div>

                {/* Phone */}
                <div className="admin-form-group">
                  <label htmlFor="admin-phone" className="admin-form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="admin-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="admin-form-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Admin Info */}
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Role:</span>
                    <span className="admin-info-value">
                      <Shield size={16} />
                      Administrator
                    </span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Status:</span>
                    <span className="admin-info-value status-active">
                      ✓ Active
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                {isEditing && (
                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setMessage(null);
                      }}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Security Section */}
            <section className="admin-section">
              <div className="section-header">
                <h2 className="admin-section-title">
                  <Lock size={20} />
                  Security
                </h2>
              </div>

              {!showPasswordForm ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <Lock size={18} />
                  Change Password
                </button>
              ) : (
                <form className="admin-form" onSubmit={handleChangePassword}>
                  {/* Current Password */}
                  <div className="admin-form-group">
                    <label htmlFor="current-password" className="admin-form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="admin-form-input"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div className="admin-form-group">
                    <label htmlFor="new-password" className="admin-form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="admin-form-input"
                      placeholder="Enter new password"
                      required
                    />
                    <p className="form-hint">Minimum 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="admin-form-group">
                    <label htmlFor="confirm-password" className="admin-form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="admin-form-input"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      <Save size={18} />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setError(null);
                      }}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Security Notice */}
            <div className="security-notice">
              <AlertCircle size={20} />
              <div>
                <strong>Security Reminder:</strong> Your password and email are securely stored. Never share your credentials with anyone.
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
