import { useState, useEffect } from 'react';
import { Star, ShoppingBag, MessageSquare, Users, Sparkles, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import './Rewards.css';

const POINTS_BALANCE = 1240;
const POINTS_TO_RUPEE = 10; // 10 pts = ₹1

const EARN_WAYS = [
  { icon: <ShoppingBag size={22} />, label: 'Purchase', desc: '1 point per ₹10 spent', pts: '+1 pt/₹10' },
  { icon: <MessageSquare size={22} />, label: 'Write a Review', desc: 'For any product you purchased', pts: '+50 pts' },
  { icon: <Users size={22} />, label: 'Refer a Friend', desc: 'When they place their first order', pts: '+200 pts' },
  { icon: <Sparkles size={22} />, label: 'First Purchase Bonus', desc: 'One-time bonus for new members', pts: '+100 pts' },
];

const MOCK_HISTORY = [
  { type: 'earn',   label: 'Purchase — Order #AB1234',    pts: '+124',  date: '20 Jul 2025' },
  { type: 'earn',   label: 'Referral Bonus — Priya R.',   pts: '+200',  date: '12 Jun 2025' },
  { type: 'redeem', label: 'Redeemed on Cart',            pts: '-300',  date: '02 Jun 2025' },
  { type: 'earn',   label: 'Purchase — Order #CD5678',    pts: '+86',   date: '18 May 2025' },
  { type: 'earn',   label: 'First Purchase Bonus',        pts: '+100',  date: '01 May 2025' },
];

const MIN_REDEEM = 100;

const Rewards = () => {
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemApplied, setRedeemApplied] = useState(false);
  const [redeemError, setRedeemError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const redeemPts = parseInt(redeemInput, 10) || 0;
  const rupeeValue = Math.floor(redeemPts / POINTS_TO_RUPEE);

  const handleApply = () => {
    if (!redeemPts || redeemPts < MIN_REDEEM) {
      setRedeemError(`Minimum redemption is ${MIN_REDEEM} points.`);
      return;
    }
    if (redeemPts > POINTS_BALANCE) {
      setRedeemError('You don\'t have enough points.');
      return;
    }
    setRedeemError('');
    setRedeemApplied(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setRedeemInput(val);
    setRedeemApplied(false);
    setRedeemError('');
  };

  return (
    <div className="rewards-page">
      {/* Hero */}
      <section className="rewards-hero section-padding">
        <div className="container rewards-hero-inner">
          <div className="rewards-hero-badge">Rewards Points</div>
          <h1 className="rewards-hero-title">Your Points, Your Perks</h1>
          <p className="rewards-hero-desc">
            Earn points on every purchase and action. Redeem them for instant discounts on your next order.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Balance Banner */}
        <section className="rewards-balance-section">
          <div className="rewards-balance-card">
            <div className="rewards-balance-left">
              <Star size={38} className="rewards-balance-icon" />
              <div>
                <div className="rewards-balance-label">Available Balance</div>
                <div className="rewards-balance-pts">{POINTS_BALANCE.toLocaleString('en-IN')} pts</div>
              </div>
            </div>
            <div className="rewards-balance-right">
              <div className="rewards-balance-eq-label">Equivalent Value</div>
              <div className="rewards-balance-eq-val">₹{Math.floor(POINTS_BALANCE / POINTS_TO_RUPEE)}</div>
              <div className="rewards-balance-rate">{POINTS_TO_RUPEE} pts = ₹1</div>
            </div>
          </div>
        </section>

        {/* Earn + Redeem Grid */}
        <section className="rewards-actions-section section-padding">
          <div className="rewards-actions-grid">
            {/* Earn Points */}
            <div className="rewards-panel">
              <div className="rewards-panel-header earn">
                <ArrowUpCircle size={22} />
                <h2 className="rewards-panel-title">Earn Points</h2>
              </div>
              <div className="rewards-earn-list">
                {EARN_WAYS.map((item, i) => (
                  <div key={i} className="rewards-earn-item">
                    <div className="rewards-earn-icon">{item.icon}</div>
                    <div className="rewards-earn-body">
                      <div className="rewards-earn-label">{item.label}</div>
                      <div className="rewards-earn-desc">{item.desc}</div>
                    </div>
                    <div className="rewards-earn-pts">{item.pts}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem Points */}
            <div className="rewards-panel">
              <div className="rewards-panel-header redeem">
                <ArrowDownCircle size={22} />
                <h2 className="rewards-panel-title">Redeem Points</h2>
              </div>
              <div className="rewards-redeem-body">
                <div className="rewards-redeem-group">
                  <label htmlFor="redeem-input" className="rewards-redeem-label">
                    Enter points to redeem
                  </label>
                  <input
                    id="redeem-input"
                    type="text"
                    className="rewards-redeem-input"
                    placeholder={`Min. ${MIN_REDEEM} pts`}
                    value={redeemInput}
                    onChange={handleInputChange}
                    maxLength={6}
                  />
                  {redeemError && <p className="rewards-redeem-error">{redeemError}</p>}
                </div>

                {redeemPts >= MIN_REDEEM && (
                  <div className="rewards-redeem-preview">
                    <span>{redeemPts} pts</span>
                    <span className="rewards-redeem-arrow">→</span>
                    <span className="rewards-redeem-rupee">₹{rupeeValue} discount</span>
                  </div>
                )}

                <button
                  className={`btn ${redeemApplied ? 'btn-outline' : 'btn-gold'} rewards-apply-btn`}
                  onClick={handleApply}
                  disabled={redeemApplied}
                >
                  {redeemApplied ? '✓ Applied to Cart' : 'Apply to Cart'}
                </button>

                {redeemApplied && (
                  <div className="rewards-applied-msg">
                    <Star size={14} /> {redeemPts} pts (₹{rupeeValue} off) will be applied at checkout.
                  </div>
                )}

                <div className="rewards-redeem-info">
                  <p>• Minimum redemption: {MIN_REDEEM} pts</p>
                  <p>• {POINTS_TO_RUPEE} points = ₹1 discount</p>
                  <p>• Points cannot be combined with other coupons</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="rewards-history-section">
          <h2 className="rewards-section-title">Transaction History</h2>
          <div className="rewards-history-table-wrap">
            <table className="rewards-history-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Points</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((row, i) => (
                  <tr key={i}>
                    <td>{row.label}</td>
                    <td>
                      <span className={`rewards-pts-badge rewards-pts-badge--${row.type}`}>
                        {row.pts}
                      </span>
                    </td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ paddingBottom: '80px' }} />
      </div>
    </div>
  );
};

export default Rewards;
