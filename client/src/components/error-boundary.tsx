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
      // In development, show error details
      // In production, show fallback or minimal error
      if (process.env.NODE_ENV === 'development' || !this.props.fallback) {
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
                {process.env.NODE_ENV === 'development' && this.state.error && (
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
                  <Button onClick={() => window.location.reload()}>
                    Обновить страницу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      // Use custom fallback if provided
      return this.props.fallback || this.props.children;
    }

    return this.props.children;
  }
}

