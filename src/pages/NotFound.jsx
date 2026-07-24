import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 — Page Not Found | Livaani';
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-heading)',
    }}>
      <div style={{ fontSize: '6rem', lineHeight: 1, color: 'var(--color-gold-base)', marginBottom: '16px' }}>✦</div>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-maroon-dark)', margin: '0 0 12px', letterSpacing: '4px' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '32px', fontFamily: 'var(--font-body)' }}>
        This page wandered off the runway. Let's bring you back.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/collections" className="btn btn-outline">Browse Collections</Link>
      </div>
    </div>
  );
};

export default NotFound;
