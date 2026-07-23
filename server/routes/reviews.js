const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Try to use multer if available, otherwise skip image uploads
let upload = null;
try {
  const multer = require('multer');
  const path = require('path');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/reviews'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });
} catch (e) {
  console.warn('Multer not installed, image uploads will be skipped');
}

// POST /api/reviews — create a new review
router.post(
  '/',
  protect,
  upload ? upload.array('images', 5) : (req, res, next) => next(),
  async (req, res) => {
    try {
      const { orderId, rating, review, productId } = req.body;

      if (!orderId || !rating || !review) {
        return res.status(400).json({
          error: 'Missing required fields: orderId, rating, review',
        });
      }

      // Verify order belongs to user and is delivered
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.userId?.toString() !== req.user.id && order.customer_email !== req.user.email) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (order.status?.toLowerCase() !== 'delivered') {
        return res.status(400).json({ error: 'Can only review delivered orders' });
      }

      // Check if already reviewed
      const existingReview = await Review.findOne({ userId: req.user.id, orderId });
      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this order' });
      }

      // Prepare image paths
      const imagePaths = (req.files || []).map(file => `/uploads/reviews/${file.filename}`);

      // Create review
      const newReview = await Review.create({
        userId: req.user.id,
        orderId,
        productId: productId || order.product_id,
        productName: order.product_name,
        rating: parseInt(rating, 10),
        review,
        images: imagePaths,
      });

      res.status(201).json({ data: newReview, error: null });
    } catch (err) {
      console.error('Review creation error:', err);
      res.status(500).json({ data: null, error: err.message });
    }
  }
);

// GET /api/reviews/my — get reviews by logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ data: reviews, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/reviews/product/:productId — get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'approved',
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ data: reviews, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/reviews — all reviews (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reviews = await Review.find(filter)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({ data: reviews, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/reviews/:id — update review (admin moderation)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: rejectionReason || '' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ data: review, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/reviews/:id — delete review (user or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // User can delete their own, admin can delete any
    const isAdmin = req.user.role === 'admin';
    const isOwner = review.userId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ data: null, error: null, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/reviews/:id/helpful — mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ data: review, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
