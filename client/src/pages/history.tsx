import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, ExternalLink } from "lucide-react";

const data = [
  { name: 'Янв', amount: 1200 },
  { name: 'Фев', amount: 2100 },
  { name: 'Мар', amount: 800 },
  { name: 'Апр', amount: 3500 },
  { name: 'Май', amount: 1500 },
  { name: 'Июн', amount: 2000 },
];

const transactions = [
  { id: 1, date: "15.06.2024", type: "Садака", amount: 500, fund: "Фонд Ихсан", status: "completed" },
  { id: 2, date: "12.06.2024", type: "Подписка", amount: 260, fund: "MubarakWay Pro", status: "completed" },
  { id: 3, date: "01.06.2024", type: "Сбор", amount: 1000, fund: "Мечеть в Казани", status: "completed" },
  { id: 4, date: "25.05.2024", type: "Закят", amount: 12500, fund: "Фонд Закят", status: "report_ready" },
];

export default function HistoryPage() {
  const totalDonated = data.reduce((acc, item) => acc + item.amount, 0);

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
            <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
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
