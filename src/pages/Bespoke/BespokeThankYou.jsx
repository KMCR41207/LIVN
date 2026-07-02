import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Mail, Phone, Home } from 'lucide-react';
import './BespokeThankYou.css';

const BespokeThankYou = () => {
  useEffect(() => {
    // Clear bespoke data from localStorage
    localStorage.removeItem('bespokeMeasurements');
    localStorage.removeItem('bespokeFabric');
    localStorage.removeItem('bespokeDesign');
    localStorage.removeItem('bespokeConsultation');
  }, []);

  return (
    <div className="bespoke-thankyou-page">
      <section className="thankyou-hero">
        <div className="container">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1>Thank You!</h1>
          <p className="hero-subtitle">Your Bespoke Journey Has Begun</p>
          <p className="confirmation-text">
            We've received your consultation request and our team will contact you within 24 hours 
            to confirm your appointment and discuss next steps.
          </p>
        </div>
      </section>

      <section className="section-padding next-steps-section">
        <div className="container">
          <h2>What Happens Next?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">1</div>
              <h3>Confirmation Call</h3>
              <p>Our team will call you within 24 hours to confirm your consultation appointment and answer any questions.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">2</div>
              <h3>Consultation Day</h3>
              <p>Meet with our master tailors for measurements, fabric selection, and design consultation.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">3</div>
              <h3>Crafting Begins</h3>
              <p>Your unique pattern is created and our artisans begin handcrafting your bespoke garment.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">4</div>
              <h3>Fitting Sessions</h3>
              <p>Multiple fitting appointments to ensure every detail is perfect to your satisfaction.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">5</div>
              <h3>Final Delivery</h3>
              <p>Receive your masterpiece with lifetime alterations and complimentary care instructions.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">6</div>
              <h3>Ongoing Support</h3>
              <p>Enjoy lifetime alterations and care support for your bespoke garment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding contact-section">
        <div className="container">
          <h2>Need Assistance?</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <Mail size={32} />
              <h4>Email Us</h4>
              <p>bespoke@livn.com</p>
            </div>
            <div className="contact-card">
              <Phone size={32} />
              <h4>Call Us</h4>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-card">
              <Calendar size={32} />
              <h4>Reschedule</h4>
              <p>Contact us anytime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Continue Exploring</h2>
            <p>While you wait, explore our ready-to-wear collections</p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary btn-large">
                <Home size={20} />
                Return Home
              </Link>
              <Link to="/collections" className="btn btn-outline btn-large">
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeThankYou;
