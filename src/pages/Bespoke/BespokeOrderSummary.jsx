import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { createOrder, getCurrentUser } from '../../lib/api';
import './BespokeOrderSummary.css';

const BespokeOrderSummary = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const measurements = JSON.parse(localStorage.getItem('bespokeMeasurements') || '{}');
    const fabric = JSON.parse(localStorage.getItem('bespokeFabric') || '{}');
    const design = JSON.parse(localStorage.getItem('bespokeDesign') || '{}');
    const consultation = JSON.parse(localStorage.getItem('bespokeConsultation') || '{}');

    setOrderData({ measurements, fabric, design, consultation });
  }, []);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');

    try {
      const user = getCurrentUser();
      
      const estimatedPrice = (orderData.fabric?.price || 0) + 15000;
      
      const bespokeOrder = {
        order_type:     'bespoke',
        customer_name:  orderData.measurements?.fullName || 'Guest',
        customer_email: orderData.measurements?.email    || user?.email || '',
        customer_phone: orderData.measurements?.phone    || '',

        measurements:  orderData.measurements,
        fabric:        {
          name:   orderData.fabric?.name,
          origin: orderData.fabric?.origin,
          weight: orderData.fabric?.weight,
          price:  orderData.fabric?.price,
          image:  orderData.fabric?.image,
        },
        design:        orderData.design,
        consultation:  orderData.consultation,

        total_amount: estimatedPrice,
        status:       'consultation_pending',
      };

      const { data, error: orderError } = await createOrder(bespokeOrder);

      if (orderError) {
        throw new Error(orderError);
      }

      console.log('Bespoke order created:', data);
      
      // Navigate to thank you page
      navigate('/bespoke/thank-you');
    } catch (err) {
      console.error('Error creating bespoke order:', err);
      setError('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedPrice = (orderData.fabric?.price || 0) + 15000; // Base price + fabric

  return (
    <div className="bespoke-summary-page">
      <section className="summary-hero">
        <div className="container">
          <h1>Order Summary</h1>
          <p>Review your bespoke order details</p>
        </div>
      </section>

      <section className="section-padding summary-section">
        <div className="container">
          <div className="summary-grid">
            <div className="summary-details">
              <div className="detail-card">
                <h3>Personal Information</h3>
                <div className="detail-row">
                  <span>Name:</span>
                  <strong>{orderData.measurements?.fullName}</strong>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <strong>{orderData.measurements?.email}</strong>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <strong>{orderData.measurements?.phone}</strong>
                </div>
              </div>

              <div className="detail-card">
                <h3>Fabric Selection</h3>
                <div className="fabric-preview">
                  <img src={orderData.fabric?.image} alt={orderData.fabric?.name} />
                  <div>
                    <h4>{orderData.fabric?.name}</h4>
                    <p>{orderData.fabric?.origin} • {orderData.fabric?.weight}</p>
                    <p className="price">₹{orderData.fabric?.price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3>Design Specifications</h3>
                <div className="design-specs">
                  <div className="spec-row">
                    <span>Garment:</span>
                    <strong>{orderData.design?.garmentType}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Style:</span>
                    <strong>{orderData.design?.style}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Lapel:</span>
                    <strong>{orderData.design?.lapel}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Buttons:</span>
                    <strong>{orderData.design?.buttons}</strong>
                  </div>
                  {orderData.design?.extras?.length > 0 && (
                    <div className="spec-row">
                      <span>Extras:</span>
                      <strong>{orderData.design.extras.join(', ')}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-card">
                <h3>Consultation Booking</h3>
                <div className="detail-row">
                  <span>Type:</span>
                  <strong>{orderData.consultation?.consultationType}</strong>
                </div>
                {orderData.consultation?.location && (
                  <div className="detail-row">
                    <span>Location:</span>
                    <strong>{orderData.consultation.location}</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>Date:</span>
                  <strong>{orderData.consultation?.date}</strong>
                </div>
                <div className="detail-row">
                  <span>Time:</span>
                  <strong>{orderData.consultation?.time}</strong>
                </div>
              </div>
            </div>

            <div className="summary-sidebar">
              <div className="price-card">
                <h3>Order Total</h3>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Fabric Cost</span>
                    <span>₹{orderData.fabric?.price?.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>Tailoring & Craftsmanship</span>
                    <span>₹15,000</span>
                  </div>
                  <div className="price-row subtotal">
                    <span>Subtotal</span>
                    <span>₹{estimatedPrice.toLocaleString()}</span>
                  </div>
                  <div className="price-row total">
                    <span>Estimated Total</span>
                    <span>₹{estimatedPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="included-list">
                  <h4>Included:</h4>
                  <ul>
                    <li><Check size={16} /> Multiple fittings</li>
                    <li><Check size={16} /> Lifetime alterations</li>
                    <li><Check size={16} /> Premium finishing</li>
                    <li><Check size={16} /> Care kit included</li>
                  </ul>
                </div>
                {error && <p className="error-message" style={{color: 'var(--color-error)', marginBottom: '15px', fontSize: '0.9rem'}}>{error}</p>}
                <button 
                  onClick={handleConfirm} 
                  className="btn btn-gold btn-large btn-full"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Confirm Order'}
                </button>
                <p className="payment-note">Payment will be collected after consultation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BespokeOrderSummary;
