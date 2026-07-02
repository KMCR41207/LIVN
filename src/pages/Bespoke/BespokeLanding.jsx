import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { GlassCard } from '../../components/GlassEffect';
import './BespokeLanding.css';

const BespokeLanding = () => {
  const [selectedFaq, setSelectedFaq] = useState(null);
  const timelineRef = useRef(null);
  const [revealedSteps, setRevealedSteps] = useState([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.35
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepIndex = parseInt(entry.target.dataset.step);
          setRevealedSteps(prev => {
            if (!prev.includes(stepIndex)) {
              return [...prev, stepIndex].sort((a, b) => a - b);
            }
            return prev;
          });
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item) => {
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "Ananya S.",
      role: "Bridal Client",
      rating: 5,
      text: "The attention to detail in my bridal lehenga was extraordinary. Every measurement was perfect, and the silk quality exceeded my expectations.",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&q=80"
    },
    {
      name: "Priya Sharma",
      role: "Wedding Client",
      rating: 5,
      text: "LIVN created my dream wedding saree. The craftsmanship and personalized service made me feel like royalty throughout the entire process.",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&q=80"
    },
    {
      name: "Meera Kapoor",
      role: "Festive Wear Client",
      rating: 5,
      text: "From consultation to final fitting, the bespoke experience was seamless. My anarkali suit was crafted exactly as I envisioned.",
      image: "https://images.unsplash.com/photo-1614644610535-4a9d09acac5f?w=150&h=150&fit=crop&q=80"
    }
  ];

  const gallery = [
    "/images/bespoke/ethnic1.jpg",
    "/images/bespoke/ethnic2.jpg",
    "/images/bespoke/ethnic3.jpeg",
    "/images/category_sleeveless_kurti.jpeg",
    "/images/category_corset_kurti.jpeg",
    "/images/category_halter_neck_kurti.jpeg"
  ];

  const faqs = [
    {
      question: "What is bespoke tailoring?",
      answer: "Bespoke tailoring is the highest level of custom clothing. Each garment is created from scratch based on your unique measurements, preferences, and style. Unlike ready-to-wear or made-to-measure, bespoke involves multiple fittings and complete personalization of every detail."
    },
    {
      question: "How long does the bespoke process take?",
      answer: "The complete bespoke journey typically takes 6-8 weeks from initial consultation to final delivery. This includes design consultation, measurement sessions, fabric selection, multiple fittings, and final adjustments to ensure absolute perfection."
    },
    {
      question: "What is included in the bespoke price?",
      answer: "Our bespoke pricing includes: personal design consultation, precision measurements with digital scanning, unlimited fabric and design options, multiple fitting sessions, hand-finishing by master craftsmen, lifetime alterations, and complimentary care kit."
    },
    {
      question: "Can I choose any fabric?",
      answer: "Yes! We offer access to over 5,000 premium fabrics from the world's finest mills including Italian wool, Indian silk, Egyptian cotton, and exclusive imported materials. Our fabric consultants will help you select the perfect material for your vision and occasion."
    },
    {
      question: "Do you offer virtual consultations?",
      answer: "Absolutely. We provide detailed video consultations where our designers guide you through the entire process. We can also arrange for fabric swatches to be sent to your location. However, for measurements, an in-person visit or partnership with a local tailor is recommended for best results."
    }
  ];

  return (
    <div className="bespoke-landing">
      {/* Hero Section */}
      <section className="bespoke-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1 className="hero-title">Bespoke Perfection</h1>
          <p className="hero-subtitle">
            Where Your Vision Meets Master Craftsmanship
          </p>
          <p className="hero-description">
            Experience the pinnacle of luxury tailoring. Each garment is uniquely crafted 
            to your exact measurements, personal style, and refined taste.
          </p>
          <div className="hero-cta">
            <Link to="/bespoke/process" className="btn btn-gold btn-large">
              Begin Your Journey
              <ArrowRight size={20} />
            </Link>
            <Link to="/bespoke/consultation" className="btn btn-outline btn-large">
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* What is Bespoke Section */}
      <section className="section-padding what-is-bespoke">
        <div className="container">
          <h2 className="section-title">What is Bespoke?</h2>
          <div className="bespoke-grid">
            <div className="bespoke-content">
              <p className="lead-text">
                Bespoke represents the zenith of personalized fashion. Unlike off-the-rack 
                or even made-to-measure, a bespoke garment is created entirely from your 
                unique specifications.
              </p>
              <div className="bespoke-features">
                <div className="feature-item">
                  <CheckCircle className="feature-icon" />
                  <div>
                    <h4>Unique Pattern</h4>
                    <p>Created from scratch specifically for your body</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle className="feature-icon" />
                  <div>
                    <h4>Multiple Fittings</h4>
                    <p>2-3 fitting sessions to ensure absolute perfection</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle className="feature-icon" />
                  <div>
                    <h4>Complete Control</h4>
                    <p>Every detail customized to your preferences</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle className="feature-icon" />
                  <div>
                    <h4>Master Craftsmen</h4>
                    <p>Hand-finished by artisans with decades of experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bespoke-image">
              <img 
                src="/images/bespoke/ethnic3.jpeg"
                alt="Indian bespoke tailoring - Lehenga"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="section-padding why-choose">
        <div className="container">
          <h2 className="section-title">Why Choose LIVN Bespoke?</h2>
          <div className="grid grid-cols-3 why-cards">
            <div className="why-card">
              <div className="why-icon">✨</div>
              <h3>Heritage Craftsmanship</h3>
              <p>
                Our master tailors bring over 30 years of traditional Indian craftsmanship, 
                combined with modern precision techniques and digital measurement technology.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🎨</div>
              <h3>Unlimited Customization</h3>
              <p>
                From fabric selection to button placement, every element is yours to design. 
                Choose from 5,000+ premium fabrics and infinite style possibilities.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">👔</div>
              <h3>Perfect Fit Guarantee</h3>
              <p>
                We guarantee the perfect fit with multiple fittings and lifetime alterations. 
                Your garment will fit like a second skin, tailored precisely to your body.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="timeline" ref={timelineRef}>
            <div 
              className={`timeline-item ${revealedSteps.includes(1) ? 'revealed' : ''}`}
              data-step="1"
            >
              <div className="timeline-number">1</div>
              <div className="timeline-content">
                <h3>Consultation</h3>
                <p>Meet with our design experts to discuss your vision, occasion, and style preferences.</p>
              </div>
            </div>
            <div 
              className={`timeline-item ${revealedSteps.includes(2) ? 'revealed' : ''}`}
              data-step="2"
            >
              <div className="timeline-number">2</div>
              <div className="timeline-content">
                <h3>Measurements</h3>
                <p>Precision body scanning and measurements captured by our master tailors.</p>
              </div>
            </div>
            <div 
              className={`timeline-item ${revealedSteps.includes(3) ? 'revealed' : ''}`}
              data-step="3"
            >
              <div className="timeline-number">3</div>
              <div className="timeline-content">
                <h3>Fabric Selection</h3>
                <p>Choose from thousands of premium fabrics sourced from the world's finest mills.</p>
              </div>
            </div>
            <div 
              className={`timeline-item ${revealedSteps.includes(4) ? 'revealed' : ''}`}
              data-step="4"
            >
              <div className="timeline-number">4</div>
              <div className="timeline-content">
                <h3>Design & Craft</h3>
                <p>Your unique pattern is created and your garment is hand-crafted by artisans.</p>
              </div>
            </div>
            <div 
              className={`timeline-item ${revealedSteps.includes(5) ? 'revealed' : ''}`}
              data-step="5"
            >
              <div className="timeline-number">5</div>
              <div className="timeline-content">
                <h3>Fittings</h3>
                <p>Multiple fitting sessions ensure every detail is perfected to your satisfaction.</p>
              </div>
            </div>
            <div 
              className={`timeline-item ${revealedSteps.includes(6) ? 'revealed' : ''}`}
              data-step="6"
            >
              <div className="timeline-number">6</div>
              <div className="timeline-content">
                <h3>Delivery</h3>
                <p>Receive your masterpiece with lifetime alterations and complimentary care.</p>
              </div>
            </div>
          </div>
          <div className="cta-center">
            <Link to="/bespoke/process" className="btn btn-primary btn-large">
              Explore the Process
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding testimonials-section">
        <div className="container">
          <h2 className="section-title">Client Experiences</h2>
          <div className="grid grid-cols-3 testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <GlassCard key={index} variant="collection" dark={false} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--color-gold-base)" color="var(--color-gold-base)" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} loading="lazy" />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding gallery-section">
        <div className="container">
          <h2 className="section-title">Bespoke Gallery</h2>
          <p className="section-subtitle">A glimpse of our handcrafted masterpieces</p>
          <div className="gallery-grid">
            {gallery.map((image, index) => (
              <div key={index} className="gallery-item">
                <img src={image} alt={`Bespoke creation ${index + 1}`} loading="lazy" />
                <div className="gallery-overlay">
                  <span>View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${selectedFaq === index ? 'active' : ''}`}
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                  <span className="faq-icon">{selectedFaq === index ? '−' : '+'}</span>
                </div>
                {selectedFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding final-cta">
        <div className="container">
          <GlassCard variant="cta" dark={false} className="cta-box">
            <h2>Ready to Create Your Masterpiece?</h2>
            <p>Begin your bespoke journey today and experience the luxury of perfect tailoring</p>
            <div className="cta-buttons">
              <Link to="/bespoke/consultation" className="btn btn-gold btn-large">
                Book Consultation
              </Link>
              <Link to="/bespoke/measurements" className="btn btn-outline btn-large">
                Start Your Measurements
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default BespokeLanding;
