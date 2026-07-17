import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload, LogOut } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    bio: '',
  });

  const API = import.meta.env.VITE_API_URL || '/api';

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        dob: currentUser.dob ? currentUser.dob.split('T')[0] : '',
        bio: currentUser.bio || '',
      });
      if (currentUser.profilePhoto) {
        setProfilePhoto(currentUser.profilePhoto);
      }
    }
  }, [currentUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      const response = await fetch(`${API}/auth/profile/update`, {
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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>My Profile</h1>
            <p className="profile-subtitle">Manage your personal information</p>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Messages */}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="profile-content">
          {/* Profile Photo Section */}
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  <User size={64} />
                </div>
              )}
              {isEditing && (
                <label className="photo-upload-label">
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

          {/* Profile Form */}
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-section">
              <h2 className="form-section-title">Personal Information</h2>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <User size={18} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="form-input disabled"
                  placeholder="Email cannot be changed"
                />
                <p className="form-hint">Email cannot be changed for security</p>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  👤 Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-select"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label htmlFor="dob" className="form-label">
                  <Calendar size={18} />
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              {/* Bio */}
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  📝 Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-textarea"
                  placeholder="Tell us a bit about yourself"
                  rows={4}
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="form-section">
              <h2 className="form-section-title">Account Information</h2>
              <div className="account-info">
                <div className="info-item">
                  <span className="info-label">Account Type:</span>
                  <span className="info-value">{currentUser?.role || 'User'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Provider:</span>
                  <span className="info-value">{currentUser?.provider || 'Email'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Verified:</span>
                  <span className={`info-value ${currentUser?.isEmailVerified ? 'verified' : 'unverified'}`}>
                    {currentUser?.isEmailVerified ? '✓ Verified' : '✕ Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn btn-success"
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
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
