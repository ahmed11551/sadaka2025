import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTelegramWebApp } from "./lib/telegram";

// Suppress expected 404/405 errors in console (endpoints not implemented in API)
if (typeof window !== 'undefined') {
  // List of endpoints that are expected to return 404 or 405
  const EXPECTED_ERROR_PATTERNS = [
    '/api/auth/me',
    '/api/auth/profile',
    '/api/partners',
    '/api/campaigns',
    '/api/subscriptions',
    '/api/subscriptions/checkout',
    '/api/history',
    '/api/reports',
    '/api/favorites',
    '/api/comments',
    '/api/donations',
    '/api/rating/',
  ];
  
  // Function to check if error should be suppressed
  const shouldSuppressError = (message: string): boolean => {
    if (!message) return false;
    const lowerMessage = message.toLowerCase();
    
    // Check for 404 or 405 in the message
    const has404 = lowerMessage.includes('404') || lowerMessage.includes('not found');
    const has405 = lowerMessage.includes('405') || lowerMessage.includes('method not allowed');
    
    if (!has404 && !has405) return false;
    
    // Check if any expected pattern matches
    return EXPECTED_ERROR_PATTERNS.some(pattern => {
      // Check if URL contains the pattern
      return lowerMessage.includes(pattern.toLowerCase()) || 
             lowerMessage.includes(pattern.replace('/api', '').toLowerCase());
    });
  };
  
  // Override console.error to filter out expected 404s/405s
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    if (shouldSuppressError(errorString)) {
      // Suppress this error - it's expected and handled gracefully
      return;
    }
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };
  
  // Also filter network errors in console.warn
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warnString = args.join(' ');
    if (shouldSuppressError(warnString)) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Intercept unhandled promise rejections that might contain 404/405
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    if (shouldSuppressError(errorMessage)) {
      event.preventDefault(); // Suppress the error
    }
  });
  
  // Intercept global errors
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || event.filename || '';
    if (shouldSuppressError(errorMessage)) {
      event.preventDefault(); // Suppress the error
      return false;
    }
  }, true);
  
  // Override fetch to suppress console errors for expected 404/405
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const isExpectedEndpoint = EXPECTED_ERROR_PATTERNS.some(pattern => url.includes(pattern));
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // If it's an expected 404/405, suppress console logging
      if (isExpectedEndpoint && (response.status === 404 || response.status === 405)) {
        // Response is handled gracefully in api.ts, just suppress console noise
        return response;
      }
      
      return response;
    } catch (error) {
      // Re-throw non-expected errors
      throw error;
    }
  };
  
  // Инициализация Telegram WebApp при загрузке
  initTelegramWebApp();
}

createRoot(document.getElementById("root")!).render(<App />);
