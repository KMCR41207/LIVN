const mongoose = require('mongoose');
const path = require('path');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Faq = require('../models/Faq');
const Testimonial = require('../models/Testimonial');
const ContactMessage = require('../models/ContactMessage');

const sampleFaqs = [
  {
    question: 'What is the return policy?',
    answer: 'We offer a 7-day return policy for all items purchased. The garment must be unused and in original packaging. Shipping costs are non-refundable.',
    order: 0,
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days within India. Express shipping is available for 2-3 business days delivery at an additional charge.',
    order: 1,
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Yes, we ship internationally to most countries. International shipping typically takes 10-15 business days. International customers are responsible for any customs duties.',
    order: 2,
  },
  {
    question: 'Can I customize my order?',
    answer: 'Absolutely! We offer custom sizing and personalization. Contact our team with your requirements, and we can create a unique piece just for you.',
    order: 3,
  },
  {
    question: 'What fabrics do you use?',
    answer: 'We use premium quality fabrics including cotton, silk, linen, and blended fabrics. All materials are ethically sourced and comfortable for the Indian climate.',
    order: 4,
  },
  {
    question: 'How do I take accurate measurements?',
    answer: 'We provide a detailed measurement guide on each product page. Use a soft measuring tape and measure over your regular clothing. Please refer to our size chart for the best fit.',
    order: 5,
  },
];

const sampleTestimonials = [
  {
    author: 'Priya Sharma',
    content: 'I absolutely love my kurta from LIVAANI! The quality is excellent and the fit is perfect. The customer service was very helpful. Highly recommended!',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
  {
    author: 'Anjali Verma',
    content: 'Best traditional wear I\'ve found online. The colors are vibrant, the fabric is soft, and delivery was quick. Will definitely order again!',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
  },
  {
    author: 'Meera Patel',
    content: 'The saree I ordered exceeded my expectations. The embroidery is beautiful and the overall craftsmanship is impressive. Worth every penny!',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
  },
  {
    author: 'Sneha Gupta',
    content: 'Great collection and very affordable. I received my order within 3 days. The packaging was also very nice. Definitely a 5-star experience!',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
  },
  {
    author: 'Ritika Singh',
    content: 'Loved the quality and the design. The kurti fits perfectly and the colors are exactly as shown in the pictures. Will be ordering more!',
    rating: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ritika',
  },
  {
    author: 'Divya Kapoor',
    content: 'Excellent customer service and amazing products. Had an issue with my first order, but they resolved it immediately. Very impressed!',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya',
  },
];

async function seedDatabase() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI is not set in backend/.env');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');

    // Clear existing data (optional - comment out to preserve data)
    console.log('🧹 Clearing existing FAQs...');
    await Faq.deleteMany({});
    console.log('✅ FAQs cleared');

    console.log('🧹 Clearing existing Testimonials...');
    await Testimonial.deleteMany({});
    console.log('✅ Testimonials cleared');

    // Insert sample FAQs
    console.log('📝 Inserting sample FAQs...');
    const insertedFaqs = await Faq.insertMany(sampleFaqs);
    console.log(`✅ ${insertedFaqs.length} FAQs created`);
    console.log('FAQs:');
    insertedFaqs.forEach((faq, idx) => {
      console.log(`  ${idx + 1}. ${faq.question}`);
    });

    // Insert sample Testimonials
    console.log('\n📝 Inserting sample Testimonials...');
    const insertedTestimonials = await Testimonial.insertMany(sampleTestimonials);
    console.log(`✅ ${insertedTestimonials.length} Testimonials created`);
    console.log('Testimonials:');
    insertedTestimonials.forEach((testimonial, idx) => {
      console.log(`  ${idx + 1}. "${testimonial.content.substring(0, 50)}..." - ${testimonial.author}`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log(`  • FAQs: ${await Faq.countDocuments()}`);
    console.log(`  • Testimonials: ${await Testimonial.countDocuments()}`);
    console.log(`  • Contact Messages: ${await ContactMessage.countDocuments()}`);

    await mongoose.disconnect();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
