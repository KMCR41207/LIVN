// Load .env from backend/ folder in local dev only
// On Railway (production), env vars are injected directly — no .env file needed
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Serve React Build ───────────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// All non-API routes → React index.html (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Start server with resilient DB handling in development.
// In production we require a working MONGO_URI; in dev we try Atlas first,
// then local MongoDB, then an in-memory MongoDB fallback.
async function startServer() {
  const tryConnect = async (uri) => {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${uri}`);
  };

  try {
    if (process.env.MONGO_URI) {
      await tryConnect(process.env.MONGO_URI);
    } else {
      throw new Error('No MONGO_URI');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    // In development, try a local MongoDB instance before falling back to memory.
    const localUri = 'mongodb://127.0.0.1:27017/livn';
    try {
      console.log('Trying local MongoDB at', localUri);
      await tryConnect(localUri);
    } catch (localErr) {
      console.warn('Local MongoDB failed:', localErr.message);
      try {
        const os = require('os');
        const tmpDir = path.join(os.tmpdir(), 'mongodb-memory-server');
        process.env.MONGOMS_DOWNLOAD_DIR = tmpDir;
        process.env.MONGOMS_DOWNLOAD_TIMEOUT = '120000';

        console.log('Starting in-memory MongoDB for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'livn' },
          binary: { downloadDir: tmpDir },
        });
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('✅ Connected to in-memory MongoDB');
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr.message);
        process.exit(1);
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 App running on port ${PORT}`)
  );
}

startServer().catch((err) => {
  console.error('Fatal start error:', err);
  process.exit(1);
});
