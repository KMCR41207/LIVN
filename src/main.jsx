import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Use a placeholder if VITE_GOOGLE_CLIENT_ID is not set — prevents crash on load
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-not-configured';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
