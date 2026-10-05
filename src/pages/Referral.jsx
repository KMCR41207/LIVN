import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, Users, Gift, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Referral.css';

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: <Share2 size={28} />,
    title: 'Share Your Code',
    desc: 'Send your unique referral code to friends via WhatsApp, Instagram, or any platform you love.',
  },
  {
    step: 2,
    icon: <Users size={28} />,
    title: "Friend Places First Order",
    desc: 'Your friend uses your code at checkout on their first Livaani purchase.',
  },
  {
    step: 3,
    icon: <Gift size={28} />,
    title: 'You Both Earn ₹200',
    desc: 'Once the order is confirmed, you both receive a ₹200 coupon for your next purchase.',
  },
];

// Generate a deterministic code from user id or email
const generateCode = (seed) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  let suffix = '';
  let h = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    suffix += chars[h % chars.length];
    h = Math.floor(h / chars.length) + 7;
  }
  return 'LIVN-' + suffix;
};

const Referral = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated && currentUser) {
      // Use user id or email as seed for consistent code
      const seed = currentUser.id || currentUser.email || 'guest';
      setReferralCode(generateCode(seed));
    } else {
      // Fallback for non-logged-in users
      let code = localStorage.getItem('livn_referral_code');
      if (!code) {
        code = generateCode('guest-' + Date.now());
        localStorage.setItem('livn_referral_code', code);
      }
      setReferralCode(code);
    }
  }, [isAuthenticated, currentUser]);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const waText = encodeURIComponent(
    `Use my code ${referralCode} for ₹200 off at Livaani! Shop at livaani.com`
  );

  return (
    <div className="referral-page">
      {/* Hero */}
      <section className="referral-hero section-padding">
        <div className="container referral-hero-inner">
          <div className="referral-hero-badge">Referral Program</div>
          <h1 className="referral-hero-title">Invite a Friend,<br />Earn Rewards</h1>
          <p className="referral-hero-desc">
            Share Livaani with someone you love. When they place their first order,
            you both receive a ₹200 coupon — no limits on how many friends you can refer.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Referral Code Box */}
        <section className="referral-code-section">
          <h2 className="referral-section-title">Your Referral Code</h2>
          <div className="referral-code-box">
            <span className="referral-code-value">{referralCode || '...'}</span>
            <button
              className="referral-copy-btn btn btn-primary"
              onClick={handleCopy}
              aria-label="Copy referral code"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="referral-share-row">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="referral-wa-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.563 7.563l-1.5 7.07c-.11.52-.4.65-.81.4l-2.25-1.7-1.08 1.04c-.12.12-.22.22-.46.22l.17-2.33 4.22-3.81c.18-.16-.04-.25-.28-.09L8.4 14.09l-2.19-.68c-.48-.15-.49-.48.1-.71l8.57-3.3c.4-.15.75.1.65.71z" />
              </svg>
              Share on WhatsApp
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section className="referral-how section-padding">
          <h2 className="referral-section-title text-center">How It Works</h2>
          <div className="referral-steps">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="referral-step-card">
                <div className="referral-step-number">{item.step}</div>
                <div className="referral-step-icon">{item.icon}</div>
                <h3 className="referral-step-title">{item.title}</h3>
                <p className="referral-step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Referral History */}
        <section className="referral-history-section">
          <h2 className="referral-section-title">Referral History</h2>
          <p className="referral-empty">No referrals yet. Share your code to get started!</p>
        </section>

        <div style={{ paddingBottom: '80px' }} />
      </div>
    </div>
  );
};

export default Referral;
