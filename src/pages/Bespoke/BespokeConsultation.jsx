import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import './BespokeConsultation.css';

const BespokeConsultation = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState({
    date: '',
    time: '',
    location: 'hyderabad',
    consultationType: 'virtual',
    notes: ''
  });

  const locations = [
    { id: 'hyderabad', name: 'Hyderabad Studio', address: 'Banjara Hills, Hyderabad' },
    { id: 'warangal', name: 'Warangal Studio', address: 'Hanamkonda, Warangal' }
  ];

  const timeSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (booking.consultationType === 'in-person') return;
    localStorage.setItem('bespokeConsultation', JSON.stringify(booking));
    navigate('/bespoke/summary');
  };

  return (
    <div className="bespoke-consultation-page">
      <section className="consultation-hero">
        <div className="container">
          <h1>Book Your Consultation</h1>
          <p>Schedule a meeting with our master tailors</p>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="container">
          <div className="progress-steps">
            <div className="progress-step completed"><div className="step-circle">✓</div><span>Measurements</span></div>
            <div className="progress-line active"></div>
            <div className="progress-step completed"><div className="step-circle">✓</div><span>Fabrics</span></div>
            <div className="progress-line active"></div>
            <div className="progress-step completed"><div className="step-circle">✓</div><span>Design</span></div>
            <div className="progress-line active"></div>
            <div className="progress-step active"><div className="step-circle">4</div><span>Consultation</span></div>
          </div>
        </div>
      </div>

      <section className="section-padding consultation-section">
        <div className="container">
          <form onSubmit={handleSubmit} className="consultation-form">
            <div className="form-card">
              <h3>Consultation Type</h3>
              <div className="type-options">
                <label className={`type-card ${booking.consultationType === 'in-person' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="in-person"
                    checked={booking.consultationType === 'in-person'}
                    onChange={(e) => setBooking({...booking, consultationType: e.target.value})}
                  />
                  <div className="type-content">
                    <MapPin size={32} />
                    <h4>In-Person Visit</h4>
                    <span className="coming-soon-badge">Coming Soon</span>
                    <p>Visit our studio for complete measurements and fabric selection</p>
                  </div>
                </label>
                <label className={`type-card ${booking.consultationType === 'virtual' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="virtual"
                    checked={booking.consultationType === 'virtual'}
                    onChange={(e) => setBooking({...booking, consultationType: e.target.value})}
                  />
                  <div className="type-content">
                    <Calendar size={32} />
                    <h4>Virtual Consultation</h4>
                    <p>Video call with our designers from the comfort of your home</p>
                  </div>
                </label>
              </div>
            </div>

            {booking.consultationType === 'in-person' && (
              <div className="form-card">
                <h3>Select Location</h3>
                <div className="location-grid">
                  {locations.map(loc => (
                    <label key={loc.id} className={`location-card ${booking.location === loc.id ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="location"
                        value={loc.id}
                        checked={booking.location === loc.id}
                        onChange={(e) => setBooking({...booking, location: e.target.value})}
                      />
                      <div>
                        <h4>{loc.name}</h4>
                        <p>{loc.address}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-card">
              <h3>Select Date & Time</h3>
              <div className="datetime-grid">
                <div className="form-group">
                  <label><Calendar size={18} /> Date</label>
                  <input
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking({...booking, date: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label><Clock size={18} /> Time Slot</label>
                  <select
                    value={booking.time}
                    onChange={(e) => setBooking({...booking, time: e.target.value})}
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>Additional Notes</h3>
              <textarea
                value={booking.notes}
                onChange={(e) => setBooking({...booking, notes: e.target.value})}
                placeholder="Any special requirements or questions..."
                rows="4"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-large btn-full"
              disabled={booking.consultationType === 'in-person'}
            >
              Review & Confirm
              <ArrowRight size={20} />
            </button>

            {booking.consultationType === 'in-person' && (
              <div className="inperson-block-notice">
                🚫 In-Person consultations are not available yet. Please select <strong>Virtual Consultation</strong> to proceed.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default BespokeConsultation;
