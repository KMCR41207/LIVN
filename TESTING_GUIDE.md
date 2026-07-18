# QUICK TESTING GUIDE - Task 4
## Persistent Login & Account Panel

**Open in Browser**: http://localhost:5173

---

## TEST 1: Login Flow ✅

### Step 1: Log In
1. Click **user icon** (top right navbar)
2. Choose login method:
   - **Email**: Use test account or create new
   - **Google**: Click "Sign in with Google"
   - **Facebook**: Click "Sign in with Facebook"
3. On success → Account panel appears with your name

### Expected Result
- ✅ Account panel shows your name, email, and photo
- ✅ Green dot next to user icon indicates logged in
- ✅ No login modal (you're already logged in)

---

## TEST 2: Account Panel Navigation ✅

### Step 1: Click Each Menu Item
With account panel open, click these items:

| Item | Expected Route | Expected Page |
|------|-------|--------|
| My Profile | /profile | Profile edit page |
| My Orders | /account | Orders list |
| Returns & Exchanges | /account?tab=returns | Returns tab |
| Track Order | /track-order | Order tracking page |
| Rewards & Loyalty | /rewards | Rewards page |
| Customer Care | /whatsapp | WhatsApp contact |

### Step 2: Check Admin Items (if admin)
If logged in as admin, should also see:
- **Admin Dashboard** → /admin
- **Admin Profile** → /admin/profile

### Expected Result
- ✅ Each click closes the panel
- ✅ Navigation works correctly
- ✅ Pages load properly

---

## TEST 3: Persistent Login ✅

### Step 1: Page Refresh
1. Click user icon → see account panel
2. Press **F5** or **Ctrl+R** to refresh
3. Page reloads

### Expected Result
- ✅ Account panel still visible (or click user icon again)
- ✅ No login modal
- ✅ Your name and email still there
- ✅ You're still logged in

### Step 2: Close Tab & Reopen
1. Note your email address
2. Close the browser tab completely
3. Open http://localhost:5173 in new tab
4. Look at navbar (top right)

### Expected Result
- ✅ User icon has green dot (logged in)
- ✅ Click user icon → account panel appears
- ✅ Your email shows in the panel
- ✅ **No login modal** required

---

## TEST 4: Account Panel Closing ✅

### Method 1: Click Outside
1. Open account panel
2. Click anywhere outside the panel
3. Panel should close

### Method 2: Press ESC
1. Open account panel
2. Press **ESC** key
3. Panel should close

### Method 3: Click Menu Item
1. Open account panel
2. Click any menu item
3. Panel closes + navigates

### Expected Result
- ✅ All three methods close the panel
- ✅ ESC key works as expected

---

## TEST 5: Mobile Responsiveness ✅

### Step 1: Open DevTools
1. Press **F12** to open DevTools
2. Click mobile device icon (top left of DevTools)
3. Select **iPhone 12** or any mobile preset

### Step 2: Test Account Panel
1. Click user icon (mobile)
2. Panel should appear
3. Tap each menu item
4. Tap outside → panel closes

### Step 3: Test Mobile Menu
1. Click hamburger menu (mobile)
2. If logged in → should show:
   - Home, Collections, Bespoke
   - My Profile, My Orders, Track Order
   - Rewards, Customer Care
   - Sign Out button
3. If NOT logged in → should show:
   - Home, Collections, Bespoke
   - Sign In button

### Expected Result
- ✅ Panel styled correctly for mobile
- ✅ No horizontal scroll
- ✅ All buttons clickable
- ✅ Mobile menu shows correct items

---

## TEST 6: Error Handling ✅

### Step 1: Stop Backend
1. In terminal where servers are running
2. Press **Ctrl+C** twice to stop backend
3. Frontend should keep running

### Step 2: Try to Login
1. Click user icon
2. Try to login (should fail)
3. Expected error: **"Server error (500). Please ensure backend is running."**

### Step 3: Check Persistent Login
1. If you were logged in before: refresh page
2. You should still be logged in (from localStorage)
3. Account panel should work

### Step 4: Restart Backend
1. In terminal: `npm run server`
2. Wait for "🚀 App running on port 5000"
3. Refresh page

### Expected Result
- ✅ Clear error message (not JSON parse error)
- ✅ Logged-in users stay logged in even when backend is down
- ✅ Once backend restarts, token refresh happens silently
- ✅ No user action required

---

## TEST 7: Logout ✅

### Step 1: Open Account Panel
1. Click user icon
2. Panel opens

### Step 2: Sign Out
1. Click **Sign Out** button at bottom of panel
2. Wait for logout to complete

### Expected Result
- ✅ Redirects to home page
- ✅ User icon has NO green dot
- ✅ Click user icon → shows login modal (not account panel)
- ✅ All localStorage cleared (no lingering data)

### Step 3: Verify Data Cleared
1. After logout, open DevTools Console
2. Type: `localStorage`
3. Should NOT have `livn_auth_state`, `livn_token`, `livn_refresh_token`

---

## TEST 8: Google OAuth ✅

### Prerequisites
- Google account
- Google OAuth configured in backend

### Steps
1. Click user icon (not logged in)
2. Click **"Sign in with Google"**
3. Popup appears (or Google login page)
4. Authenticate with Google account
5. Should redirect back to app

### Expected Result
- ✅ Account panel appears
- ✅ Name from Google profile shows
- ✅ Profile photo from Google shows (if available)
- ✅ Persistent login works (refresh stays logged in)

---

## TEST 9: Facebook OAuth ✅

### Prerequisites
- Facebook account
- Facebook OAuth configured in backend

### Steps
1. Click user icon (not logged in)
2. Click **"Sign in with Facebook"**
3. Popup appears (or Facebook login page)
4. Authenticate with Facebook account
5. Should redirect back to app

### Expected Result
- ✅ Account panel appears
- ✅ Name from Facebook profile shows
- ✅ Profile photo from Facebook shows (if available)
- ✅ Persistent login works

---

## TEST 10: Admin Panel Access ✅

### Prerequisites
- Admin account (role = 'admin' in database)

### Steps
1. Login with admin account
2. Open account panel
3. Should see two extra items:
   - **Admin Dashboard**
   - **Admin Profile**

### Expected Result
- ✅ Both admin items visible only for admin users
- ✅ Regular users don't see these items
- ✅ Clicking navigates to /admin and /admin/profile

---

## COMMON ISSUES & FIXES

### Issue: "Unexpected end of JSON input" Error
**Fix**: Already fixed! This shouldn't happen now.
- If it does: refresh page or restart backend

### Issue: Account Panel Not Closing
**Fix**: Click outside the panel, or press ESC key
- If still stuck: reload page

### Issue: Logged Out After Refresh
**Fix**: This shouldn't happen now!
- Check if backend is running: `npm run dev:all`
- Check localStorage in DevTools: should have `livn_auth_state`

### Issue: Can't See Account Panel
**Fix**: Make sure you're logged in first
- Look for green dot on user icon
- If no dot: click user icon and login first

### Issue: Mobile Menu Not Showing Options
**Fix**: 
- Close mobile menu, click user icon
- Should open account panel instead
- If you're NOT logged in: click user icon → login modal

---

## VERIFICATION CHECKLIST

Print this and check off as you test:

```
LOGIN FLOW
[ ] Email login works
[ ] Google OAuth works
[ ] Facebook OAuth works
[ ] Account panel appears on login

PERSISTENT LOGIN
[ ] Refresh page → stays logged in
[ ] Close tab → reopen → stays logged in
[ ] No login modal on page reload

ACCOUNT PANEL
[ ] All 6 menu items visible
[ ] Admin items show only for admins
[ ] Click each item → navigates correctly
[ ] Sign Out button works

MOBILE
[ ] Account panel visible and usable
[ ] Mobile menu shows correct items
[ ] All buttons clickable

ERROR HANDLING
[ ] Stop backend → clear error message
[ ] Logged-in users stay logged in when backend is down
[ ] Restart backend → works normally

LOGOUT
[ ] Sign Out clears localStorage
[ ] Redirects to home
[ ] Can login again
```

---

## GETTING HELP

If something doesn't work:

1. **Check if servers are running**
   ```
   Backend: http://localhost:5000
   Frontend: http://localhost:5173
   ```

2. **Open browser DevTools** (F12)
   - Console tab: check for errors
   - Network tab: check API requests
   - Application tab: check localStorage

3. **Check terminal output**
   - Backend errors in Terminal 1
   - Frontend errors in Terminal 2

4. **Clear browser data**
   - DevTools → Application → Clear All
   - Refresh page
   - Try again

---

**Ready to Test!** 🚀  
Open http://localhost:5173 in your browser
