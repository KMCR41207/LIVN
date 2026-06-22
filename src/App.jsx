import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import Collections from './pages/Collections';
import NewArrivals from './pages/NewArrivals';
import Admin from './pages/Admin';
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
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
