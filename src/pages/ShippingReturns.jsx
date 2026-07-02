import { useEffect } from 'react';
import { Truck, RotateCcw, Clock, ShieldCheck, Package, Phone } from 'lucide-react';
import './ShippingReturns.css';

const Section = ({ icon, title, children }) => (
  <div className="sr-section">
    <div className="sr-section-header">
      <div className="sr-icon">{icon}</div>
      <h2 className="sr-section-title">{title}</h2>
    </div>
    <div className="sr-section-body">{children}</div>
  </div>
);

const ShippingReturns = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="shipping-returns-page container">
      <div className="sr-header">
        <h1>Shipping & Returns</h1>
        <p>Everything you need to know about how we deliver and our hassle-free return policy.</p>
      </div>

      <div className="sr-content">

        {/* Delivery */}
        <Section icon={<Truck size={28} />} title="Delivery">
          <div className="sr-grid">
            <div className="sr-card">
              <h4>Standard Delivery</h4>
              <p className="sr-days">5 – 7 Business Days</p>
              <p>Available across India. Free shipping on all orders.</p>
            </div>
            <div className="sr-card">
              <h4>Express Delivery</h4>
              <p className="sr-days">2 – 3 Business Days</p>
              <p>Available in major cities. Contact us to arrange express dispatch.</p>
            </div>
            <div className="sr-card">
              <h4>Custom / Bespoke Orders</h4>
              <p className="sr-days">10 – 14 Business Days</p>
              <p>Custom stitched garments require additional preparation time before dispatch.</p>
            </div>
          </div>
          <div className="sr-note">
            <ShieldCheck size={16} />
            <span>All orders are dispatched from Mumbai, Maharashtra. Delivery times are estimates and may vary slightly based on location and courier availability.</span>
          </div>
        </Section>

        {/* Delivery Partner */}
        <Section icon={<Package size={28} />} title="Our Delivery Partner">
          <p className="sr-text">
            We partner with <strong>Delhivery</strong> and <strong>DTDC</strong> for domestic shipments across India. For remote pin codes, we use <strong>India Post Speed Post</strong> to ensure last-mile delivery.
          </p>
          <ul className="sr-list">
            <li>✦ Full tracking available once your order is dispatched</li>
            <li>✦ You will receive a tracking link via WhatsApp / SMS on your registered phone number</li>
            <li>✦ Signature may be required at delivery for orders above ₹3,000</li>
          </ul>
        </Section>

        {/* Returns */}
        <Section icon={<RotateCcw size={28} />} title="Returns & Exchanges">
          <p className="sr-text">
            We want you to love every piece. If something isn't right, here's our policy:
          </p>
          <div className="sr-policy-grid">
            <div className="sr-policy-card eligible">
              <h4>✅ Eligible for Return / Exchange</h4>
              <ul className="sr-list">
                <li>Item received is damaged or defective</li>
                <li>Wrong item delivered</li>
                <li>Sizing issue (standard sizes only)</li>
                <li>Request raised within <strong>7 days</strong> of delivery</li>
              </ul>
            </div>
            <div className="sr-policy-card not-eligible">
              <h4>❌ Not Eligible for Return</h4>
              <ul className="sr-list">
                <li>Custom / bespoke stitched orders</li>
                <li>Items that have been worn, washed, or altered</li>
                <li>Items without original tags/packaging</li>
                <li>Sale or discounted items</li>
                <li>Requests raised after 7 days of delivery</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Return Process */}
        <Section icon={<Clock size={28} />} title="How to Raise a Return">
          <ol className="sr-steps">
            <li>
              <span className="sr-step-num">1</span>
              <div>
                <strong>Contact us within 7 days</strong> of receiving your order via WhatsApp or email with your Order ID and photos of the issue.
              </div>
            </li>
            <li>
              <span className="sr-step-num">2</span>
              <div>
                <strong>Our team reviews</strong> your request within 24–48 hours and approves or advises next steps.
              </div>
            </li>
            <li>
              <span className="sr-step-num">3</span>
              <div>
                <strong>Pack & ship back</strong> the item in original packaging. We'll share a return pickup arrangement if approved.
              </div>
            </li>
            <li>
              <span className="sr-step-num">4</span>
              <div>
                <strong>Exchange or store credit</strong> issued within 5–7 business days of receiving the return. We do not offer cash refunds — store credit or exchange only.
              </div>
            </li>
          </ol>
        </Section>

        {/* Contact */}
        <Section icon={<Phone size={28} />} title="Need Help?">
          <p className="sr-text">Reach out to us and we'll sort it out quickly:</p>
          <ul className="sr-contact-list">
            <li><strong>WhatsApp / Phone:</strong> +91 98765 43210</li>
            <li><strong>Email:</strong> namaste@livaani.com</li>
            <li><strong>Hours:</strong> Monday – Saturday, 10 AM – 7 PM IST</li>
          </ul>
        </Section>

      </div>
    </div>
  );
};

export default ShippingReturns;
