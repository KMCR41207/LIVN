// Bulk import all products from IndiGlam collection via Shopify JSON API
// Fetches all pages (30 per page) and inserts new products into MongoDB
require('dotenv').config();
const https = require('https');
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Map Shopify product_type to LIVN category
function mapCategory(productType) {
  const map = {
    'Kurta Set with Dupatta': 'Kurta Set with Dupatta',
    'Kurta Set':              'Kurta Set',
    'Kurta':                  'Kurta',
    'Co-ord Set':             'Co-ord Set',
  };
  return map[productType] || productType || 'Kurta Set';
}

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const url = `https://www.indisangam.com/collections/indiglam/products.json?limit=30&page=${page}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).products || []); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function importAll() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB\n');

  let page = 1;
  let totalFetched = 0;
  let created = 0;
  let skipped = 0;
  let updated = 0;

  while (true) {
    console.log('Fetching page', page, '...');
    const products = await fetchPage(page);
    if (!products.length) break;
    totalFetched += products.length;

    for (const p of products) {
      const name = p.title;
      const category = mapCategory(p.product_type);
      const firstVariant = p.variants[0];
      const price = parseFloat(firstVariant.compare_at_price) || parseFloat(firstVariant.price);
      const offer_price = parseFloat(firstVariant.price);
      const images = p.images.map(img => img.src);
      const image = images[0] || '';

      // Strip HTML tags from description
      const description = (p.body_html || '').replace(/<[^>]*>/g, '').trim();

      const existing = await Product.findOne({ name });

      if (!existing) {
        await Product.create({ name, category, price, offer_price, image, images, description });
        console.log('  Created:', name);
        created++;
      } else {
        // Update images and prices if they changed
        await Product.updateOne({ name }, {
          $set: { images, image, price, offer_price, category, description }
        });
        console.log('  Updated:', name);
        updated++;
        skipped++;
      }
    }

    if (products.length < 30) break; // last page
    page++;
    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n--- Done ---');
  console.log('Total fetched from IndiGlam:', totalFetched);
  console.log('New products created:', created);
  console.log('Existing products updated:', updated - created);

  await mongoose.disconnect();
  process.exit(0);
}

importAll().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
