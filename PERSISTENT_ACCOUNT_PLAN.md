# Persistent Customer Account System - Implementation Plan

## Overview
Transform Livaani's authentication and customer experience to match Amazon, Flipkart, and Myntra with persistent login, database-backed cart, permanent order history, and seamless multi-device synchronization.

## Key Features

### 1. Persistent Login (Remember Me)
- **JWT with Refresh Tokens**: 15-minute access tokens, 7-day refresh tokens
- **Auto-Authenticate**: If refresh token is valid, user automatically logs in
- **Skip Auth Screens**: Don't show login/profile if already authenticated
- **Secure Storage**: Tokens stored securely, not exposed in localStorage
- **Automatic Token Refresh**: Refresh before expiry silently

### 2. Profile Completion (One-Time Only)
- **First Login Flow**: Redirect to profile completion
- **Save to MongoDB**: Store name, phone, gender, DOB, profile photo
- **Flag as Complete**: Set `profileCompleted = true`
- **Skip Next Time**: Never ask for profile again
- **Auto-Redirect**: Go directly to Home on subsequent logins

### 3. Customer Account Dashboard
Premium My Account page with sidebar navigation:
- **Dashboard**: Welcome message, profile info, stats
- **Orders**: Complete history with status, invoice, reorder
- **Cart**: Database-backed, persistent, sync across devices
- **Wishlist**: Add/remove, move to cart, share
- **Recently Viewed**: Auto-tracked, keep latest 100
- **Saved Measurements**: Multiple profiles (Personal, Mother, Sister)
- **Saved Addresses**: Home, Office, Other with default selection
- **Notifications**: Order updates, coupons, new collections
- **Settings**: Edit profile, password, preferences
- **Logout**: Clear tokens only, keep data in DB

### 4. Database-Backed Systems

#### Cart
- **Behavior**: Customer adds item → Saved to DB → Cart restored on login
- **Sync**: Updates sync across all devices in real-time
- **Features**: Quantity change, remove item, move to wishlist, save for later
- **Checkout**: Cart automatically pre-filled

#### Wishlist
- **Storage**: Permanent wishlist in MongoDB
- **Features**: Add/remove, move to cart, share, sync across devices
- **Sync**: Changes visible immediately on all logged-in devices

#### Recently Viewed
- **Tracking**: Auto-tracked on product page load
- **Limit**: Keep latest 100 products per user
- **Display**: Show image, name, price, date viewed
- **Features**: Continue shopping, remove, clear history

#### Orders
- **Permanence**: Never delete order history
- **Storage**: Full snapshot (customer, products, address, payment, invoice)
- **Status**: Track order lifecycle with timestamps
- **Features**: View details, download invoice, reorder, return/exchange

### 5. Multi-Device Sync
- **Instant Sync**: Cart, wishlist, recently viewed, addresses, notifications
- **Conflict Resolution**: Last write wins
- **Offline Support**: Queue changes, sync when online
- **Cross-Browser**: Works across Chrome, Firefox, Safari, Edge
- **Cross-Device**: Changes on mobile appear on desktop instantly

### 6. Security
- **JWT Protection**: All customer routes protected
- **Data Isolation**: Users can only access their own data
- **Rate Limiting**: 100 requests/min per endpoint
- **Token Rotation**: Refresh tokens rotated on each refresh
- **Encryption**: Sensitive data encrypted at rest
- **HTTPS**: Production enforced

## MongoDB Collections

```
User (extended)
├── profileCompleted: boolean
├── lastLogin: timestamp
├── refreshToken: hashed
├── provider: google|facebook|email|phone
└── preferences: {}

Cart
├── userId
├── items[]
│   ├── productId
│   ├── quantity
│   ├── size
│   └── price
└── updatedAt

Wishlist
├── userId
├── products[]
│   ├── productId
│   ├── addedAt
│   └── notes
└── updatedAt

RecentlyViewed
├── userId
├── products[] (max 100)
│   ├── productId
│   ├── viewedAt
│   └── viewedCount
└── lastUpdated

Address
├── userId
├── addresses[]
│   ├── type: Home|Office|Other
│   ├── fullName
│   ├── phone
│   ├── houseNo
│   ├── street
│   ├── city
│   ├── state
│   └── pincode
└── defaultAddressId

SavedMeasurement
├── userId
├── measurements[]
│   ├── name: Personal|Mother|Sister|etc
│   ├── bust
│   ├── waist
│   ├── hips
│   └── other measurements
└── defaultMeasurementId

Notification
├── userId
├── title
├── message
├── type: OrderShipped|CouponAvailable|NewCollection|etc
├── isRead
├── link
└── createdAt

Order (extended)
├── orderId
├── userId
├── customerSnapshot { name, email, phone }
├── products[]
├── shippingAddress
├── billingAddress
├── paymentMethod
├── invoiceNumber
├── status
├── statusTimeline[]
├── total
├── createdAt
└── NEVER DELETE
```

## API Endpoints (New)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PATCH /api/cart/items/:itemId` - Update quantity
- `DELETE /api/cart/items/:itemId` - Remove item
- `POST /api/cart/clear` - Clear entire cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove
- `POST /api/wishlist/move-to-cart` - Move item to cart

### Recently Viewed
- `GET /api/recently-viewed` - Get last 100
- `POST /api/recently-viewed/track` - Track product view
- `DELETE /api/recently-viewed/:productId` - Remove
- `POST /api/recently-viewed/clear` - Clear all

### Address
- `GET /api/addresses` - Get all addresses
- `POST /api/addresses` - Add new address
- `PATCH /api/addresses/:addressId` - Edit address
- `DELETE /api/addresses/:addressId` - Delete address
- `PATCH /api/addresses/default/:addressId` - Set default

### Measurements
- `GET /api/measurements` - Get all saved measurements
- `POST /api/measurements` - Create new measurement profile
- `PATCH /api/measurements/:measurementId` - Edit measurements
- `DELETE /api/measurements/:measurementId` - Delete profile
- `PATCH /api/measurements/default/:measurementId` - Set default

### Notifications
- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `DELETE /api/notifications/:notificationId` - Delete
- `POST /api/notifications/read-all` - Mark all as read

### Auth (Enhanced)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (invalidate refresh token)
- `POST /api/auth/profile/complete` - Complete profile on first login

### Orders (Enhanced)
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/:orderId/invoice` - Download invoice
- `POST /api/orders/:orderId/reorder` - Reorder same items
- `GET /api/orders/:orderId/track` - Track shipment

## Frontend Components

### My Account Page Layout
```
┌─────────────────────────────────────────┐
│  Navbar with Logout                     │
├──────────────┬──────────────────────────┤
│              │                          │
│   Sidebar    │    Main Content          │
│              │    (Sections Below)      │
│ • Dashboard  │                          │
│ • Orders     │  - Dashboard             │
│ • Cart       │  - Orders                │
│ • Wishlist   │  - Cart                  │
│ • Recently   │  - Wishlist              │
│ • Measure    │  - Recently Viewed       │
│ • Address    │  - Measurements          │
│ • Notif      │  - Addresses             │
│ • Settings   │  - Notifications         │
│ • Logout     │  - Settings              │
│              │                          │
└──────────────┴──────────────────────────┘
```

### Design System
- **Color Scheme**: Ivory & champagne gold (Livaani premium aesthetic)
- **Effects**: Glassmorphism cards, subtle shadows
- **Animations**: Framer Motion smooth transitions
- **Typography**: Elegant, refined fonts
- **Responsiveness**: Mobile-first, fully responsive
- **Accessibility**: WCAG 2.1 AA compliant

## Implementation Phases

### Phase 1: Database & Schemas (Week 1)
- Create all MongoDB models
- Add indexes for performance
- Migration scripts

### Phase 2: Authentication (Week 1-2)
- Implement JWT refresh token system
- Auto-authenticate on app load
- Profile completion workflow

### Phase 3: Cart System (Week 2)
- Migrate to database-backed cart
- Implement APIs and syncing
- Update frontend to use APIs

### Phase 4: Dashboard (Week 3)
- Create My Account page layout
- Implement sidebar navigation
- Add responsive design

### Phase 5: Orders & History (Week 3)
- Display order history
- Add order tracking
- Invoice generation

### Phase 6: Other Features (Week 4)
- Wishlist, Recently Viewed, Addresses
- Measurements, Notifications
- Settings page

### Phase 7: Multi-Device Sync (Week 4)
- Implement real-time synchronization
- Conflict resolution
- Cross-device testing

### Phase 8: Testing & Optimization (Week 5)
- Performance testing
- Security audit
- E2E testing
- Deployment

## Success Criteria

✅ User automatically logs in with valid refresh token
✅ Profile completion happens only once
✅ Cart persists across sessions
✅ All customer data stored permanently in MongoDB
✅ Multi-device sync works seamlessly
✅ API responses <100ms average
✅ Zero data loss on logout
✅ Security audit passed
✅ 99.9% uptime
✅ Mobile-responsive design

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Data migration issues | Careful planning, backup strategy |
| Performance degradation | Database indexes, query optimization |
| Breaking changes | Versioned APIs, gradual rollout |
| Security vulnerabilities | Security audit, penetration testing |
| Multi-device conflicts | Clear conflict resolution rules |

## Next Steps

1. ✅ Review and approve spec
2. Start Phase 1: Database schemas and models
3. Create migration scripts
4. Build authentication system
5. Implement cart APIs
6. Continue with remaining phases

---

**Spec Created**: 2026-07-18
**Project**: Livaani Admin Dashboard & Customer Account System
**Version**: 1.0
