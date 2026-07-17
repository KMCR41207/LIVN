const express = require('express');
const router = express.Router();

// Mock analytics data for development
const mockAnalyticsData = {
  conversionFunnel: [
    { stage: 'Page Views', count: 15420 },
    { stage: 'Product Views', count: 8340 },
    { stage: 'Add to Cart', count: 2145 },
    { stage: 'Checkout', count: 1289 },
    { stage: 'Purchase', count: 856 },
  ],
  salesByProduct: [
    { name: 'Bespoke Saree', sales: 45000, orders: 12 },
    { name: 'Lehenga', sales: 32000, orders: 8 },
    { name: 'Kurti', sales: 28500, orders: 15 },
    { name: 'Ethnic Fusion', sales: 18200, orders: 5 },
  ],
  trafficSources: [
    { source: 'Direct', visits: 5200 },
    { source: 'Organic Search', visits: 4800 },
    { source: 'Instagram', visits: 3200 },
    { source: 'Facebook', visits: 1500 },
    { source: 'Email', visits: 720 },
  ],
  deviceBreakdown: [
    { device: 'Mobile', users: 8900, percentage: 62 },
    { device: 'Desktop', users: 4500, percentage: 31 },
    { device: 'Tablet', users: 900, percentage: 7 },
  ],
};

/**
 * GET /api/analytics/dashboard
 * Returns analytics dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    res.json({
      data: mockAnalyticsData,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message,
    });
  }
});

/**
 * GET /api/analytics/report
 * Returns detailed analytics report with optional date range
 */
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // In a real app, you'd query actual analytics data
    // For now, return mock data with date range info
    const report = {
      dateRange: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate || new Date(),
      },
      summary: {
        totalVisits: 15420,
        totalRevenue: 123700,
        totalOrders: 40,
        avgOrderValue: 3092.50,
        conversionRate: 5.5,
      },
      ...mockAnalyticsData,
    };

    res.json({
      data: report,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message,
    });
  }
});

/**
 * POST /api/analytics/events
 * Track analytics events (public endpoint)
 */
router.post('/events', async (req, res) => {
  try {
    const { event, page, userId } = req.body;

    if (!event || typeof event !== 'string' || !event.trim()) {
      return res.status(400).json({
        error: 'Event name is required and must be a non-empty string',
      });
    }

    // In a real app, save to database
    // For now, just acknowledge receipt
    res.status(201).json({
      data: {
        event: event.trim(),
        page: page || 'unknown',
        userId: userId || null,
        timestamp: new Date(),
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
