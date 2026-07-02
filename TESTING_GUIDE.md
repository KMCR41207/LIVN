# LIVN Application - Complete Testing Guide

## Task 3 & 4: End-to-End Testing Instructions

---

## Prerequisites

### 1. Start Backend Server

**Terminal 1:**
```bash
cd backend
node index.js
```

**Expected Output:**
```
✅ MongoDB connected
🚀 App running on port 5000
```

**If MongoDB Connection Fails:**

The error `querySrv ECONNREFUSED` means:
- Network connectivity issue to MongoDB Atlas
- Firewall blocking the connection
- DNS resolution problem

**Solutions:**

1. **Check Internet Connection**
   - Ensure you're connected to the internet
   - Try accessing: https://cloud.mongodb.com

2. **Whitelist Your IP Address in MongoDB Atlas**
   - Go to: https://cloud.mongodb.com
   - Login with your MongoDB account
   - Navigate to: Network Access → IP Access List
   - Click "Add IP Address"
   - Add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0)
   - Save and wait 1-2 minutes

3. **Alternative Connection String**
   If still failing, try the standard format in `backend/.env`:
   ```env
   MONGO_URI=mongodb://qwertyasd077a_db_user:mani41207@ac-jg6svet-shard-00-00.tkvviwk.mongodb.net:27017,ac-jg6svet-shard-00-01.tkvviwk.mongodb.net:27017,ac-jg6svet-shard-00-02.tkvviwk.mongodb.net:27017/livn_db?ssl=true&replicaSet=atlas-bjbfhw-shard-0&authSource=admin&appName=Cluster0
   ```

4. **Check Firewall/VPN**
   - Disable VPN temporarily
   - Check Windows Firewall settings
   - Allow Node.js through firewall

### 2. Start Frontend Server

**Terminal 2:**
```bash
npm run dev
```

**Expected Output:**
```
VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

---

## Test 1: Bespoke Order Flow (End-to-End)

### Step 1: Navigate to Bespoke Section
1. Open browser: `http://localhost:5173/`
2. Click "BESPOKE" in navigation menu
3. Click "Begin Your Journey" button

**Expected**: Navigate to `/bespoke/process`

### Step 2: Complete Measurements Form
1. Fill in all required fields:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `9876543210`
   - All body measurements (use sample values like: chest: 38, waist: 32, etc.)
2. Click "Save Progress" (should show confirmation)
3. Click "Continue to Fabric Selection"

**Expected**: 
- Data saved to localStorage
- Navigate to `/bespoke/fabrics`

### Step 3: Select Fabric
1. Browse available fabrics
2. Click on any fabric card (e.g., "Italian Wool Super 150s")
3. Click "Continue to Design"

**Expected**: 
- Fabric selection saved
- Navigate to `/bespoke/design`

### Step 4: Choose Design Specifications
1. Select:
   - Garment Type: "Suit"
   - Style: "Two-Piece"
   - Lapel: "Notch Lapel"
   - Buttons: "Two Button"
   - Check any extras (monogram, custom lining, etc.)
2. Click "Continue to Consultation"

**Expected**:
- Design saved
- Navigate to `/bespoke/consultation`

### Step 5: Book Consultation
1. Select Consultation Type:
   - Choose "Virtual" (in-person is disabled with "coming soon")
2. For Virtual:
   - Date: Choose any future date
   - Time: Select available time slot
3. Click "Continue to Summary"

**Expected**:
- Consultation booking saved
- Navigate to `/bespoke/summary`

### Step 6: Review & Submit Order
1. Review all details:
   - Personal information
   - Fabric selection
   - Design specifications
   - Consultation booking
   - Order total (Fabric price + ₹15,000)
2. Click "Confirm Order"

**Expected**:
- Loading state: "Submitting..."
- Order saved to MongoDB
- Navigate to `/bespoke/thank-you`
- localStorage cleared (bespokeMeasurements, bespokeFabric, bespokeDesign, bespokeConsultation)

**If Error Occurs**:
- Check browser console (F12) for error messages
- Verify backend is running
- Check Network tab for failed API calls

---

## Test 2: Verify MongoDB Data Saving

### Method 1: Check Backend Console
After submitting bespoke order, check Terminal 1 (backend) for logs.

### Method 2: Use MongoDB Compass (Recommended)

1. **Download MongoDB Compass**: https://www.mongodb.com/products/compass

2. **Connect to Database**:
   ```
   mongodb+srv://qwertyasd077a_db_user:mani41207@cluster0.tkvviwk.mongodb.net/livn_db
   ```

3. **Navigate to**:
   - Database: `livn_db`
   - Collection: `orders`

4. **Verify Bespoke Order**:
   Look for document with:
   ```json
   {
     "order_type": "bespoke",
     "customer_name": "Test User",
     "email": "test@example.com",
     "measurements": { ... },
     "fabric": { ... },
     "design": { ... },
     "consultation": { ... },
     "total_amount": 20000,
     "status": "consultation_pending",
     "created_at": "2024-..."
   }
   ```

### Method 3: Use MongoDB Atlas Web UI

1. Go to: https://cloud.mongodb.com
2. Login with your account
3. Click on your cluster → "Browse Collections"
4. Select database: `livn_db`
5. Select collection: `orders`
6. View the documents

### Method 4: Test via API Endpoint

**Using Postman or curl**:
```bash
# Get all orders
curl http://localhost:5000/api/orders
```

---

## Test 3: Admin Panel Order Management

### Step 1: Access Admin Panel
1. Navigate to: `http://localhost:5173/admin`

### Step 2: Admin Login
**Credentials** (from `backend/.env`):
- Email: `likkijas@gmail.com`
- Password: `likkijas@2026`

**Expected**:
- Successful login
- Display orders dashboard

**If Login Fails**:
- Check "Failed to fetch" → Backend not running
- Check "Invalid credentials" → Wrong email/password

### Step 3: View Orders
1. After login, you should see:
   - Order count
   - Refresh button
   - List of all orders (regular + bespoke)

2. For each order, verify:
   - Order ID (last 6 characters)
   - Customer name
   - Email
   - Phone
   - Order type (regular / bespoke)
   - Status
   - Total amount
   - Created date
   - Order details (expandable)

### Step 4: Update Order Status
1. Find the bespoke order you just created
2. Change status dropdown:
   - From: "consultation_pending"
   - To: "in_progress" or "completed"
3. Observe status update in real-time

**Expected**:
- Status saved to MongoDB
- UI updates immediately
- Copy order ID button works

### Step 5: Test Regular Order (Optional)
1. Logout from admin
2. Add products to cart from home page
3. Complete checkout with test data
4. Login to admin panel again
5. Verify regular order appears with:
   - order_type: "regular"
   - items: [array of products]
   - status: "new"

---

## Test 4: Track Orders (Customer View)

### Step 1: Create User Account (Optional)
1. Click user icon → Sign Up
2. Create account: `customer@test.com` / `password123`

### Step 2: Access Track Orders
1. Navigate to: `http://localhost:5173/track-orders`
2. If not logged in, click "Sign In" and login

### Step 3: View Your Orders
**Expected**:
- See bespoke order you created (if email matches)
- See regular orders (if any)
- Order details displayed
- Status tracking visible

---

## Troubleshooting Guide

### Backend Won't Start

**Error**: `MongoDB connection failed`
**Solution**: 
- Whitelist IP in MongoDB Atlas
- Check internet connection
- Verify MONGO_URI in `backend/.env`

**Error**: `Port 5000 already in use`
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart
node index.js
```

### Frontend Can't Connect

**Error**: "Failed to fetch"
**Cause**: Backend not running
**Solution**: Start backend first (Terminal 1)

**Error**: Network request failed
**Cause**: Wrong API URL
**Solution**: Check `.env` has `VITE_API_URL=http://localhost:5000/api`

### Bespoke Order Not Saving

1. **Check Browser Console** (F12):
   - Look for error messages
   - Check Network tab for failed POST to `/api/orders`

2. **Check Backend Console**:
   - Look for error logs
   - Verify MongoDB connection

3. **Verify Data**:
   - Check localStorage before submission
   - Verify all form fields filled

### Admin Panel Login Fails

**Error**: "Failed to fetch"
**Solution**: Backend not running

**Error**: "Invalid credentials"
**Solution**: Use exact credentials from `backend/.env`

**Error**: "Access denied"
**Solution**: User is not admin (only admin@email can access)

---

## Expected Results Summary

### ✅ Successful Bespoke Order Flow:
1. All 6 steps complete without errors
2. Order saved to MongoDB with `order_type: 'bespoke'`
3. Thank you page displays
4. localStorage cleared

### ✅ MongoDB Data Verification:
1. Order document exists in `livn_db.orders` collection
2. Contains all bespoke data (measurements, fabric, design, consultation)
3. Status is `consultation_pending`
4. Created timestamp present

### ✅ Admin Panel Working:
1. Admin can login
2. All orders displayed (regular + bespoke)
3. Order details expandable
4. Status can be updated
5. Changes persist in database

---

## Database Schema Reference

### Bespoke Order Document:
```json
{
  "_id": "ObjectId(...)",
  "order_type": "bespoke",
  "customer_name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "user_id": null or "ObjectId(...)",
  
  "measurements": {
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "chest": "38",
    "waist": "32",
    "hips": "40",
    ... (all measurements)
  },
  
  "fabric": {
    "name": "Italian Wool Super 150s",
    "origin": "Italy",
    "weight": "Super 150s",
    "price": 12000,
    "image": "/images/fabrics/..."
  },
  
  "design": {
    "garmentType": "Suit",
    "style": "Two-Piece",
    "lapel": "Notch Lapel",
    "buttons": "Two Button",
    "extras": ["Monogram", "Custom Lining"]
  },
  
  "consultation": {
    "consultationType": "virtual",
    "date": "2024-12-20",
    "time": "10:00 AM",
    "location": null
  },
  
  "total_amount": 27000,
  "status": "consultation_pending",
  "created_at": "2024-12-18T10:30:00.000Z"
}
```

### Regular Order Document:
```json
{
  "_id": "ObjectId(...)",
  "order_type": "regular",
  "customer_name": "Customer Name",
  "email": "customer@email.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "Hyderabad",
  "state": "Telangana",
  "pincode": "500001",
  
  "items": [
    {
      "product_name": "Sleeveless Kurti",
      "product_id": "prod_123",
      "size": "M",
      "qty": 1,
      "price": 2500
    }
  ],
  
  "payment_method": "cod",
  "upi_id": null,
  "total_amount": 2500,
  "status": "new",
  "created_at": "2024-12-18T10:30:00.000Z"
}
```

---

## Quick Test Checklist

- [ ] Backend started successfully (✅ MongoDB connected)
- [ ] Frontend started successfully (http://localhost:5173)
- [ ] Bespoke measurements form saves
- [ ] Fabric selection works
- [ ] Design specifications save
- [ ] Consultation booking completes
- [ ] Order summary displays correctly
- [ ] Order submits successfully
- [ ] Thank you page shows
- [ ] Order appears in MongoDB
- [ ] Admin can login
- [ ] Admin sees all orders
- [ ] Admin can update order status
- [ ] Track Orders page works

---

## Next Steps After Testing

1. **If all tests pass**: Application is ready for production deployment
2. **If MongoDB connection fails**: Fix network/IP whitelist issues first
3. **If orders not saving**: Check backend logs and API responses
4. **If admin panel broken**: Verify JWT_SECRET and admin credentials

---

## Support & Debugging

**Backend Logs**: Check Terminal 1 for detailed error messages
**Frontend Logs**: Press F12 → Console tab
**Network Requests**: F12 → Network tab → Filter: Fetch/XHR
**MongoDB Compass**: Best tool for database inspection
**Postman**: Test API endpoints directly

**Files to Check**:
- `backend/.env` - MongoDB connection string
- `.env` - Frontend API URL
- `backend/index.js` - Server configuration
- `src/lib/api.js` - API client
- Browser DevTools Console - Frontend errors
