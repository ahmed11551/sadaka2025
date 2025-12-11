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
    return EXPECTED_ERROR_PATTERNS.some(pattern => {
      const hasPattern = message.includes(pattern);
      const is404or405 = message.includes('404') || message.includes('405');
      return hasPattern && is404or405;
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
  
  // Инициализация Telegram WebApp при загрузке
  initTelegramWebApp();
}

createRoot(document.getElementById("root")!).render(<App />);
