const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectToDatabase } = require('./config/database');
const app = require('./server');

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/products',     require('./routes/products'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/faqs',         require('./routes/faqs'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact',      require('./routes/contact'));

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ No MONGO_URI in backend/.env');
  process.exit(1);
}

connectToDatabase(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });
