import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Info, RotateCcw, Calculator, ArrowRight, Coins, User as UserIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCalculateZakat, usePayZakat } from "@/hooks/use-zakat";

export default function ZakatPage() {
  const [currency, setCurrency] = useState("rub");
  
  // State for assets
  const [cash, setCash] = useState("");
  const [bank, setBank] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [investments, setInvestments] = useState("");
  const [businessAssets, setBusinessAssets] = useState("");
  const [realEstate, setRealEstate] = useState("");
  const [otherAssets, setOtherAssets] = useState("");
  
  // State for liabilities
  const [unpaidDebts, setUnpaidDebts] = useState("");
  const [loansToRepay, setLoansToRepay] = useState("");
  
  const nisab = 442000; // Mock Nisab based on screenshot
  const [selectedFund, setSelectedFund] = useState<string>("");
  
  const calculateZakatMutation = useCalculateZakat();
  const payZakatMutation = usePayZakat();
  
  const calculateTotal = () => {
    const assets = [cash, bank, gold, silver, investments, businessAssets, realEstate, otherAssets]
      .map(val => parseFloat(val) || 0)
      .reduce((a, b) => a + b, 0);
      
    const liabilities = (parseFloat(unpaidDebts) || 0) + (parseFloat(loansToRepay) || 0);
    
    return Math.max(0, assets - liabilities);
  };

  const total = calculateTotal();
  const zakatDue = total >= nisab ? total * 0.025 : 0;

  const handleCalculate = async () => {
    try {
      const result = await calculateZakatMutation.mutateAsync({
        assets: {
          cash_total: parseFloat(cash) || 0,
          gold_g: parseFloat(gold) || 0,
          silver_g: parseFloat(silver) || 0,
          business_goods_value: parseFloat(businessAssets) || 0,
          investments: parseFloat(investments) || 0,
          receivables_collectible: parseFloat(otherAssets) || 0,
        },
        debts_short_term: (parseFloat(unpaidDebts) || 0) + (parseFloat(loansToRepay) || 0),
        nisab_currency: currency.toUpperCase(),
        nisab_value: nisab,
        rate_percent: 2.5,
      });
      
      if (result?.data) {
        toast.success(`Закят рассчитан: ${result.data.zakat_due || zakatDue} ₽`);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePayZakat = async () => {
    if (!selectedFund) {
      toast.error("Выберите фонд для выплаты закята");
      return;
    }
    
    if (zakatDue <= 0) {
      toast.error("Сумма закята должна быть больше нуля");
      return;
    }

    try {
      await payZakatMutation.mutateAsync({
        amount: zakatDue,
        currency: 'RUB',
        fundId: selectedFund,
      });
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const resetForm = () => {
    setCash(""); setBank(""); setGold(""); setSilver("");
    setInvestments(""); setBusinessAssets(""); setRealEstate("");
    setOtherAssets(""); 
    setUnpaidDebts(""); setLoansToRepay("");
  };

  return (
    <div className="p-4 space-y-6 pt-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Калькулятор закята</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Рассчитайте свою обязанность по закяту на основе исламских принципов
          </p>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <UserIcon className="w-5 h-5" />
          </div>
        </Link>
      </header>

      {/* Info Card */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 shadow-none">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Что такое нисаб?</h3>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-500/80 mt-1 leading-relaxed">
                Нисаб — это минимальная сумма имущества, при достижении которой закят становится обязательным. 
                Текущий порог нисаба составляет примерно <span className="font-bold">RUB {nisab.toLocaleString()}</span> на основе стоимости 85г золота.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Selector */}
      <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Выберите валюту</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-12 bg-muted/30 border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rub">RUB - Российский рубль</SelectItem>
              <SelectItem value="usd">USD - Доллар США</SelectItem>
              <SelectItem value="eur">EUR - Евро</SelectItem>
              <SelectItem value="uzs">UZS - Узбекский сум</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Assets Section - Removed the Toggle Menu Block here as requested */}
      <div className="space-y-4">
        
        {/* Cash & Bank */}
        <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Наличные и банковские счета</CardTitle>
            <CardDescription>Включите все наличные деньги и средства на счетах</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Наличные</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg" 
                value={cash}
                onChange={e => setCash(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Банковские счета</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={bank}
                onChange={e => setBank(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gold & Silver */}
        <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Золото и серебро</CardTitle>
            <CardDescription>Введите стоимость золота и серебра во владении</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Стоимость золота</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={gold}
                onChange={e => setGold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Текущая цена золота: ~RUB 5 200/грамм</p>
            </div>
            <div className="space-y-2">
              <Label>Стоимость серебра</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={silver}
                onChange={e => setSilver(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Текущая цена серебра: ~RUB 65/грамм</p>
            </div>
          </CardContent>
        </Card>

        {/* Investments */}
        <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Инвестиции и бизнес</CardTitle>
            <CardDescription>Акции, облигации, товарные запасы бизнеса</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Инвестиции (акции, фонды)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={investments}
                onChange={e => setInvestments(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Активы бизнеса / товары</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={businessAssets}
                onChange={e => setBusinessAssets(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Real Estate */}
        <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Недвижимость и другие активы</CardTitle>
            <CardDescription>Инвестиционная недвижимость (не для жилья)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Стоимость инвест. недвижимости</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={realEstate}
                onChange={e => setRealEstate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Другие активы</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg"
                value={otherAssets}
                onChange={e => setOtherAssets(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card className="shadow-sm border-none shadow-slate-200 dark:shadow-none border-t-4 border-t-red-100 dark:border-t-red-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Долги и займы</CardTitle>
            <CardDescription>Вычтите срочные долги и краткосрочные обязательства</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Непогашенные долги</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg border-destructive/20 focus-visible:ring-destructive"
                value={unpaidDebts}
                onChange={e => setUnpaidDebts(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Займы к погашению</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 text-lg border-destructive/20 focus-visible:ring-destructive"
                value={loansToRepay}
                onChange={e => setLoansToRepay(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      <Card className={cn(
        "shadow-lg border-none transition-colors duration-300",
        zakatDue > 0 ? "bg-primary/5 dark:bg-primary/10" : "bg-muted/30"
      )}>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-bold mb-1">
            <Calculator className="w-5 h-5" />
            <span>Расчёт закята</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Всего активов</span>
            <span className="font-medium">RUB {calculateTotal() + (parseFloat(unpaidDebts) || 0) + (parseFloat(loansToRepay) || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Всего обязательств</span>
            <span className="font-medium text-destructive">- RUB {(parseFloat(unpaidDebts) || 0) + (parseFloat(loansToRepay) || 0)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Чистое имущество</span>
            <span>RUB {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Порог нисаба</span>
            <span>RUB {nisab.toLocaleString()}</span>
          </div>

          <div className={cn(
            "mt-4 p-4 rounded-xl border flex gap-3 items-start",
            zakatDue > 0 
              ? "bg-white dark:bg-slate-900 border-primary/20" 
              : "bg-white dark:bg-slate-900 border-muted"
          )}>
            {zakatDue > 0 ? (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">К оплате:</span>
                  <span className="font-bold text-2xl text-primary">{zakatDue.toLocaleString()} ₽</span>
                </div>
                <div className="space-y-2">
                   <Select value={selectedFund} onValueChange={setSelectedFund}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите фонд для закята" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insan">Фонд «Ихсан» (РФ)</SelectItem>
                      <SelectItem value="zakat">Закят.Ру (РФ)</SelectItem>
                      <SelectItem value="ihh">IHH (Турция)</SelectItem>
                      <SelectItem value="africa">Помощь Африке (Int)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full h-12 text-lg font-bold shadow-md shadow-primary/20"
                    onClick={handlePayZakat}
                    disabled={payZakatMutation.isPending || zakatDue <= 0 || !selectedFund}
                  >
                    {payZakatMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        Выплатить закят
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Закят не требуется</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ваше имущество ниже порога нисаба. Закят в данный момент не обязателен, но добровольная милостыня (садака) всегда приветствуется.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={resetForm}>
            <RotateCcw className="w-4 h-4 mr-2" /> Сбросить
          </Button>
        </CardFooter>
      </Card>
      
      {/* Footer Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-muted/50">
        <h3 className="font-bold mb-3">О закяте</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Закят — один из пяти столпов Ислама и обязательный акт благотворительности для мусульман, владеющих имуществом выше порога нисаба в течение одного лунного года.
        </p>
        <h4 className="font-bold text-sm mb-2">Ключевые моменты:</h4>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
          <li>Ставка закята составляет 2,5% от облагаемого имущества</li>
          <li>Имущество должно находиться в собственности один лунный год (хауль)</li>
          <li>Нисаб основан на стоимости 85г золота или 595г серебра</li>
          <li>Личное жильё и предметы первой необходимости не облагаются закятом</li>
        </ul>
      </div>
    </div>
  );
}
