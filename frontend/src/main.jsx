import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor to redirect local routes to Render Backend in production
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const apiBase = import.meta.env.VITE_API_BASE || '';
  let finalUrl = url;
  if (apiBase && typeof url === 'string') {
    if (url.startsWith('/api/') || url.startsWith('/lms/') || url.startsWith('/courses/')) {
      finalUrl = `${apiBase.replace(/\/$/, '')}${url}`;
    }
  }
  return originalFetch(finalUrl, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
