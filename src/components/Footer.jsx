import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { CurtainLink } from './ui/PageCurtain';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="temple-footer">
      <div className="temple-divider"></div>
      
      <div className="container footer-content grid grid-cols-4">
        <div className="footer-brand">
          <h3 className="footer-logo">Livaani</h3>
          <p className="footer-desc">
            Modern fashion for the woman who moves with intention. Clean lines, premium fabrics, effortless style.
          </p>
          <div className="social-links">
            <a href="https://instagram.com/livaani" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
            <a href="https://facebook.com/livaani" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook /></a>
            <a href="https://twitter.com/livaani" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><CurtainLink to="/collections">Collections</CurtainLink></li>
            <li><CurtainLink to="/new-arrivals">New Arrivals</CurtainLink></li>
            <li><CurtainLink to="/bespoke">Bespoke Tailoring</CurtainLink></li>
            <li><CurtainLink to="/bespoke/process">The Process</CurtainLink></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Assistance</h4>
          <ul>
            <li><CurtainLink to="/track-order">Track Order</CurtainLink></li>
            <li><CurtainLink to="/shipping-returns">Shipping &amp; Returns</CurtainLink></li>
            <li><CurtainLink to="/referral">Refer a Friend</CurtainLink></li>
            <li><CurtainLink to="/loyalty">Loyalty Program</CurtainLink></li>
            <li><CurtainLink to="/rewards">Rewards Points</CurtainLink></li>
            <li><CurtainLink to="/whatsapp">WhatsApp Alerts</CurtainLink></li>
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
              <span>+91 {import.meta.env.VITE_WHATSAPP_NUMBER ? import.meta.env.VITE_WHATSAPP_NUMBER.replace('91','') : '98765 43210'}</span>
            </li>
            <li>
              <Mail size={18} />
              <span>namaste@livaani.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Livaani. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
