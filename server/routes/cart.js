const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyAccessToken } = require('./auth');

const router = express.Router();

// Middleware to verify access token on all cart routes
router.use(verifyAccessToken);

/**
 * GET /api/cart
 * Get user's cart
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        subtotal: 0,
      });
    }

    return res.status(200).json({
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.name,
          price: item.price,
          offerPrice: item.offerPrice,
          quantity: item.quantity,
          size: item.size,
          image: item.image,
          addedAt: item.addedAt,
        })),
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
        updatedAt: cart.updatedAt,
      },
      error: null,
    });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/cart/add
 * Add item to cart
 */
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, offerPrice, quantity, size, image } = req.body;

    if (!productId || !price || !quantity) {
      return res.status(400).json({
        data: null,
        error: 'productId, price, and quantity are required',
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if item already exists with same size
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.size === (size || 'Standard')
    );

    if (existingItem) {
      // Increase quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name,
        price,
        offerPrice,
        quantity,
        size: size || 'Standard',
        image,
        addedAt: new Date(),
      });
    }

    await cart.save();

    return res.status(201).json({
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
        message: 'Item added to cart',
      },
      error: null,
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/cart/items/:itemId
 * Update item quantity
 */
router.patch('/items/:itemId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        data: null,
        error: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ data: null, error: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ data: null, error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
        message: 'Item quantity updated',
      },
      error: null,
    });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/cart/items/:itemId
 * Remove item from cart
 */
router.delete('/items/:itemId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ data: null, error: 'Cart not found' });
    }

    cart.items.id(itemId).deleteOne();
    await cart.save();

    return res.status(200).json({
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
        message: 'Item removed from cart',
      },
      error: null,
    });
  } catch (err) {
    console.error('Remove item error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ data: null, error: 'Cart not found' });
    }

    cart.items = [];
    cart.subtotal = 0;
    await cart.save();

    return res.status(200).json({
      data: {
        _id: cart._id,
        items: [],
        subtotal: 0,
        itemCount: 0,
        message: 'Cart cleared',
      },
      error: null,
    });
  } catch (err) {
    console.error('Clear cart error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/cart/merge
 * Merge localStorage cart with database cart on login
 */
router.post('/merge', async (req, res) => {
  try {
    const userId = req.user.id;
    const { localItems } = req.body;

    if (!Array.isArray(localItems)) {
      return res.status(400).json({
        data: null,
        error: 'localItems must be an array',
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Merge items: database items take precedence, add any new items from localStorage
    localItems.forEach(localItem => {
      const exists = cart.items.some(
        dbItem =>
          dbItem.productId.toString() === localItem.productId &&
          dbItem.size === (localItem.size || 'Standard')
      );

      if (!exists) {
        cart.items.push({
          productId: localItem.productId,
          name: localItem.name,
          price: localItem.price,
          offerPrice: localItem.offerPrice,
          quantity: localItem.quantity,
          size: localItem.size || 'Standard',
          image: localItem.image,
          addedAt: new Date(),
        });
      }
    });

    await cart.save();

    return res.status(200).json({
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
        message: 'Cart merged successfully',
      },
      error: null,
    });
  } catch (err) {
    console.error('Merge cart error:', err);
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
