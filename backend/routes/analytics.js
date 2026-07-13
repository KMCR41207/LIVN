const express = require('express');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const {
  calculateConversionFunnel,
  calculateProductPerformance,
  calculateCategoryAnalytics,
  calculateTimeSeriesMetrics,
  calculateTrendAnalysis,
} = require('../utils/analyticsCalculations');

const router = express.Router();

// ── Pure helper: compute conversion funnel rates from event counts ──────────
const computeConversionFunnel = (counts) => {
  const safeRate = (n, d) => d === 0 ? 0 : Math.round((n / d) * 10000) / 100;
  const pv = counts['page_view']      || 0;
  const ac = counts['add_to_cart']    || 0;
  const cs = counts['checkout_start'] || 0;
  const pu = counts['purchase']       || 0;
  return {
    visitors:          pv,
    addToCartRate:     safeRate(ac, pv),
    checkoutRate:      safeRate(cs, ac),
    purchaseRate:      safeRate(pu, cs),
    overallConversion: safeRate(pu, pv),
  };
};

// ── Helper: Calculate advanced metrics for best sellers ──────────────────────
const calculateAdvancedMetrics = (bestSellers, allOrders) => {
  const withPerf = calculateProductPerformance(bestSellers);
  return withPerf.map(seller => {
    const relatedOrders = allOrders.filter(o => o.product_name === seller.productName);
    const trend = calculateTrend(relatedOrders);
    return {
      ...seller,
      trend,
    };
  });
};

// ── Helper: Calculate trend direction (last 7 days vs previous 7 days) ──────
const calculateTrend = (orders) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const recent = orders.filter(o => o.createdAt && new Date(o.createdAt) >= sevenDaysAgo);
  const previous = orders.filter(o => o.createdAt && new Date(o.createdAt) >= fourteenDaysAgo && new Date(o.createdAt) < sevenDaysAgo);
  
  const recentRevenue = recent.reduce((sum, o) => sum + (o.price * o.quantity), 0);
  const prevRevenue = previous.reduce((sum, o) => sum + (o.price * o.quantity), 0);
  
  if (prevRevenue === 0) return recentRevenue > 0 ? 'up' : 'flat';
  const change = ((recentRevenue - prevRevenue) / prevRevenue) * 100;
  return change > 5 ? 'up' : change < -5 ? 'down' : 'flat';
};

// ── Helper: Calculate category metrics with performance scoring ──────────────
const enrichCategoryPerformance = (categories, allOrders) => {
  const enriched = calculateCategoryAnalytics(categories);
  return enriched.map((cat, idx) => {
    const categoryOrders = allOrders.filter(o => {
      const order_category = o.product_category || 'Uncategorized';
      return order_category === cat.category;
    });
    
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const monthlyOrders = categoryOrders.filter(o => o.createdAt && new Date(o.createdAt) >= thisMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
    
    return {
      ...cat,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      growth: categoryOrders.length > 0 ? Math.round((monthlyOrders.length / categoryOrders.length) * 100) : 0,
    };
  });
};

// ── POST /events — public, no auth required ────────────────────────────────
// Validates and stores an analytics event document
router.post('/events', async (req, res) => {
  try {
    const { event, page, meta } = req.body;
    if (!event || typeof event !== 'string' || event.trim() === '') {
      return res.status(400).json({ success: false, error: '`event` is required and must be a non-empty string' });
    }
    await AnalyticsEvent.create({ event: event.trim(), page, meta });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /report — admin only ───────────────────────────────────────────────
// Returns event counts per event name, optionally filtered by date range
router.get('/report', protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, event: '$_id', count: 1 } },
    ];

    const report = await AnalyticsEvent.aggregate(pipeline);
    res.status(200).json({ data: report, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// ── GET /dashboard — admin only ────────────────────────────────────────────
// Returns all three analytics sections with enhanced metrics
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [eventGroups, ordersData] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $group: { _id: '$event', count: { $sum: 1 } } },
      ]),
      Order.find({ order_type: 'regular' }).lean(),
    ]);

    // 1. CONVERSION FUNNEL using utility function
    const counts = {};
    eventGroups.forEach(g => { counts[g._id] = g.count; });
    const conversionFunnel = calculateConversionFunnel(counts);

    // 2. BEST SELLERS with enhanced metrics
    const bestSellersRaw = await Order.aggregate([
      { $match: { order_type: 'regular' } },
      {
        $group: {
          _id: '$product_name',
          unitsSold: { $sum: '$quantity' },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productName: '$_id',
          unitsSold: 1,
          revenue: 1,
          orderCount: 1,
          avgPrice: 1,
          averageRating: { $literal: 'N/A' },
        },
      },
    ]);
    
    const bestSellers = calculateAdvancedMetrics(bestSellersRaw, ordersData);

    // 3. CATEGORY PERFORMANCE with analytics
    const categoryPerformanceRaw = await Order.aggregate([
      { $match: { order_type: 'regular' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product_name',
          foreignField: 'name',
          as: 'productDoc',
        },
      },
      {
        $addFields: {
          category: {
            $ifNull: [
              { $arrayElemAt: ['$productDoc.category', 0] },
              'Uncategorized',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgOrderValue: { $avg: { $multiply: ['$price', '$quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          revenue: 1,
          orderCount: 1,
          totalQuantity: 1,
          avgOrderValue: 1,
        },
      },
    ]);
    
    const categoryPerformance = enrichCategoryPerformance(categoryPerformanceRaw, ordersData);

    // 4. TIME SERIES AND TREND ANALYSIS
    const timeSeries = calculateTimeSeriesMetrics(ordersData, 'daily');
    const trendAnalysis = calculateTrendAnalysis(timeSeries);

    // 5. KEY PERFORMANCE INDICATORS
    const totalRevenue = ordersData.reduce((sum, o) => sum + (o.price * o.quantity), 0);
    const totalOrders = ordersData.length;
    const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;
    const topCategory = categoryPerformance[0] || { category: 'N/A', revenue: 0 };
    const topProduct = bestSellers[0] || { productName: 'N/A', unitsSold: 0 };

    const kpis = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      avgOrderValue,
      topCategory: topCategory.category,
      topProduct: topProduct.productName,
      conversionRate: conversionFunnel.overallConversion,
      cartAbandonmentRate: conversionFunnel.cartAbandonmentRate,
      checkoutAbandonmentRate: conversionFunnel.checkoutAbandonmentRate,
    };

    res.status(200).json({
      data: {
        conversionFunnel,
        bestSellers,
        categoryPerformance,
        kpis,
        trend: trendAnalysis,
        timeSeries: timeSeries.slice(-30), // Last 30 days
        summary: {
          lastUpdated: new Date().toISOString(),
          totalDataPoints: ordersData.length + eventGroups.length,
          dataQuality: 'good',
        },
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
