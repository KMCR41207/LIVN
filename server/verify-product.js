// Verify product in database
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product');

async function verifyProduct() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Query for the product
    console.log('🔍 Searching for Blue Floral Stripe Kurta...');
    const product = await Product.findOne({ name: 'Blue Floral Stripe Lace Trim Cotton Kurta Set' });

    if (!product) {
      console.error('❌ Product not found in database');
      process.exit(1);
    }

    console.log('✅ Product found!\n');
    console.log('📦 Product Details:');
    console.log(`  ID: ${product._id}`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Category: ${product.category}`);
    console.log(`  Price: ₹${product.price}`);
    console.log(`  Offer Price: ₹${product.offer_price}`);
    console.log(`  Main Image: ${product.image ? '✅ Set' : '❌ Not set'}`);
    console.log(`  Additional Images: ${product.images.length}`);
    product.images.forEach((img, idx) => {
      console.log(`    ${idx + 1}. ${img.substring(0, 60)}...`);
    });
    console.log(`  Description: ${product.description.substring(0, 60)}...`);
    console.log(`  Created: ${product.createdAt}`);

    console.log('\n✨ Verification completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyProduct();
