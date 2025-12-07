import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with full details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error info for rendering
    this.setState({ 
      error, 
      errorInfo,
      hasError: true 
    });

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Always show fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // In development, show error details
      // In production, show minimal error message
      const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
      
      if (isDev) {
        return (
          <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex mb-4 gap-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <h1 className="text-2xl font-bold text-gray-900">Ошибка рендеринга</h1>
                </div>
                <p className="mt-4 text-sm text-gray-600 mb-4">
                  {this.state.error?.message || 'Произошла ошибка при загрузке страницы'}
                </p>
                {this.state.error && (
                  <details className="mt-4 text-xs text-gray-500 mb-4">
                    <summary className="cursor-pointer mb-2">Детали ошибки</summary>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 mt-2">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
                <div className="flex gap-2">
                  <Button onClick={this.handleReset} variant="outline">
                    Попробовать снова
                  </Button>
                  <Button onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}>
                    Обновить страницу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      // Production fallback - minimal error message
      return (
        <div className="p-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Ошибка загрузки страницы</p>
            <Button onClick={this.handleReset} size="sm" variant="outline">
              Попробовать снова
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

