import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="temple-footer">
      <div className="temple-divider"></div>
      
      <div className="container footer-content grid grid-cols-4">
        <div className="footer-brand">
          <h3 className="footer-logo">LIVN</h3>
          <p className="footer-desc">
            Modern fashion for the woman who moves with intention. Clean lines, premium fabrics, effortless style.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><Instagram /></a>
            <a href="#" aria-label="Facebook"><Facebook /></a>
            <a href="#" aria-label="Twitter"><Twitter /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/#collections">New Arrivals</Link></li>
            <li><Link to="/#collections">Dresses</Link></li>
            <li><Link to="/#collections">Co-ords & Sets</Link></li>
            <li><Link to="/#custom-stitching">Custom Fit</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Assistance</h4>
          <ul>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Reach Us</h4>
          <ul>
            <li>
              <MapPin size={18} />
              <span>108 Fashion Avenue, Mumbai, MH 400001</span>
            </li>
            <li>
              <Phone size={18} />
              <span>+91 98765 43210</span>
            </li>
            <li>
              <Mail size={18} />
              <span>namaste@LIVN.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LIVN. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
