// Admin Dashboard - Main admin page

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, Users, Heart, Building2, 
  Clock, CheckCircle2, XCircle, ArrowRight,
  DollarSign, Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();

  // Fetch admin stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetchApi('/admin/stats'),
    retry: false,
    throwOnError: false,
  });

  const stats = statsData?.data || {};

  // Fetch pending campaigns count
  const { data: pendingCampaignsData } = useQuery({
    queryKey: ['admin', 'campaigns', 'pending'],
    queryFn: () => fetchApi('/admin/campaigns/pending'),
    retry: false,
    throwOnError: false,
  });

  const pendingCount = pendingCampaignsData?.data?.total || pendingCampaignsData?.data?.length || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-primary">Админ-панель</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Управление платформой и модерация контента
            </p>
          </header>

          {isLoading ? (
            <LoadingState text="Загрузка статистики..." />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Кампаний</p>
                        <p className="text-2xl font-bold">{stats.campaigns?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Активных: {stats.campaigns?.active || 0}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">На модерации</p>
                        <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Требуют проверки
                        </Badge>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Пожертвований</p>
                        <p className="text-2xl font-bold">{stats.donations?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.donations?.amount 
                            ? `${Number(stats.donations.amount).toLocaleString()} ₽`
                            : '0 ₽'}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Пользователей</p>
                        <p className="text-2xl font-bold">{stats.users?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Всего</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setLocation('/admin/campaigns')}
                      className="h-auto py-4 flex flex-col items-start gap-2"
                      variant="outline"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold">Модерация кампаний</span>
                      </div>
                      {pendingCount > 0 && (
                        <Badge className="bg-amber-600 text-white">
                          {pendingCount} на проверке
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground text-left">
                        Проверка и одобрение новых кампаний
                      </p>
                    </Button>

                    <Button
                      onClick={() => setLocation('/admin/stats')}
                      className="h-auto py-4 flex flex-col items-start gap-2"
                      variant="outline"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">Статистика</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Детальная аналитика платформы
                      </p>
                    </Button>

                    <Button
                      onClick={() => setLocation('/campaigns')}
                      className="h-auto py-4 flex flex-col items-start gap-2"
                      variant="outline"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <span className="font-bold">Все кампании</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Просмотр всех кампаний платформы
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

