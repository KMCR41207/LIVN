// Test if product API is working
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testAPI() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const allProducts = await Product.find();
    console.log(`📊 Total products in database: ${allProducts.length}\n`);

    // Find Blue Floral product
    const blueFloral = await Product.findOne({ name: /Blue Floral/i });
    if (blueFloral) {
      console.log('✅ Blue Floral Kurta found in database!');
      console.log(`   Name: ${blueFloral.name}`);
      console.log(`   Category: ${blueFloral.category}`);
      console.log(`   Price: ₹${blueFloral.price}`);
      console.log(`   Offer: ₹${blueFloral.offer_price}`);
      console.log(`   Images: ${blueFloral.images.length}`);
    } else {
      console.log('❌ Blue Floral Kurta NOT found');
    }

    // Count by category
    console.log('\n📂 Products by category:');
    const categories = await Product.distinct('category');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat });
      console.log(`   ${cat}: ${count}`);
    }

    console.log('\n✨ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAPI();
