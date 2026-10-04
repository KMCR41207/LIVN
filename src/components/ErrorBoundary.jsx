import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          fontFamily: 'Georgia, serif',
          background: '#faf8f3',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#6b2323', marginBottom: '8px', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px' }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              style={{ padding: '12px 24px', background: '#b8962e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <Link to="/" style={{ padding: '12px 24px', background: 'transparent', color: '#b8962e', border: '2px solid #b8962e', borderRadius: '4px', textDecoration: 'none', fontFamily: 'inherit', fontSize: '1rem' }}>
              Go Home
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ marginTop: '24px', fontSize: '0.75rem', color: '#999', maxWidth: '600px', overflow: 'auto', textAlign: 'left', background: '#f0f0f0', padding: '12px', borderRadius: '4px' }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
