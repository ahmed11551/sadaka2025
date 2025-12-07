// Payment Success Page - Displayed after successful payment

import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Heart, Share2 } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function PaymentSuccessPage() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Clear any payment-related data from session/localStorage if needed
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-md mx-auto mt-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center" role="img" aria-label="Успешная оплата">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" aria-hidden="true" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  Спасибо за ваше пожертвование!
                </CardTitle>
                <p className="text-muted-foreground">
                  Ваш благотворительный взнос успешно обработан.
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Ваши благие дела помогают</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  Изменять мир к лучшему
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-[#3E5F43] hover:bg-[#2F4832] text-white"
                  aria-label="Вернуться на главную страницу"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Вернуться на главную
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setLocation('/history')}
                  className="w-full"
                  aria-label="Посмотреть историю пожертвований"
                >
                  <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                  Посмотреть историю
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({
                        title: 'Садака-Пасс',
                        text: 'Я сделал пожертвование через MubarakWay!',
                        url: typeof window !== 'undefined' ? window.location.origin : 'https://sadaka2025.vercel.app',
                      }).catch(() => {
                        // User cancelled or error occurred
                      });
                    }
                  }}
                  aria-label="Поделиться новостью о пожертвовании"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

