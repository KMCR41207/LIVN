import { useState } from 'react';
import { Shield, Bell, Lock, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const SettingsPrivacy = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [notifs, setNotifs] = useState({
    orderEmails: true,
    promoEmails: true,
    smsNotifs: true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setNotifs(p => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSaveNotifs = () => setSaved(true);

  const handleLogoutAll = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="account-page">
      <h2 className="account-section-title">Settings & Privacy</h2>

      {/* Notification Preferences */}
      <div className="settings-section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={18} />
            <h3>Notification Preferences</h3>
          </div>
        </div>
        <div className="notif-list">
          <label className="notif-row">
            <div>
              <p className="notif-title">Order Updates</p>
              <p className="notif-desc">Shipping, delivery and order status emails</p>
            </div>
            <div className={`toggle-switch ${notifs.orderEmails ? 'on' : ''}`} onClick={() => toggle('orderEmails')}>
              <div className="toggle-knob" />
            </div>
          </label>
          <label className="notif-row">
            <div>
              <p className="notif-title">Promotional Emails</p>
              <p className="notif-desc">Sales, new arrivals and exclusive offers</p>
            </div>
            <div className={`toggle-switch ${notifs.promoEmails ? 'on' : ''}`} onClick={() => toggle('promoEmails')}>
              <div className="toggle-knob" />
            </div>
          </label>
          <label className="notif-row">
            <div>
              <p className="notif-title">SMS Notifications</p>
              <p className="notif-desc">Text messages for order and delivery updates</p>
            </div>
            <div className={`toggle-switch ${notifs.smsNotifs ? 'on' : ''}`} onClick={() => toggle('smsNotifs')}>
              <div className="toggle-knob" />
            </div>
          </label>
        </div>
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="save-btn" onClick={handleSaveNotifs}>Save Preferences</button>
          {saved && <span style={{ color: '#28a745', fontSize: '13px' }}>✓ Saved</span>}
        </div>
      </div>

      {/* Privacy */}
      <div className="settings-section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} />
            <h3>Privacy Controls</h3>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
          Your personal information is securely stored and never shared with third parties without your consent.
          You can request a copy of your data or delete your account at any time.
        </p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="change-password-btn" onClick={() => navigate('/shipping-returns')}>
            View Privacy Policy
          </button>
          <button className="change-password-btn">Download My Data</button>
        </div>
      </div>

      {/* Security */}
      <div className="settings-section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} />
            <h3>Account Security</h3>
          </div>
        </div>
        <div className="security-item">
          <div>
            <h4>Login Method</h4>
            <p style={{ textTransform: 'capitalize' }}>
              {currentUser?.provider || 'Email'} account
            </p>
          </div>
        </div>
        <div className="security-item">
          <div>
            <h4>Sign Out of All Devices</h4>
            <p>This will log you out everywhere and invalidate all sessions.</p>
          </div>
          <button
            className="change-password-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleLogoutAll}
          >
            <LogOut size={14} /> Sign Out All
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        <div className="danger-item">
          <div>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all associated data. This cannot be undone.</p>
          </div>
          <button
            className="delete-account-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => window.confirm('Are you absolutely sure? This cannot be undone.') && navigate('/account?tab=customer-care')}
          >
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
