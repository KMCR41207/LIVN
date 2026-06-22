import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const CATEGORIES = [
  { name: 'Sleeveless Kurti', image: '/images/category_sleeveless_kurti.jpeg' },
  { name: 'Full Sleeve Kurti', image: '/images/category_full_sleeve_kurti.jpeg' },
  { name: 'Corset Kurti', image: '/images/category_corset_kurti.jpeg' },
  { name: 'Noodle Strap Kurti', image: '/images/category_noodle_strap_kurti.jpeg' },
  { name: 'Halter Neck Kurti', image: '/images/category_halter_neck_kurti.jpeg' },
];

const Home = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/collections?category=${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };
  // Reveal animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src="/images/hero_banner.png" alt="LIVN Premium Collection" className="hero-bg-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content container reveal-on-scroll">
          <h1 className="hero-title">Dress the Part</h1>
          <p className="hero-subtitle">Elevate your everyday style with modern elegance and effortless confidence.</p>
          <div className="hero-actions">
            <Link to="/collections" className="btn btn-gold">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Temple Divider */}
      <div className="temple-divider"></div>

      {/* Categories Section */}
      <section id="collections" className="categories-section section-padding container">
        <div className="section-header reveal-on-scroll">
          <h2 className="section-title">Shop by Style</h2>
          <p className="section-desc">Explore modern kurti styles designed for every mood and occasion.</p>
        </div>
        
        <div className="category-grid grid grid-cols-5">
          {CATEGORIES.map((cat, index) => (
            <div
              key={index}
              className="category-card reveal-on-scroll"
              style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="category-img-container">
                <img src={cat.image} alt={cat.name} className="category-img" loading="lazy" />
                <div className="category-border"></div>
              </div>
              <h3 className="category-name">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <div className="temple-divider-sm container"><div className="carving-line"></div></div>

      {/* Bespoke/Custom Stitching */}
      <section id="custom-stitching" className="bespoke-section">
        <div className="bespoke-bg"></div>
        <div className="container bespoke-content grid grid-cols-2">
          <div className="bespoke-text reveal-on-scroll">
            <h2 className="section-title" style={{color: 'var(--color-maroon-dark)'}}>Made to Measure</h2>
            <p className="bespoke-desc">
              Tailoring that moves with you. Every cut, seam, and silhouette is crafted precisely to your measurements — because fit is everything.
            </p>
            <ul className="bespoke-features">
              <li>✦ Perfect Fit Guarantee</li>
              <li>✦ Premium Fabric Selection</li>
              <li>✦ Express Delivery Available</li>
            </ul>
            <Link to="/#collections" className="btn btn-primary" style={{marginTop: '20px'}}>Book a Fitting</Link>
          </div>
          <div className="bespoke-image-container reveal-on-scroll" style={{ animationDelay: '0.2s' }}>
            <img src="/images/bespoke_model.png" alt="Custom Stitching" className="bespoke-img" style={{objectPosition: 'top'}} />
            <div className="gold-frame"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section section-padding container">
        <div className="section-header reveal-on-scroll">
          <h2 className="section-title">What They're Saying</h2>
          <div className="temple-ornament"></div>
        </div>
        
        <div className="testimonials-grid grid grid-cols-3">
          {[
            { name: "Ananya S.", text: "The quality is unreal. Every piece feels intentional, premium, and effortlessly stylish." },
            { name: "Priya R.", text: "The custom fit service is flawless. Got exactly what I envisioned on the first try." },
            { name: "Meera V.", text: "I wore their dress to a rooftop event and the compliments didn't stop. Truly premium." }
          ].map((test, index) => (
            <div key={index} className="testimonial-card reveal-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="quote-mark">“</div>
              <p className="testimonial-text">{test.text}</p>
              <h4 className="testimonial-name">— {test.name}</h4>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
