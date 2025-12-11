import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTelegramWebApp } from "./lib/telegram";

// Suppress expected 404 errors in console (endpoints not implemented in API)
if (typeof window !== 'undefined') {
  // List of endpoints that are expected to return 404
  const EXPECTED_404_PATTERNS = [
    '/api/auth/me',
    '/api/auth/profile',
    '/api/partners',
    '/api/campaigns',
    '/api/subscriptions',
    '/api/history',
    '/api/reports',
    '/api/favorites',
    '/api/comments',
    '/api/donations',
    '/api/rating/',
  ];
  
  // Override console.error to filter out expected 404s
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    // Check if this is an expected 404 error
    const isExpected404 = EXPECTED_404_PATTERNS.some(pattern => 
      errorString.includes('404') && errorString.includes(pattern)
    );
    
    if (isExpected404) {
      // Suppress this error - it's expected and handled gracefully
      return;
    }
    
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };
  
  // Also filter network errors in console
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warnString = args.join(' ');
    const isExpected404 = EXPECTED_404_PATTERNS.some(pattern => 
      warnString.includes('404') && warnString.includes(pattern)
    );
    
    if (isExpected404) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
  
  // Инициализация Telegram WebApp при загрузке
  initTelegramWebApp();
}

createRoot(document.getElementById("root")!).render(<App />);
