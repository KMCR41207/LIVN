import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import Collections from './pages/Collections';
import NewArrivals from './pages/NewArrivals';
import Admin from './pages/Admin';
import TrackOrder from './pages/TrackOrder';
import ShippingReturns from './pages/ShippingReturns';
import BespokeLanding from './pages/Bespoke/BespokeLanding';
import BespokeProcess from './pages/Bespoke/BespokeProcess';
import BespokeMeasurements from './pages/Bespoke/BespokeMeasurements';
import BespokeFabrics from './pages/Bespoke/BespokeFabrics';
import BespokeDesign from './pages/Bespoke/BespokeDesign';
import BespokeConsultation from './pages/Bespoke/BespokeConsultation';
import BespokeOrderSummary from './pages/Bespoke/BespokeOrderSummary';
import BespokeThankYou from './pages/Bespoke/BespokeThankYou';
import { CartProvider } from './context/CartContext';

import './index.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* Bespoke Routes */}
              <Route path="/bespoke" element={<BespokeLanding />} />
              <Route path="/bespoke/process" element={<BespokeProcess />} />
              <Route path="/bespoke/measurements" element={<BespokeMeasurements />} />
              <Route path="/bespoke/fabrics" element={<BespokeFabrics />} />
              <Route path="/bespoke/design" element={<BespokeDesign />} />
              <Route path="/bespoke/consultation" element={<BespokeConsultation />} />
              <Route path="/bespoke/summary" element={<BespokeOrderSummary />} />
              <Route path="/bespoke/thank-you" element={<BespokeThankYou />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
