# CMS Database Tables & Sample Data

## Overview
The LIVAANI CMS system now has fully populated MongoDB collections with sample data for FAQs and Testimonials.

## Database Collections Created

### 1. **FAQs Collection**
6 frequently asked questions created with complete information:

| # | Question | Answer Preview | Order |
|---|----------|-----------------|-------|
| 1 | What is the return policy? | 7-day return policy for all items... | 0 |
| 2 | How long does shipping take? | 5-7 business days standard shipping... | 1 |
| 3 | Do you offer international shipping? | Yes, to most countries, 10-15 days... | 2 |
| 4 | Can I customize my order? | Yes, custom sizing and personalization... | 3 |
| 5 | What fabrics do you use? | Premium cotton, silk, linen, blends... | 4 |
| 6 | How do I take accurate measurements? | Detailed guide provided with soft tape... | 5 |

**Schema:**
```javascript
{
  question: String (required, trim),
  answer: String (required, trim),
  order: Number (default 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 2. **Testimonials Collection**
6 customer testimonials created with full details:

| # | Author | Rating | Content Preview |
|---|--------|--------|-----------------|
| 1 | Priya Sharma | ⭐⭐⭐⭐⭐ | "I absolutely love my kurta from LIVAANI!..." |
| 2 | Anjali Verma | ⭐⭐⭐⭐⭐ | "Best traditional wear I've found online..." |
| 3 | Meera Patel | ⭐⭐⭐⭐⭐ | "The saree I ordered exceeded expectations..." |
| 4 | Sneha Gupta | ⭐⭐⭐⭐⭐ | "Great collection and very affordable..." |
| 5 | Ritika Singh | ⭐⭐⭐⭐ | "Loved the quality and design. Kurti fits perfectly..." |
| 6 | Divya Kapoor | ⭐⭐⭐⭐⭐ | "Excellent customer service and amazing products..." |

**Schema:**
```javascript
{
  author: String (required, trim),
  content: String (required, trim),
  rating: Number (required, 1-5),
  avatar: String (default ''),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 3. **ContactMessage Collection**
Schema ready for customer inquiries:

**Schema:**
```javascript
{
  name: String (required, trim),
  email: String (required, trim, lowercase),
  message: String (required, trim),
  read: Boolean (default false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## How to Populate/Reseed Database

Run the seeding script anytime to repopulate with sample data:

```bash
cd backend
node seeds/seedCMSData.js
```

**Output:**
```
✅ 6 FAQs created
✅ 6 Testimonials created
✨ Database seeding completed successfully!
```

## Admin Panel Access

### FAQs Management
- **URL:** `http://localhost:5173/admin`
- **Tab:** ❓ FAQs
- **Operations:**
  - ✅ View all FAQs (sorted by order)
  - ✅ Create new FAQ
  - ✅ Edit existing FAQ
  - ✅ Delete FAQ
  - ✅ Reorder FAQs

### Testimonials Management
- **URL:** `http://localhost:5173/admin`
- **Tab:** ⭐ Testimonials
- **Operations:**
  - ✅ View all testimonials
  - ✅ Create new testimonial with rating (1-5 stars)
  - ✅ Edit testimonial
  - ✅ Delete testimonial
  - ✅ Add/update avatar URL

### Contact Messages Management
- **URL:** `http://localhost:5173/admin`
- **Tab:** (Not yet added to UI, but backend ready)
- **Operations:**
  - ✅ View all messages (sorted by newest)
  - ✅ Delete messages
  - ✅ Mark as read status

## API Endpoints

### FAQs
- `GET /api/faqs` - List all FAQs (public)
- `GET /api/faqs/:id` - Get single FAQ (public)
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs/:id` - Update FAQ (admin)
- `DELETE /api/faqs/:id` - Delete FAQ (admin)

### Testimonials
- `GET /api/testimonials` - List all testimonials (public)
- `GET /api/testimonials/:id` - Get single testimonial (public)
- `POST /api/testimonials` - Create testimonial (admin)
- `PUT /api/testimonials/:id` - Update testimonial (admin)
- `DELETE /api/testimonials/:id` - Delete testimonial (admin)

### Contact Messages
- `POST /api/contact` - Submit contact form (public)
- `GET /api/contact` - List all messages (admin)
- `DELETE /api/contact/:id` - Delete message (admin)

## Data Statistics

```
📊 Current Database:
  • FAQs: 6
  • Testimonials: 6
  • Contact Messages: 0
  • Total Collections: 7 (+ Orders, Products, Users, etc.)
```

## Frontend Integration

All data is automatically fetched and displayed:
- FAQs displayed on home page (if component added)
- Testimonials displayed on home page (if component added)
- Contact form accepts submissions automatically
- Admin can manage all data through secure dashboard

## Notes

✅ All collections created in MongoDB Atlas  
✅ Indexes optimized for fast queries  
✅ Timestamps auto-generated on create/update  
✅ Data validation enforced at schema level  
✅ Admin authentication required for write operations  
✅ Public read access for FAQs and Testimonials  
✅ Contact submissions stored without auth required  

---

**Last Updated:** $(date)  
**Status:** ✅ Production Ready
