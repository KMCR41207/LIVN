// Import script for Blue Floral Stripe Lace Trim Cotton Kurta Set
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product');

// Product data
const productData = {
  name: 'Blue Floral Stripe Lace Trim Cotton Kurta Set',
  category: 'Cotton Kurtas',
  sku: 'IS/KS-BLUEFLORALSTRIPE-S',
  price: 3399,
  offer_price: 2549,
  image: 'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-main.jpg',
  images: [
    'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-main.jpg',
    'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-side.jpg',
    'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-detail.jpg',
    'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-fabric.jpg',
    'https://images.indisangam.com/collections/indiglam/blue-floral-stripe-kurta-styling.jpg',
  ],
  description: 'Elegant blue floral stripe kurta set with beautiful lace trim. Perfect for casual and semi-formal occasions. Made from high-quality cotton fabric with coordinated bottom.',
};

async function importProduct() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📝 Importing product...');
    const product = await Product.create(productData);
    console.log('✅ Product successfully inserted');
    console.log('\n📦 Product Details:');
    console.log(`  ID: ${product._id}`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Category: ${product.category}`);
    console.log(`  Price: ₹${product.price}`);
    console.log(`  Offer Price: ₹${product.offer_price}`);
    console.log(`  Images: ${product.images.length} images`);
    console.log(`  Created: ${product.createdAt}`);

    console.log('\n✨ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing product:', error.message);
    process.exit(1);
  }
}

importProduct();
