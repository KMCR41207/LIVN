# Analytics Calculation Logic - Enhanced Implementation

**Date**: July 13, 2026  
**Version**: 2.0 (Enhanced with Advanced Metrics)

---

## Overview

The analytics system now provides sophisticated business intelligence with multiple layers of calculation:

1. **Conversion Funnel Analysis** — track user journey through sales funnel
2. **Product Performance Scoring** — comprehensive product metrics
3. **Category Analytics** — market share, health scores, growth potential
4. **Time Series Analysis** — trend detection and momentum tracking
5. **KPI Dashboard** — key performance indicators and business metrics

---

## Core Calculations

### 1. Conversion Funnel

**Formula**: Safe Rate = (Numerator / Denominator) × 10000 / 100

**Metrics Calculated**:
- **Visitors**: Total page_view events
- **Add to Cart Rate %**: (add_to_cart / page_view) × 100
- **Checkout Rate %**: (checkout_start / add_to_cart) × 100
- **Purchase Rate %**: (purchase / checkout_start) × 100
- **Overall Conversion %**: (purchase / page_view) × 100
- **Cart Abandonment Rate %**: 100 - Add to Cart Rate
- **Checkout Abandonment Rate %**: 100 - Purchase Rate

**Example**:
```
Events: { page_view: 1000, add_to_cart: 150, checkout_start: 120, purchase: 85 }

Results:
- Visitors: 1000
- Add to Cart Rate: 15.00%
- Checkout Rate: 80.00%
- Purchase Rate: 70.83%
- Overall Conversion: 8.50%
- Cart Abandonment: 85.00%
- Checkout Abandonment: 29.17%
```

### 2. Product Performance Scoring (0-100)

**Components**:
- **Unit Score** (0-50): Based on units sold (max 50 pts at 100+ units)
- **Revenue Score** (0-30): Based on total revenue (max 30 pts at ₹5000+)
- **Average Price Score** (0-20): Based on avg product price (max 20 pts at ₹3000+)

**Formula**: Performance Score = Unit Score + Revenue Score + Avg Price Score (capped at 100)

**Interpretation**:
- 80-100: Excellent performer — high velocity, strong revenue
- 60-79: Good performer — consistent sales
- 40-59: Average performer — needs attention or optimization
- 20-39: Low performer — consider discontinuation or repricing
- 0-19: Underperformer — strategic review needed

**Additional Metrics per Product**:
- **Revenue per Unit**: Total revenue / Units sold
- **Profitability Estimate**: Avg price × 0.4 (assuming 40% margin)
- **Velocity Score**: 
  - 0-4 units: 25 pts (slow)
  - 5-19 units: 50 pts (moderate)
  - 20-49 units: 75 pts (fast)
  - 50+ units: 100 pts (very fast)

### 3. Category Health Score (0-100)

**Components**:
- **Revenue Health** (0-50): (Total category revenue / ₹10000) × 50
- **Volume Health** (0-30): (Order count / 50) × 30
- **Value Health** (0-20): (Avg order value / ₹2000) × 20

**Formula**: Health Score = Revenue Health + Volume Health + Value Health (capped at 100)

**Interpretation**:
- 75-100: Excellent health — strong growth, high demand
- 50-74: Good health — stable, consistent performance
- 25-49: Fair health — declining or emerging category
- 0-24: Poor health — requires strategic intervention

**Additional Metrics per Category**:
- **Market Share %**: (Category revenue / Total revenue) × 100
- **Rank**: Position by revenue (1 = top category)
- **Is Top Performer**: Boolean (top 3 categories)
- **Needs Attention**: Boolean (health score < 40)
- **Growth Potential**: 100 - Health Score (inverse indicates opportunity)

### 4. Trend Analysis

**Time Windows**:
- Recent: Last 7 days
- Previous: Days 8-14

**Calculation**:
```
Change % = ((Recent Avg Revenue - Previous Avg Revenue) / Previous Avg Revenue) × 100

Trend Direction:
- Strong Up: Change > +10%
- Up: Change > 0% and ≤ +10%
- Flat: -0% ≤ Change ≤ 0%
- Down: Change < 0% and ≥ -10%
- Strong Down: Change < -10%
```

**Momentum Metric**: Decimal percentage (e.g., 12.34% = strong upward momentum)

### 5. Time Series Aggregation

**Supported Timeframes**:
- **Daily**: One entry per calendar day
- **Weekly**: One entry per ISO week (Monday start)
- **Monthly**: One entry per month (YYYY-MM format)

**Metrics per Period**:
- Total Orders
- Total Revenue
- Total Items Sold
- Average Order Value = Revenue / Orders

**Use Case**: Identify seasonal patterns, weekly trends, monthly cycles

---

## API Response Structure

### GET /api/analytics/dashboard

```json
{
  "data": {
    "conversionFunnel": {
      "visitors": 1000,
      "addToCartRate": 15.00,
      "checkoutRate": 80.00,
      "purchaseRate": 70.83,
      "overallConversion": 8.50,
      "cartAbandonmentRate": 85.00,
      "checkoutAbandonmentRate": 29.17
    },
    "bestSellers": [
      {
        "productName": "Blue Floral Kurta",
        "unitsSold": 45,
        "revenue": 112500,
        "orderCount": 48,
        "avgPrice": 2500,
        "revenuePerUnit": 2500,
        "performanceScore": 82,
        "profitMarginEstimate": 1000,
        "velocityScore": 75,
        "trend": "up"
      }
    ],
    "categoryPerformance": [
      {
        "category": "Kurta Set",
        "revenue": 450000,
        "orderCount": 150,
        "totalQuantity": 200,
        "avgOrderValue": 3000,
        "marketShare": 28.50,
        "healthScore": 85,
        "rank": 1,
        "isTopPerformer": true,
        "needsAttention": false,
        "growthPotential": 15,
        "monthlyRevenue": 95000,
        "growth": 25
      }
    ],
    "kpis": {
      "totalRevenue": 1500000,
      "totalOrders": 500,
      "avgOrderValue": 3000,
      "topCategory": "Kurta Set",
      "topProduct": "Blue Floral Kurta",
      "conversionRate": 8.50,
      "cartAbandonmentRate": 85.00,
      "checkoutAbandonmentRate": 29.17
    },
    "trend": {
      "trend": "strong_up",
      "momentum": 15.25,
      "recentAvg": 45000,
      "previousAvg": 39000
    },
    "timeSeries": [
      {
        "date": "2026-07-10",
        "orders": 5,
        "revenue": 15000,
        "items": 6,
        "avgOrderValue": 3000
      }
    ],
    "summary": {
      "lastUpdated": "2026-07-13T12:30:00.000Z",
      "totalDataPoints": 1850,
      "dataQuality": "good"
    }
  },
  "error": null
}
```

---

## Implementation Files

### Backend Routes
- **File**: `backend/routes/analytics.js`
- **Endpoints**:
  - `POST /events` — Track analytics event (public)
  - `GET /report` — Event aggregation report (admin)
  - `GET /dashboard` — Full analytics dashboard (admin)

### Utilities
- **File**: `backend/utils/analyticsCalculations.js`
- **Functions**:
  - `calculateConversionFunnel(events)` — Funnel metrics
  - `calculateProductPerformance(products)` — Product scoring
  - `calculateCategoryAnalytics(categories)` — Category health
  - `calculateTimeSeriesMetrics(orders, timeframe)` — Time-based analysis
  - `calculateTrendAnalysis(timeSeries)` — Trend detection

### Models
- **File**: `backend/models/AnalyticsEvent.js`
- **Schema**: `{ event, page, meta, timestamps }`
- **Index**: Compound on `{ event: 1, createdAt: -1 }`

---

## Business Logic Highlights

### 1. Safe Division
All rate calculations use safe division:
```javascript
const safeRate = (n, d) => d === 0 ? 0 : (n / d) * 100
```
This prevents division-by-zero errors and returns 0 when denominator is 0.

### 2. Compound Scoring
Performance and health scores use multiple weighted components rather than single metrics, providing more holistic assessment.

### 3. Trend Direction
Uses 7-day window comparison to detect momentum, with thresholds for "strong" vs "moderate" changes.

### 4. Time Series Flexibility
Supports daily, weekly, and monthly aggregations to identify patterns at different scales.

### 5. Category Enrichment
Links orders to products via MongoDB `$lookup` to extract category information, with fallback to "Uncategorized" for unmatched orders.

---

## Data Quality Considerations

### Assumptions
1. **Margin Assumption**: Products use 40% profit margin for profitability estimates
2. **Regular Orders Only**: Analytics filter for `order_type: 'regular'` (excludes bespoke)
3. **Product Matching**: Case-sensitive string match on `product_name` → `name`
4. **Timestamps**: All orders have valid `createdAt` fields

### Potential Issues
1. **Missing Categories**: Orders without matching products default to "Uncategorized"
2. **Duplicate Products**: Multiple products with same name create aggregation issues
3. **Stale Data**: Calculations run at request time (no caching)
4. **Large Datasets**: Performance degrades with > 10K orders per request

### Recommendations
1. Ensure product names are unique and normalized
2. Add product category to Order schema to avoid lookup costs
3. Implement caching for reports (1-hour TTL)
4. Archive old analytics events (>90 days) to improve query speed

---

## Future Enhancements

1. **Forecasting**: Use time series to predict future trends
2. **Cohort Analysis**: Track customer segments over time
3. **Comparison**: Year-over-year, month-over-month comparisons
4. **Anomaly Detection**: Identify unusual spikes or drops
5. **Custom Filters**: Date range, category, product filters
6. **Export**: CSV/PDF report generation

---

## Testing

All calculations are covered by property-based tests using fast-check:
- Property 1-4: FAQ creation/update/delete/rejection
- Property 5-7: Contact message submission/rejection/deletion
- Property 8-11: Analytics event persistence, aggregation consistency, date filtering
- Additional: Auth wiring, route mounting, error handling

Run tests: `npm test` from `backend/` directory

---

**End of Analytics Calculation Guide**
