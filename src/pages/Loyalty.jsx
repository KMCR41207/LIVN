import { useEffect } from 'react';
import { CheckCircle2, Star, Award, Gem } from 'lucide-react';
import './Loyalty.css';

const TIERS = [
  {
    id: 'silver',
    name: 'Silver',
    icon: <Star size={30} />,
    range: '₹0 – ₹4,999',
    minSpend: 0,
    maxSpend: 4999,
    color: '#9e9e9e',
    borderColor: '#bdbdbd',
    benefits: [
      '5% cashback on every order',
      'Early access to new arrivals',
      'Birthday discount coupon',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: <Award size={30} />,
    range: '₹5,000 – ₹14,999',
    minSpend: 5000,
    maxSpend: 14999,
    color: '#d4af37',
    borderColor: '#d4af37',
    benefits: [
      '10% cashback on every order',
      'Free shipping on all orders',
      'Birthday gift from Livaani',
      'Early access to new arrivals',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: <Gem size={30} />,
    range: '₹15,000+',
    minSpend: 15000,
    maxSpend: Infinity,
    color: '#7b68ee',
    borderColor: '#9c84f0',
    benefits: [
      '15% cashback on every order',
      'Priority customer support',
      'Exclusive member events',
      'Personal stylist consultation',
      'Free shipping + gift wrapping',
    ],
  },
];

// Mock current user data
const CURRENT_SPEND = 6200;

const getCurrentTier = (spend) => {
  if (spend >= 15000) return TIERS[2];
  if (spend >= 5000) return TIERS[1];
  return TIERS[0];
};

const getNextTier = (tier) => {
  const idx = TIERS.findIndex(t => t.id === tier.id);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
};

const Loyalty = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const currentTier = getCurrentTier(CURRENT_SPEND);
  const nextTier = getNextTier(currentTier);

  // Progress bar within current tier range
  const progressPercent = nextTier
    ? Math.min(100, Math.round(
        ((CURRENT_SPEND - currentTier.minSpend) / (currentTier.maxSpend - currentTier.minSpend + 1)) * 100
      ))
    : 100;

  const amountToNext = nextTier
    ? nextTier.minSpend - CURRENT_SPEND
    : 0;

  return (
    <div className="loyalty-page">
      {/* Hero */}
      <section className="loyalty-hero section-padding">
        <div className="container loyalty-hero-inner">
          <div className="loyalty-hero-badge">Loyalty Program</div>
          <h1 className="loyalty-hero-title">Rewards That Grow With You</h1>
          <p className="loyalty-hero-desc">
            The more you shop, the more you earn. Unlock exclusive tiers and enjoy
            cashback, free shipping, and bespoke perks.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Current Status */}
        <section className="loyalty-status-section">
          <div className="loyalty-status-card" style={{ borderColor: currentTier.borderColor }}>
            <div className="loyalty-status-left">
              <div className="loyalty-current-badge" style={{ background: currentTier.color }}>
                {currentTier.icon}
                <span>{currentTier.name} Member</span>
              </div>
              <div className="loyalty-spend-info">
                <span className="loyalty-spend-label">Total Spend</span>
                <span className="loyalty-spend-amount">₹{CURRENT_SPEND.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="loyalty-status-right">
              {nextTier ? (
                <>
                  <div className="loyalty-progress-label">
                    ₹{amountToNext.toLocaleString('en-IN')} more to reach&nbsp;
                    <strong style={{ color: nextTier.color }}>{nextTier.name}</strong>
                  </div>
                  <div className="loyalty-progress-bar-wrap">
                    <div
                      className="loyalty-progress-bar-fill"
                      style={{ width: `${progressPercent}%`, background: currentTier.color }}
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="loyalty-progress-ends">
                    <span>₹{currentTier.minSpend.toLocaleString('en-IN')}</span>
                    <span>{progressPercent}%</span>
                    <span>₹{currentTier.maxSpend.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="loyalty-max-tier">
                  <CheckCircle2 size={20} style={{ color: currentTier.color }} />
                  You've reached the highest tier — enjoy all Platinum benefits!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tier Cards */}
        <section className="loyalty-tiers-section section-padding">
          <h2 className="loyalty-section-title">Membership Tiers</h2>
          <div className="loyalty-tiers-grid">
            {TIERS.map((tier) => {
              const isActive = tier.id === currentTier.id;
              return (
                <div
                  key={tier.id}
                  className={`loyalty-tier-card ${isActive ? 'loyalty-tier-card--active' : ''}`}
                  style={isActive ? { borderColor: tier.borderColor, boxShadow: `0 4px 20px ${tier.color}33` } : {}}
                >
                  {isActive && (
                    <div className="loyalty-tier-current-label" style={{ background: tier.color }}>
                      Current Tier
                    </div>
                  )}
                  <div className="loyalty-tier-icon" style={{ color: tier.color }}>
                    {tier.icon}
                  </div>
                  <h3 className="loyalty-tier-name" style={{ color: tier.color }}>{tier.name}</h3>
                  <div className="loyalty-tier-range">{tier.range}</div>
                  <ul className="loyalty-tier-benefits">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="loyalty-tier-benefit">
                        <CheckCircle2 size={15} style={{ color: tier.color, flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ paddingBottom: '40px' }} />
      </div>
    </div>
  );
};

export default Loyalty;
