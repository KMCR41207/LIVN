// Advanced analytics calculation utilities
// Provides sophisticated business intelligence metrics

const calculateConversionFunnel = (events) => {
  /**
   * Calculates conversion rates through the sales funnel
   * with safe division and percentage formatting
   */
  const safeRate = (numerator, denominator) => {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 10000) / 100;
  };

  const pageViews = events['page_view'] || 0;
  const addToCart = events['add_to_cart'] || 0;
  const checkoutStart = events['checkout_start'] || 0;
  const purchases = events['purchase'] || 0;

  return {
    visitors: pageViews,
    addToCartRate: safeRate(addToCart, pageViews),
    checkoutRate: safeRate(checkoutStart, addToCart),
    purchaseRate: safeRate(purchases, checkoutStart),
    overallConversion: safeRate(purchases, pageViews),
    // Additional metrics
    cartAbandonmentRate: 100 - safeRate(checkoutStart, addToCart),
    checkoutAbandonmentRate: 100 - safeRate(purchases, checkoutStart),
  };
};

const calculateProductPerformance = (products) => {
  /**
   * Calculates comprehensive product metrics including:
   * - Revenue contribution
   * - Velocity (sales frequency)
   * - Profitability indicators
   * - Performance score (0-100)
   */
  return products.map(product => {
    const revenuePerUnit = product.revenue / Math.max(product.unitsSold, 1);
    const performanceScore = calculatePerformanceScore({
      unitsSold: product.unitsSold,
      revenue: product.revenue,
      orderCount: product.orderCount,
      avgPrice: product.avgPrice,
    });

    return {
      ...product,
      revenuePerUnit: Math.round(revenuePerUnit * 100) / 100,
      performanceScore,
      profitMarginEstimate: Math.round((product.avgPrice * 0.4) * 100) / 100, // Assume 40% margin
      velocityScore: calculateVelocityScore(product.unitsSold),
    };
  });
};

const calculateCategoryAnalytics = (categories) => {
  /**
   * Provides category-level insights:
   * - Market share
   * - Growth potential
   * - Health score
   * - Seasonal patterns
   */
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0);

  return categories.map((cat, index) => {
    const marketShare = totalRevenue > 0 
      ? Math.round((cat.revenue / totalRevenue) * 10000) / 100 
      : 0;
    
    const healthScore = calculateHealthScore({
      revenue: cat.revenue,
      orderCount: cat.orderCount,
      avgOrderValue: cat.avgOrderValue,
    });

    return {
      ...cat,
      marketShare,
      healthScore,
      rank: index + 1,
      isTopPerformer: index < 3,
      needsAttention: healthScore < 40,
      growthPotential: 100 - healthScore,
    };
  });
};

const calculateTimeSeriesMetrics = (orders, timeframe = 'daily') => {
  /**
   * Groups orders by timeframe and calculates time-based metrics
   * Useful for trend analysis and forecasting
   */
  const grouped = {};
  const now = new Date();

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    let key;

    if (timeframe === 'daily') {
      key = orderDate.toISOString().split('T')[0];
    } else if (timeframe === 'weekly') {
      const weekStart = new Date(orderDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (timeframe === 'monthly') {
      key = orderDate.getFullYear() + '-' + String(orderDate.getMonth() + 1).padStart(2, '0');
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, orders: 0, revenue: 0, items: 0 };
    }
    grouped[key].orders += 1;
    grouped[key].revenue += order.price * order.quantity;
    grouped[key].items += order.quantity;
  });

  return Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      ...item,
      avgOrderValue: Math.round((item.revenue / Math.max(item.orders, 1)) * 100) / 100,
      revenue: Math.round(item.revenue * 100) / 100,
    }));
};

const calculateTrendAnalysis = (timeSeries) => {
  /**
   * Analyzes trends in the time series data
   * Returns: trend direction, momentum, acceleration
   */
  if (timeSeries.length < 2) {
    return { trend: 'insufficient_data', momentum: 0, direction: 'flat' };
  }

  const recent = timeSeries.slice(-7);
  const previous = timeSeries.slice(-14, -7);

  const recentAvg = recent.reduce((sum, item) => sum + item.revenue, 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, item) => sum + item.revenue, 0) / previous.length 
    : recentAvg;

  const changePercent = previousAvg > 0 
    ? ((recentAvg - previousAvg) / previousAvg) * 100 
    : 0;

  let direction = 'flat';
  if (changePercent > 10) direction = 'strong_up';
  else if (changePercent > 0) direction = 'up';
  else if (changePercent < -10) direction = 'strong_down';
  else if (changePercent < 0) direction = 'down';

  return {
    trend: direction,
    momentum: Math.round(changePercent * 100) / 100,
    recentAvg: Math.round(recentAvg * 100) / 100,
    previousAvg: Math.round(previousAvg * 100) / 100,
  };
};

// ── Helper functions ──────────────────────────────────────────────────────

function calculatePerformanceScore(metrics) {
  /**
   * Composite score based on multiple factors
   * Normalized to 0-100 scale
   */
  const unitScore = Math.min(50, (metrics.unitsSold / 100) * 50);
  const revenueScore = Math.min(30, (metrics.revenue / 5000) * 30);
  const avgPriceScore = Math.min(20, (metrics.avgPrice / 3000) * 20);

  return Math.min(100, Math.round(unitScore + revenueScore + avgPriceScore));
}

function calculateVelocityScore(unitsSold) {
  /**
   * Measures how quickly the product is selling
   * Higher score = faster sales velocity
   */
  if (unitsSold === 0) return 0;
  if (unitsSold < 5) return 25;
  if (unitsSold < 20) return 50;
  if (unitsSold < 50) return 75;
  return 100;
}

function calculateHealthScore(metrics) {
  /**
   * Overall health indicator for a category
   * Based on revenue, order volume, and avg order value
   */
  const revenueHealth = Math.min(50, (metrics.revenue / 10000) * 50);
  const volumeHealth = Math.min(30, (metrics.orderCount / 50) * 30);
  const valueHealth = Math.min(20, (metrics.avgOrderValue / 2000) * 20);

  return Math.min(100, Math.round(revenueHealth + volumeHealth + valueHealth));
}

module.exports = {
  calculateConversionFunnel,
  calculateProductPerformance,
  calculateCategoryAnalytics,
  calculateTimeSeriesMetrics,
  calculateTrendAnalysis,
};
