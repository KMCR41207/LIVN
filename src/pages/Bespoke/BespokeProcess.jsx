import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Ruler, Scissors, Palette, Users, PackageCheck } from 'lucide-react';
import './BespokeProcess.css';

const BespokeProcess = () => {
  const processSteps = [
    {
      icon: <Calendar size={48} />,
      title: "Consultation",
      duration: "Step 1",
      description: "Begin your journey with a personal consultation. Our design experts discuss your vision, occasion, style preferences, and requirements.",
      details: [
        "One-on-one meeting with master designer",
        "Discussion of occasion and requirements",
        "Style preference assessment",
        "Budget and timeline planning",
        "Initial design sketches"
      ]
    },
    {
      icon: <Ruler size={48} />,
      title: "Measurements",
      duration: "Step 2",
      description: "Precision is everything. We capture 25+ measurements using digital scanning technology and traditional hand measurements.",
      details: [
        "Digital 3D body scanning",
        "25+ precise measurements",
        "Posture and fit analysis",
        "Movement and comfort assessment",
        "Personal measurement record created"
      ]
    },
    {
      icon: <Palette size={48} />,
      title: "Fabric Selection",
      duration: "Step 3",
      description: "Choose from over 5,000 premium fabrics. Our fabric consultants guide you through materials, weights, and textures.",
      details: [
        "Access to 5,000+ premium fabrics",
        "Italian wool, Indian silk, Egyptian cotton",
        "Fabric weight and texture consultation",
        "Color matching with occasion",
        "Sample swatches provided"
      ]
    },
    {
      icon: <Scissors size={48} />,
      title: "Design Studio",
      duration: "Step 4",
      description: "Your unique pattern is created from scratch. Master craftsmen begin the hand-cutting and initial assembly process.",
      details: [
        "Custom pattern created for your body",
        "Hand-cutting by master craftsmen",
        "Traditional construction techniques",
        "Quality control at every stage",
        "Attention to every detail"
      ]
    },
    {
      icon: <Users size={48} />,
      title: "Fittings",
      duration: "Step 5",
      description: "Multiple fitting sessions ensure absolute perfection. We refine every detail until you're completely satisfied.",
      details: [
        "First fitting: shape and structure",
        "Second fitting: refinements and adjustments",
        "Final fitting: perfection check",
        "Unlimited adjustments included",
        "Personal notes for future orders"
      ]
    },
    {
      icon: <PackageCheck size={48} />,
      title: "Delivery",
      duration: "Step 6",
      description: "Your masterpiece is delivered with complimentary care instructions and lifetime alterations guarantee.",
      details: [
        "Premium packaging and presentation",
        "Complete care instructions",
        "Lifetime alterations included",
        "Complimentary garment care kit",
        "Personal styling consultation"
      ]
    }
  ];

  return (
    <div className="bespoke-process-page">
      {/* Hero Section */}
      <section className="process-hero">
        <div className="container">
          <h1 className="process-hero-title">The Bespoke Journey</h1>
          <p className="process-hero-subtitle">
            From First Consultation to Final Masterpiece
          </p>
          <p className="process-hero-description">
            Our comprehensive process ensures every garment is crafted to absolute perfection. 
            Each step is designed to capture your vision and create a truly unique piece.
          </p>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="section-padding timeline-overview">
        <div className="container">
          <h2 className="section-title">Complete Steps</h2>
          <div className="timeline-visual">
            <div className="timeline-bar"></div>
            <div className="timeline-points">
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-label">Step 1</div>
                <div className="point-desc">Consultation & Measurements</div>
              </div>
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-label">Step 2</div>
                <div className="point-desc">Fabric Selection</div>
              </div>
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-label">Step 3</div>
                <div className="point-desc">Pattern & Construction</div>
              </div>
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-label">Step 4</div>
                <div className="point-desc">Fittings & Refinement</div>
              </div>
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-label">Step 5</div>
                <div className="point-desc">Final Touches & Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Process Steps */}
      <section className="section-padding process-steps">
        <div className="container">
          <h2 className="section-title">Step-by-Step Process</h2>
          <div className="steps-container">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="step-visual">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-number">{index + 1}</div>
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.title}</h3>
                    <span className="step-duration">{step.duration}</span>
                  </div>
                  <p className="step-description">{step.description}</p>
                  <ul className="step-details">
                    {step.details.map((detail, idx) => (
                      <li key={idx}>✓ {detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="section-padding what-different">
        <div className="container">
          <h2 className="section-title">What Makes LIVN Bespoke Different</h2>
          <div className="grid grid-cols-2 different-grid">
            <div className="different-card">
              <h3>Traditional Craftsmanship</h3>
              <p>
                Our master tailors combine 30+ years of heritage Indian craftsmanship with 
                modern precision technology. Every garment is hand-finished using techniques 
                passed down through generations.
              </p>
            </div>
            <div className="different-card">
              <h3>Digital Precision</h3>
              <p>
                We use advanced 3D body scanning technology alongside traditional measurements 
                to ensure absolute accuracy. Your measurements are stored for all future orders.
              </p>
            </div>
            <div className="different-card">
              <h3>Unlimited Options</h3>
              <p>
                Choose from over 5,000 premium fabrics sourced from the world's finest mills. 
                Every design element is customizable - from collar style to button thread color.
              </p>
            </div>
            <div className="different-card">
              <h3>Lifetime Guarantee</h3>
              <p>
                We guarantee the perfect fit with unlimited alterations for the lifetime of 
                the garment. Your satisfaction is our commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="section-padding pricing-info">
        <div className="container">
          <h2 className="section-title">Investment & Pricing</h2>
          <div className="pricing-content">
            <div className="pricing-intro">
              <p>
                Bespoke garments are a significant investment in quality, fit, and personal style. 
                Our pricing reflects the extensive craftsmanship, premium materials, and personalized 
                service that goes into every piece.
              </p>
            </div>
            <div className="grid grid-cols-3 pricing-cards">
              <div className="pricing-card">
                <h3>Kurtis & Tops</h3>
                <div className="price">₹8,000 - ₹20,000</div>
                <ul>
                  <li>Premium fabric selection</li>
                  <li>2 fittings</li>
                  <li>Hand-finished details</li>
                  <li>Lifetime alterations</li>
                </ul>
              </div>
              <div className="pricing-card featured">
                <div className="featured-badge">Most Popular</div>
                <h3>Lehenga & Saree</h3>
                <div className="price">₹40,000 - ₹2,50,000</div>
                <ul>
                  <li>Luxury silk & zari fabrics</li>
                  <li>3-4 fittings</li>
                  <li>Custom embroidery</li>
                  <li>Premium embellishments</li>
                  <li>Lifetime alterations</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Dresses & Co-ords</h3>
                <div className="price">₹15,000 - ₹60,000</div>
                <ul>
                  <li>Contemporary fabrics</li>
                  <li>2-3 fittings</li>
                  <li>Modern design options</li>
                  <li>Lifetime care</li>
                </ul>
              </div>
            </div>
            <div className="pricing-note">
              <p>
                <strong>What's Included:</strong> Personal consultation, precision measurements, 
                unlimited fabric access, multiple fittings, hand-finishing by master craftsmen, 
                lifetime alterations, complimentary care kit, and garment storage service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Begin CTA */}
      <section className="section-padding ready-begin">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Begin Your Bespoke Journey?</h2>
            <p>
              Schedule your complimentary consultation today and experience the luxury 
              of perfect tailoring
            </p>
            <div className="cta-buttons">
              <Link to="/bespoke/consultation" className="btn btn-gold btn-large">
                Book Consultation
                <ArrowRight size={20} />
              </Link>
              <Link to="/bespoke/measurements" className="btn btn-outline btn-large">
                Take Measurements
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeProcess;
