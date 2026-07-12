// Test admin delete functionality
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const jwt = require('jsonwebtoken');

async function testAdminDelete() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create or find admin user
    let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      adminUser = await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user found');
    }

    // Create test JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(`\n🔐 Generated admin token`);
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Find the Blue Floral product
    const product = await Product.findOne({ name: /Blue Floral/i });
    if (!product) {
      console.log('\n❌ Blue Floral product not found');
      process.exit(1);
    }

    console.log(`\n🎯 Target product for deletion test:`);
    console.log(`   ID: ${product._id}`);
    console.log(`   Name: ${product.name}`);

    // Simulate delete by calling Product.findByIdAndDelete
    console.log(`\n🗑️  Simulating delete...`);
    const deleted = await Product.findByIdAndDelete(product._id);
    if (deleted) {
      console.log(`✅ Product deleted successfully!`);
      console.log(`   Deleted: ${deleted.name}`);
    } else {
      console.log(`❌ Failed to delete product`);
    }

    // Verify deletion
    const stillExists = await Product.findById(product._id);
    if (stillExists) {
      console.log(`❌ Product still exists (delete failed)`);
    } else {
      console.log(`✅ Confirmed: Product removed from database`);
    }

    // Note: In production, you would re-import the product
    console.log(`\n💡 Test completed. Product can be re-imported if needed.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminDelete();
