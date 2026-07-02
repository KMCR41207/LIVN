# How to Start LIVN Application

## MongoDB Backend is Now Connected! ✅

Your application is now using **MongoDB Atlas** for the database.

---

## Starting the Application

You need to run **TWO servers** simultaneously:

### Method 1: Using Two Terminals (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd backend
node index.js
```
You should see:
```
✅ MongoDB connected
🚀 App running on port 5000
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```
You should see:
```
VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### Method 2: Using npm-run-all (Single Command)

Install npm-run-all:
```bash
npm install --save-dev npm-run-all
```

Then run:
```bash
npm run dev:all
```

---

## MongoDB Connection Details

**Database**: MongoDB Atlas (Cloud)
**Connection**: Already configured in `backend/.env`
**Status**: ✅ Connected

Your MongoDB credentials are already set up:
- **URI**: `mongodb://<username>:<password>@...`
- **Database**: Cloud-hosted on MongoDB Atlas
- **Collections**: `users`, `orders`

---

## Testing the Connection

1. **Start both servers** (see above)

2. **Open browser**: http://localhost:5173

3. **Test Authentication**:
   - Click the user icon (top right)
   - Try Sign Up with a new email
   - Should work without "Failed to fetch" error

4. **Test Orders**:
   - Add items to cart
   - Go to checkout
   - Complete an order
   - Check "Track Orders" page

5. **Test Bespoke Orders**:
   - Go to Bespoke section
   - Complete the measurement form
   - Select fabric, design, consultation
   - Submit order
   - Should save to MongoDB

6. **Test Admin Panel**:
   - Go to http://localhost:5173/admin
   - Login with admin credentials from `backend/.env`:
     - Email: `likkijas@gmail.com`
     - Password: `likkijas@2026`
   - View all orders from MongoDB

---

## Troubleshooting

### "Failed to fetch" Error

**Cause**: Backend server is not running

**Solution**: 
```bash
cd backend
node index.js
```
Make sure you see "MongoDB connected" message

### Backend Won't Start

**Check**: MongoDB connection string in `backend/.env`
**Solution**: Verify the MONGO_URI is correct

### Frontend Can't Connect

**Check**: `.env` file has correct API URL
**Should be**:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Production Deployment

For production (Railway, Heroku, etc.):

1. **Set Environment Variables**:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secure random string
   - `PORT` - Usually provided by platform
   - `NODE_ENV=production`

2. **Build Frontend**:
   ```bash
   npm run build
   ```

3. **Start Backend**:
   ```bash
   cd backend
   node index.js
   ```
   Backend will serve the built frontend from `dist/`

---

## Database Collections

Your MongoDB has these collections:

### `users`
- id (ObjectId)
- email (String, unique)
- password (String, hashed)
- role (String: 'customer' | 'admin')
- created_at (Date)

### `orders`
- id (ObjectId)
- user_id (ObjectId, ref: users)
- order_type (String: 'regular' | 'bespoke')
- customer_name (String)
- email (String)
- phone (String)
- address, city, state, pincode (for regular orders)
- items (Array, for regular orders)
- measurements, fabric, design, consultation (for bespoke orders)
- payment_method (String)
- total_amount (Number)
- status (String)
- created_at (Date)

---

## Summary

✅ **MongoDB Atlas connected**
✅ **Backend configured** (`backend/.env`)
✅ **Frontend configured** (`.env`)
✅ **Authentication working**
✅ **Orders saving to MongoDB**
✅ **Bespoke orders saving to MongoDB**
✅ **Admin panel connected**

**Just start both servers and everything works!**
