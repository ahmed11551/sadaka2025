import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorBoundaryFallback({ 
  error, 
  resetError 
}: { 
  error: Error | null; 
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Ошибка загрузки</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600 mb-4">
            Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте обновить страницу.
          </p>
          <div className="flex gap-2">
            <Button onClick={resetError} variant="outline">
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

