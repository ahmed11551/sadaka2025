import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, ExternalLink, Loader2 } from "lucide-react";
import { useUserDonations } from "@/hooks/use-donations";
import { useMyHistory } from "@/hooks/use-reports";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  // Fetch donations
  const { data: donationsData, isLoading: donationsLoading } = useUserDonations(1, 100);

  // Fetch history from reports API
  const { data: historyData, isLoading: historyLoading } = useMyHistory({
    ...(filterType !== "all" && { type: filterType as any }),
    ...(filterFrom && { from: filterFrom }),
    ...(filterTo && { to: filterTo }),
  });

  // Fetch subscriptions for active count
  const { data: subscriptionsData } = useSubscriptions();
  const activeSubscriptions = Array.isArray(subscriptionsData?.data) 
    ? subscriptionsData.data.filter((s: any) => s.status === 'active').length
    : 0;

  // Process transactions
  const transactions = useMemo(() => {
    const donations = donationsData?.data?.items || donationsData?.data || [];
    return donations.map((donation: any) => ({
      id: donation.id,
      date: new Date(donation.createdAt).toLocaleDateString('ru-RU'),
      type: donation.type === 'campaign' ? 'Сбор' : donation.type === 'quick' ? 'Садака' : donation.type === 'zakat' ? 'Закят' : donation.type === 'subscription' ? 'Подписка' : donation.type,
      amount: Number(donation.amount),
      fund: donation.campaign?.title || donation.partner?.name || 'Общее',
      status: donation.paymentStatus === 'completed' ? 'completed' : donation.paymentStatus,
    }));
  }, [donationsData]);

  // Calculate monthly data for chart
  const chartData = useMemo(() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const monthlyTotals: Record<number, number> = {};

    transactions.forEach((tx) => {
      if (tx.status === 'completed') {
        const date = new Date(tx.date.split('.').reverse().join('-'));
        const month = date.getMonth();
        monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
      }
    });

    return months.slice(0, 6).map((name, index) => ({
      name,
      amount: monthlyTotals[index] || 0,
    }));
  }, [transactions]);

  const totalDonated = transactions
    .filter((tx) => tx.status === 'completed')
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.append('type', filterType);
      if (filterFrom) params.append('from', filterFrom);
      if (filterTo) params.append('to', filterTo);
      params.append('format', 'csv');

      const url = `/api/reports/donations/export?${params.toString()}`;
      window.open(url, '_blank');
      toast.success('Отчёт экспортирован');
    } catch (error) {
      toast.error('Ошибка при экспорте отчёта');
    }
  };

  return (
    <div className="p-4 space-y-6 pt-6">
      <header>
        <h1 className="text-2xl font-serif font-bold text-primary">Отчетность</h1>
        <p className="text-sm text-muted-foreground">Прозрачность ваших благих дел</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 pt-5">
            <p className="text-sm text-muted-foreground">Всего пожертвовано</p>
            <p className="text-2xl font-bold text-primary mt-1">{totalDonated.toLocaleString()} ₽</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 pt-5">
            <p className="text-sm text-muted-foreground">Активные подписки</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{activeSubscriptions}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Динамика пожертвований</CardTitle>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#888' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? 'hsl(158 65% 40%)' : 'hsl(158 65% 85%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="reports">Отчеты фондов</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-3 mt-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{tx.type}</span>
                    {tx.status === 'report_ready' && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary text-primary h-5">Отчет</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tx.fund} • {tx.date}</p>
                </div>
                <div className="font-bold text-right">
                  {tx.amount} ₽
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 mt-4">
          <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
            <CardContent className="p-6 text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-medium">Отчеты загружаются</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Фонды предоставляют отчеты по итогам месяца. Мы уведомим вас, когда они появятся.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
