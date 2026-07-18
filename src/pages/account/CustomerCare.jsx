import { useState } from 'react';
import { Headphones, Mail, Phone, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const CustomerCare = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSending(true);
    // Simulate send (integrate with email/WhatsApp API if needed)
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="account-page">
      <h2 className="account-section-title">Customer Care</h2>

      {/* Contact methods */}
      <div className="care-cards">
        <div className="care-card">
          <Mail size={24} className="care-icon" />
          <div>
            <h3>Email Support</h3>
            <p>support@livaani.com</p>
            <span className="care-tag">Response within 24 hrs</span>
          </div>
          <a href="mailto:support@livaani.com" className="care-action-btn">Email Us</a>
        </div>

        <div className="care-card">
          <Phone size={24} className="care-icon" />
          <div>
            <h3>Phone Support</h3>
            <p>+91 90000 00000</p>
            <span className="care-tag">Mon–Fri, 10 AM – 6 PM IST</span>
          </div>
          <a href="tel:+919000000000" className="care-action-btn">Call Us</a>
        </div>

        <div className="care-card">
          <MessageCircle size={24} className="care-icon" />
          <div>
            <h3>WhatsApp Chat</h3>
            <p>+91 90000 00000</p>
            <span className="care-tag">24/7 Support</span>
          </div>
          <button className="care-action-btn" onClick={() => navigate('/whatsapp')}>Chat Now</button>
        </div>
      </div>

      {/* Contact form */}
      <div className="care-form-card">
        <h3>Send us a Message</h3>
        {sent ? (
          <div className="care-success">
            <CheckCircle size={32} />
            <h4>Message Sent!</h4>
            <p>We'll get back to you at <strong>{currentUser?.email}</strong> within 24 hours.</p>
            <button className="btn-save" onClick={() => setSent(false)}>Send Another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="care-form">
            <div className="form-group">
              <label>Your Email</label>
              <input type="email" value={currentUser?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text" name="subject" value={form.subject}
                onChange={handleChange} required
                placeholder="e.g. Order issue, Size question…"
              />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message" value={form.message}
                onChange={handleChange} required
                rows={5} placeholder="Describe your issue or question…"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" className="btn-save" disabled={sending}>
              <Send size={14} /> {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerCare;
