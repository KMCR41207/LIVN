# LIVN Development Setup Guide

## Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- MongoDB Atlas account (connection string in server/.env)

## Environment Configuration

### Backend Setup
Create `server/.env` with:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_secret_key
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_admin_password
```

### Frontend Setup
Create `.env` (root) with:
```
VITE_API_URL=http://localhost:5000/api  # for production builds
VITE_GOOGLE_CLIENT_ID=your_google_client_id
ADMIN_EMAIL=admin@livaani.com
```

## Installation

```bash
npm install
```

## Running Development Server

### Option 1: Run Frontend + Backend Together (Recommended)
```bash
npm run dev:all
```
This runs:
- Vite dev server on http://localhost:5173
- Express backend on http://localhost:5000
- Vite automatically proxies /api requests to the backend

### Option 2: Run Separately
Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server
```

## Production Build

```bash
npm run build
```

The build output in `dist/` is served by the Express backend, which also handles all API routes.

## Available Scripts

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run server` - Start Express backend server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm start` - Start server (for production)

## Common Issues

### 502 Bad Gateway
This means the backend server isn't running. Make sure:
1. You've started the backend with `npm run server` or `npm run dev:all`
2. Port 5000 is not in use
3. MongoDB connection string is valid in `server/.env`

### CORS Errors
In development, Vite's proxy automatically handles this. In production, CORS is configured in `server/index.js`.

### MongoDB Connection Issues
Check:
1. Your IP is whitelisted in MongoDB Atlas
2. Connection string in `server/.env` is correct
3. Username and password are URL-encoded

## Architecture

- **Frontend**: React 19 + Vite (http://localhost:5173)
- **Backend**: Express + Node.js (http://localhost:5000)
- **Database**: MongoDB Atlas
- **API**: RESTful with JWT authentication
