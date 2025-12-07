// Payment Failed Page - Displayed when payment fails

import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function PaymentFailedPage() {
  const [location, setLocation] = useLocation();

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-md mx-auto mt-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  Платеж не был завершен
                </CardTitle>
                <p className="text-muted-foreground">
                  Похоже, произошла ошибка при обработке платежа. Попробуйте еще раз.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Если деньги были списаны, свяжитесь с нашей службой поддержки.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-[#3E5F43] hover:bg-[#2F4832] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Вернуться на главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

