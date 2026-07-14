# Authentication System Documentation

## Overview

The LIVN application uses a centralized authentication context-based system built with React Context API. This system manages user authentication state, JWT tokens, and automatic token refresh.

## Architecture

### Core Components

1. **AuthContext** (`src/context/AuthContext.js`)
   - Defines the authentication context type and interface
   - Provides JSDoc type definitions for TypeScript-like development

2. **AuthProvider** (`src/context/AuthProvider.jsx`)
   - Manages authentication state and logic
   - Handles token persistence and restoration
   - Implements automatic token refresh
   - Provides all authentication methods

3. **useAuth Hook** (`src/hooks/useAuth.js`)
   - Custom hook to access AuthContext
   - Throws error if used outside AuthProvider

4. **API Client** (`src/lib/api.js`)
   - Axios instance with interceptors
   - Automatic JWT injection in requests
   - 401 error handling with token refresh

## State Structure

```javascript
{
  currentUser: {
    id: string,
    email: string,
    name?: string,
    role?: string,
    phone?: string,
    profile?: object
  },
  isLoading: boolean,
  error: {
    message: string,
    code: string
  } | null,
  isAuthenticated: boolean,
  accessToken: string | null,
  refreshToken: string | null,
  tokenExpiry: number | null  // milliseconds
}
```

## Available Methods

### Authentication

- **login(email, password)** - Email/password authentication
- **signupEmail(email, password)** - Create new account
- **loginWithGoogle(firebaseToken)** - Google OAuth
- **loginWithFacebook(firebaseToken)** - Facebook OAuth
- **loginWithPhone(phoneNumber, country)** - Initiate OTP flow
- **verifyOTP(phoneNumber, otp)** - Verify OTP and authenticate
- **logout()** - End session and clear tokens

### Account Management

- **completeProfile(profileData)** - Update user profile after signup
- **resetPassword(email)** - Request password reset
- **refreshAccessToken()** - Manual token refresh

## Storage

The system uses localStorage with these keys:

```javascript
'livn_token'          // Access token (JWT)
'livn_refresh_token'  // Refresh token (for getting new access tokens)
'livn_auth_state'     // Current user object (JSON)
'pending_phone'       // Temporary phone number during OTP verification
```

## Token Refresh Flow

1. **Automatic Refresh**: Tokens are refreshed 5 minutes before expiry
2. **On-Demand Refresh**: If a 401 response occurs, the API client automatically attempts refresh
3. **Session Restoration**: On app startup, stored tokens are validated and restored

## Usage Examples

### Basic Login

```javascript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is now authenticated
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // Your UI here
  );
}
```

### Protected Content

```javascript
import { useAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
    </div>
  );
}
```

### API Requests with Auth

The axios client automatically adds JWT tokens to requests:

```javascript
import { apiClient } from '@/lib/api';

// Token is automatically included in Authorization header
const { data } = await apiClient.get('/api/user/profile');
```

## Integration in App

The `App.jsx` wraps the entire application with `AuthProvider`:

```javascript
<AuthProvider>
  <CartProvider>
    <Router>
      {/* Routes */}
    </Router>
  </CartProvider>
</AuthProvider>
```

## Error Handling

All authentication methods throw errors that can be caught:

```javascript
try {
  await login(email, password);
} catch (err) {
  // err.message contains error description
  // Check AuthProvider for error codes in error.code
}
```

## Security Features

1. **JWT Token Validation**: Tokens are decoded and expiry checked on startup
2. **Automatic Cleanup**: Invalid/expired tokens are cleared from storage
3. **Refresh Token Rotation**: Refresh tokens can be rotated by the server
4. **Request Interceptors**: All requests include valid Authorization headers
5. **Response Interceptors**: 401 responses trigger automatic token refresh
6. **Session Persistence**: Session survives page refreshes

## Backend Requirements

The backend should implement these endpoints:

```
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/google
POST /api/auth/facebook
POST /api/auth/phone/initiate
POST /api/auth/phone/verify
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/profile/complete
POST /api/auth/reset-password
```

Each endpoint should return:
- `token` (JWT access token)
- `refreshToken` (optional refresh token)
- `user` (user object)

## Utilities

### Token Utils (`src/utils/tokenUtils.js`)

- `parseJwt(token)` - Decode JWT payload
- `isTokenExpired(token)` - Check if token is expired
- `getTokenExpiry(token)` - Get expiry timestamp
- `getTimeUntilExpiry(token)` - Get milliseconds until expiry

## Styles

Authentication UI styles are located in `src/styles/auth.css`:

- `.auth-page` - Full page auth layout
- `.auth-overlay` - Modal overlay
- `.auth-modal` - Modal dialog
- `.auth-form` - Form container
- `.auth-input` - Input fields
- `.auth-error` - Error message display
- `.btn-primary` - Primary button style

## Production Checklist

- [ ] Update API base URL for production (VITE_API_URL)
- [ ] Enable HTTPS for all authentication requests
- [ ] Configure CORS properly on backend
- [ ] Implement refresh token rotation
- [ ] Set secure cookie flags (if using cookies)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add email verification for new accounts
- [ ] Configure password reset email service
- [ ] Implement audit logging for auth events
- [ ] Add 2FA support for admin accounts
