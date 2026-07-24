import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Livaani — Modern Ethnic Fashion',
  '/collections': 'Collections — Livaani',
  '/bespoke': 'Bespoke Tailoring — Livaani',
  '/checkout': 'Checkout — Livaani',
  '/track-order': 'Track Order — Livaani',
  '/account': 'My Account — Livaani',
  '/profile': 'My Profile — Livaani',
  '/rewards': 'Rewards & Points — Livaani',
  '/referral': 'Refer & Earn — Livaani',
  '/loyalty': 'Loyalty Program — Livaani',
  '/shipping-returns': 'Shipping & Returns — Livaani',
  '/whatsapp': 'WhatsApp Alerts — Livaani',
  '/new-arrivals': 'New Arrivals — Livaani',
  '/admin': 'Admin Dashboard — Livaani',
};

const PageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = TITLES[pathname] || 'Livaani — Modern Ethnic Fashion';
    document.title = title;
  }, [pathname]);

  return null;
};

export default PageTitle;
