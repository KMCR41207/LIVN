# Livaani Security Implementation Guide

**Last Updated:** July 2026  
**Status:** Production-Ready (Phase 1 Security Fixes)

---

## 🔐 Overview

This document outlines the security architecture and practices implemented in Livaani to protect user data and prevent common vulnerabilities.

### Key Principles

1. **Zero PII in Browser Storage** - No personal data stored on client
2. **HTTP-Only Cookies** - Tokens inaccessible to JavaScript (XSS protection)
3. **Strict CORS** - API only responds to whitelisted frontend domains
4. **Security Headers** - CSP, X-Frame-Options, etc. prevent attacks
5. **Server-Side Validation** - Never trust client input
6. **Data Minimization** - Only store/transmit what's necessary

---

## 📋 What Changed (Security Fixes)

### ❌ REMOVED (Insecure Patterns)

| Item | Issue | Status |
|------|-------|--------|
| localStorage tokens | Vulnerable to XSS | Replaced with HTTP-only cookies |
| localStorage delivery address | PII in browser | Moved to database only |
| localStorage phone number | PII in browser | Moved to database only |
| localStorage measurements | Sensitive data | Moved to database only |
| Hardcoded JWT secrets | In .env file visible in repo | Moved to .env (gitignore) |
| Admin password hardcoded | In .env file | Removed, use environment variables |
| CORS: origin: '*' | Anyone could call API | Changed to whitelist |
| Card details in state | Memory/network exposure | Use payment gateway instead |

### ✅ ADDED (Secure Patterns)

| Item | Benefit | Location |
|------|---------|----------|
| HTTP-only cookies | Tokens can't be stolen via XSS | `server/middleware/tokenManager.js` |
| Strict CORS | Only frontend can call API | `server/middleware/securityHeaders.js` |
| Content Security Policy | Prevents unauthorized script execution | `server/index.js` |
| Session Storage | Temporary cart cleared on tab close | `src/lib/secureStorage.js` |
| Secure token manager | Centralized token handling | `server/middleware/tokenManager.js` |
| .env.example | Document required vars without exposing secrets | Root & `server/` |

---

## 🔑 Token Management

### Old Approach (❌ Insecure)
```javascript
// These were storing tokens in localStorage where JavaScript could access them
localStorage.setItem('livn_token', accessToken);
localStorage.setItem('livn_refresh_token', refreshToken);

// Any XSS attack could steal tokens:
// var stolen = localStorage.getItem('livn_token');
```

### New Approach (✅ Secure)
```javascript
// Tokens are set ONLY by backend in HTTP-only cookies
// Browser automatically sends them with requests
// JavaScript cannot access them

// Backend sets cookies like this:
res.cookie('accessToken', token, {
  httpOnly: true,      // ← JavaScript cannot access
  secure: true,        // ← HTTPS only in production
  sameSite: 'strict',  // ← CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Frontend doesn't need to do anything - cookies sent automatically
// Tokens are never accessible to JavaScript
```

**Why This Is Better:**
- XSS attacks cannot steal tokens
- Tokens are automatically sent with every request
- Shorter lifetime = less exposure window
- Rotation on refresh = no token reuse

---

## 👤 Personal Data Handling

### Rule #1: No PII in Browser Storage

❌ **Never Store These Client-Side:**
```javascript
// ❌ WRONG - Exposed to XSS
localStorage.setItem('delivery', JSON.stringify({
  name: 'John Doe',           // Personal name
  phone: '+919876543210',     // Phone number
  address: 'Hyderabad',       // Physical address
  measurements: {...}         // Body measurements
}));
```

✅ **Correct - Server-Side Only:**
```javascript
// ✅ Correct - Only stored server-side in MongoDB
// Frontend sends via HTTPS when needed
fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    // Send to backend via encrypted HTTPS
    deliveryAddressId: '507f1f77bcf86cd799439011', // Just the ID
    // Server looks up full address from database
  }),
  credentials: 'include', // Send cookies
});
```

### Rule #2: Temporary Data Only in Session Storage

✅ **OK: Temporary Cart Before Login**
```javascript
// sessionStorage (not localStorage) - cleared when tab closes
sessionStorage.setItem('tempCart', JSON.stringify([
  { productId: 'abc123', quantity: 2, size: 'M' }, // Just IDs
]));

// After login, server stores full cart in MongoDB
// Temporary data is discarded
```

---

## 🔒 CORS & Security Headers

### CORS Configuration

```javascript
// Only these domains can call the API
const allowedOrigins = [
  'http://localhost:5173',   // Dev
  'https://livaani.com',     // Production
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed'));
    }
  },
  credentials: true, // Allow cookies
}));
```

### Security Headers

| Header | Purpose | Value |
|--------|---------|-------|
| `X-Frame-Options` | Prevent clickjacking | `DENY` |
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `Content-Security-Policy` | Control resource loading | See `server/index.js` |
| `X-XSS-Protection` | Enable XSS filter | `1; mode=block` |
| `Referrer-Policy` | Control referrer info | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000` (production only) |

---

## 🛡️ Input Validation

### On Backend (Always Validate)

```javascript
// ✅ CORRECT - Server validates everything
router.post('/checkout', verifyAccessToken, async (req, res) => {
  const { name, phone, address } = req.body;
  
  // Validate presence
  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  // Validate format
  if (phone.length !== 10 || isNaN(phone)) {
    return res.status(400).json({ error: 'Invalid phone' });
  }
  
  // Validate length (prevent buffer overflow)
  if (address.length > 500) {
    return res.status(400).json({ error: 'Address too long' });
  }
  
  // Sanitize (remove special characters if needed)
  const cleanName = name.replace(/[<>]/g, '');
  
  // Store in database
  await Order.create({ name: cleanName, phone, address });
});
```

### On Frontend (UX Only, Not Security)

```javascript
// ❌ DON'T rely on frontend validation for security
if (name.length < 3) {
  setError('Name too short'); // This helps UX
}
// ❌ But backend MUST also validate - attacker can bypass this

// ✅ Frontend validation improves UX
// ✅ Backend validation ensures security
```

---

## 🔐 Environment Variables

### Public (Frontend - OK to Expose)

```bash
# .env - Safe to commit
VITE_GOOGLE_CLIENT_ID=481778...abc  # Public by design, needed for OAuth
VITE_API_URL=https://api.livaani.com # URL configuration
```

### Private (Backend - NEVER Commit)

```bash
# server/.env - DO NOT COMMIT (add to .gitignore)
MONGO_URI=mongodb://user:pass@cluster...  # Database credentials
JWT_SECRET=very_long_random_string_here   # Token signing key
JWT_REFRESH_SECRET=another_random_string  # Refresh token key
ADMIN_EMAIL=admin@livaani.com             # Admin account
ADMIN_PASSWORD=strong_password_here       # Admin password
```

### How to Generate Strong Secrets

```bash
# Run this in Node.js to generate cryptographically secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output:
# a7f9e3c2b1d8f4e6c9a2d5b7f1e3c8a9d2f5b7e1c4a7d2e9f3b6c8a1d4e7f
```

---

## 📡 API Security

### Authentication

All protected endpoints require valid access token:

```javascript
// Middleware: verifyAccessToken
router.get('/cart', verifyAccessToken, async (req, res) => {
  const userId = req.user.id; // From JWT
  // Return cart only for authenticated user
});
```

### Rate Limiting (Recommended Future Addition)

```javascript
// Prevent brute force attacks
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later'
});

router.post('/signin', loginLimiter, async (req, res) => {
  // Max 5 login attempts per 15 minutes
});
```

---

## 🧪 Testing Security

### Manual Checks

1. **Check localStorage is clean**
   ```javascript
   // Open DevTools Console and run:
   console.log(localStorage);
   // Should NOT show: delivery address, phone, measurements
   ```

2. **Check cookies are HTTP-only**
   ```
   DevTools → Application → Cookies → localhost
   // accessToken and refreshToken should have ✓ HttpOnly flag
   // NOT accessible via JavaScript
   ```

3. **Check CORS works**
   ```bash
   # Try calling API from unauthorized domain
   curl -H "Origin: https://attacker.com" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:5000/api/products
   
   # Should return: CORS not allowed (or 403)
   ```

4. **Check Security Headers**
   ```bash
   curl -I http://localhost:5000
   
   # Should include headers like:
   # X-Frame-Options: DENY
   # X-Content-Type-Options: nosniff
   # X-XSS-Protection: 1; mode=block
   # Content-Security-Policy: ...
   ```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] All `.env` files have strong random secrets (use `node -e "..." command above)
- [ ] `FRONTEND_URL` environment variable set to production domain
- [ ] `NODE_ENV=production` set on server
- [ ] Database credentials are unique and strong
- [ ] SSL/TLS certificate installed (HTTPS)
- [ ] Backup strategy in place
- [ ] Monitoring set up for failed auth attempts
- [ ] Rate limiting implemented on auth endpoints
- [ ] Security headers validated with tools like securityheaders.com
- [ ] OWASP Top 10 review completed
- [ ] Penetration testing scheduled

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🆘 Security Incident Response

If you discover a security vulnerability:

1. **DO NOT** post publicly or in issues
2. Email security team: `security@livaani.com`
3. Include: description, steps to reproduce, potential impact
4. We will acknowledge within 24 hours and work on fix

---

## 📝 Security Audit Log

| Date | Finding | Status | Fix Applied |
|------|---------|--------|-------------|
| Jul 2026 | PII in localStorage | Fixed | Moved to database, HTTP-only cookies |
| Jul 2026 | CORS allow-all | Fixed | Whitelist whitelisting implemented |
| Jul 2026 | Hardcoded secrets in repo | Fixed | Moved to .env (gitignore) |
| Jul 2026 | Tokens in localStorage | Fixed | HTTP-only cookies + sessionStorage |

---

**Remember:** Security is an ongoing process, not a one-time fix. Review and update regularly.
