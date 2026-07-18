import { Star, Gift, Zap, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const RewardsLoyalty = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const rewards = [
    { icon: <ShoppingBag size={20} />, title: 'First Purchase', points: 100, desc: 'Complete your first order', done: false },
    { icon: <Star size={20} />, title: 'Profile Complete', points: 50, desc: 'Fill out your profile info', done: !!(currentUser?.name && currentUser?.phone) },
    { icon: <Gift size={20} />, title: 'Refer a Friend', points: 200, desc: 'Share your referral link', done: false },
    { icon: <Zap size={20} />, title: 'Bespoke Order', points: 500, desc: 'Place a custom bespoke order', done: false },
  ];

  return (
    <div className="account-page">
      <h2 className="account-section-title">Rewards & Loyalty</h2>

      {/* Points card */}
      <div className="rewards-hero">
        <div className="rewards-points-circle">
          <span className="rewards-points-number">0</span>
          <span className="rewards-points-label">Points</span>
        </div>
        <div className="rewards-hero-info">
          <h3>Your Livaani Rewards</h3>
          <p>Earn points with every purchase and activity. Redeem for exclusive discounts!</p>
          <div className="rewards-tier">
            <span className="tier-badge bronze">🥉 Bronze Member</span>
            <span className="tier-hint">Earn 500 pts to reach Silver</span>
          </div>
        </div>
      </div>

      {/* How to earn */}
      <h3 className="sub-section-title">How to Earn Points</h3>
      <div className="rewards-grid">
        {rewards.map((r, i) => (
          <div key={i} className={`reward-card ${r.done ? 'reward-done' : ''}`}>
            <div className="reward-icon">{r.icon}</div>
            <div className="reward-info">
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
            <div className="reward-points">+{r.points} pts</div>
            {r.done && <div className="reward-checkmark">✓</div>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="sub-section-title">Quick Actions</h3>
      <div className="rewards-actions">
        <button className="rewards-action-btn" onClick={() => navigate('/collections')}>
          <ShoppingBag size={18} /> Shop & Earn Points
        </button>
        <button className="rewards-action-btn secondary" onClick={() => navigate('/referral')}>
          <Gift size={18} /> Refer a Friend
        </button>
      </div>
    </div>
  );
};

export default RewardsLoyalty;
