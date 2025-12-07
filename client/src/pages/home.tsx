import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { User as UserIcon, Heart, Gift, Check, Sparkles, ChevronLeft, ChevronRight, Layers, ChevronDown, ChevronUp, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import emergencyImg from "@assets/generated_images/emergency_humanitarian_aid.png";
import mosqueImg from "@assets/generated_images/mosque_construction_campaign.png";
import educationImg from "@assets/generated_images/education_charity_campaign.png";
import { useCampaigns } from "@/hooks/use-campaigns";
import { usePartners } from "@/hooks/use-partners";
import { useAuth } from "@/hooks/use-auth";
import { DonationModal } from "@/components/donation-modal";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { AlertCircle, TrendingUp, Heart as HeartIcon } from "lucide-react";

const fundsByCountry = {
  ru: [
    { id: "insan", name: "Фонд «Ихсан»", verified: true },
    { id: "zakat_ru", name: "Закят.Ру", verified: true },
    { id: "salsabil", name: "Сальсабиль", verified: true },
  ],
  uz: [
    { id: "vaqf", name: "Фонд «Вакф»", verified: true },
    { id: "ezgu", name: "Ezgu Amal", verified: true },
  ],
  tr: [
    { id: "kizilay", name: "Kızılay", verified: true },
    { id: "ihh", name: "IHH", verified: true },
  ],
};

const subscriptionPlans = [
  {
    id: "muslim",
    name: "Муслим",
    subtitle: "Free",
    price: { monthly: "0 ₽", "6months": "0 ₽", "12months": "0 ₽", "3years": "0 ₽" },
    bg: "bg-[#FFFBF4]",
    text: "text-[#1F2937]",
    features: [
      "Ai-ассистент (3 запроса в день, история 1 неделя)",
      "Коран гид (3 чтеца с подсветкой слов, быстрый поиск, 30 чтецов)",
      "Намаз-ассистент (кибла, расписание, уведомления)",
      "Базовая статистика за день",
      "Бесплатные книги и статьи",
      "Нашиды",
      "Уроки (алифба, намазы, омовение)",
      "Цели и привычки (8 целей)",
      "99 имен АЛЛАХА",
      "Зикры (дуа, азкары, салаваты)",
      "Тасбих",
      "Садака",
      "Избранные (ограничено)",
      "Халяль реклама"
    ],
    buttonText: "Текущий тариф",
    buttonVariant: "outline" as const
  },
  {
    id: "pro",
    name: "Мутахсин",
    subtitle: "Pro",
    price: { monthly: "330 ₽", "6months": "1 375 ₽", "12months": "2 750 ₽", "3years": "7 709 ₽" },
    discount: { "6months": "-16%", "12months": "-16%", "3years": "-19%" },
    bg: "bg-[#FFFBF4]",
    text: "text-[#1F2937]",
    features: [
      "Все что тарифе «Муслим»",
      "Ai-ассистент (до 30 запросов в день, расширенные ответы)",
      "Коран гид (хатм-коллективный, 12 чтецов с подсветкой)",
      "Расширенные отчеты за месяц с рекомендациями от Ai",
      "Доступ к эксклюзивной библиотеке",
      "Персональные цели (без ограничений)",
      "Избранные (расширено)",
      "Садака-джария (5% от подписки в фонды)"
    ],
    buttonText: "Выбрать миссию",
    buttonVariant: "default" as const
  },
  {
    id: "premium",
    name: "Сахиб аль-Вакф",
    subtitle: "Premium",
    price: { monthly: "650 ₽", "6months": "2 708 ₽", "12months": "5 417 ₽", "3years": "15 185 ₽" },
    discount: { "6months": "-16%", "12months": "-16%", "3years": "-22%" },
    bg: "bg-[#D4C5A3]",
    text: "text-[#1F2937]",
    features: [
      "Все что тарифе «Мутахсин»",
      "Ai-ассистент (безлимитное количество запросов)",
      "Годовой отчет с инсайтами, сравнение по периодам с персональными рекомендациями от Ai",
      "Ранний доступ к новым функциям",
      "Избранные (безлимит)",
      "Садака-джария (10% от стоимости подписки в фонды)",
      "LifeStyle (Pro) – 3 года",
      "LifeStyle (Premium) – 3 года"
    ],
    buttonText: "Выбрать миссию",
    buttonVariant: "default" as const
  }
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [country, setCountry] = useState("ru");
  const [donationCategory, setDonationCategory] = useState("");
  const [urgentIndex, setUrgentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fundIndex, setFundIndex] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<{ planId: string; period: string; price: number } | null>(null);
  
  // Handle subscription period selection
  const handlePeriodSelect = (planId: string, period: string, price: number) => {
    setSelectedPlanPeriod({ planId, period, price });
    // TODO: Integrate with subscription payment flow
    // For now, redirect to profile or show subscription modal
    toast.info(`Выбран тариф: ${planId === 'pro' ? 'Мутахсин (Pro)' : 'Сахиб аль-Вакф (Premium)'} на период ${period}. Цена: ${price} ₽\n\nИнтеграция с оплатой будет добавлена.`);
  };
  const [shuffledFunds, setShuffledFunds] = useState<any[]>([]);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<any>(null);
  const [donationType, setDonationType] = useState<"campaign" | "quick" | "subscription" | "mubarakway">("campaign");
  const [quickDonationAmount, setQuickDonationAmount] = useState<number | null>(null);
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [projectDonationAmount, setProjectDonationAmount] = useState<number | null>(null);

  // Fetch campaigns from API
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({
    status: 'active',
    limit: 20
  });

  // Auth state
  const { isAuthenticated } = useAuth();

  // Fetch partners from API
  const { data: partnersData, isLoading: partnersLoading } = usePartners({
    country,
    limit: 10
  });

  // Process campaigns data
  const campaigns = useMemo(() => {
    if (!campaignsData?.data) return [];
    return Array.isArray(campaignsData.data) ? campaignsData.data : campaignsData.data.items || [];
  }, [campaignsData]);

  // Get urgent campaigns
  const urgentCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => c && c.id && c.urgent).slice(0, 5).map((c: any) => ({
      id: c.id || '',
      title: c.title || 'Без названия',
      fund: c.partner?.name || 'Фонд',
      image: c.image || emergencyImg,
      collected: Number(c.collected || 0),
      goal: Number(c.goal || 0)
    }));
  }, [campaigns]);

  // Get active user campaigns (private campaigns)
  const activeUserCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => c && c.id && c.type === 'private' && c.status === 'active').slice(0, 5).map((c: any) => ({
      id: c.id || '',
      title: c.title || 'Без названия',
      author: c.author?.fullName || c.author?.username || 'Пользователь',
      collected: Number(c.collected || 0),
      goal: Number(c.goal || 0),
      image: c.image || mosqueImg
    }));
  }, [campaigns]);

  // Get completed campaigns
  const completedCampaigns = useMemo(() => {
    if (!campaignsData?.data) return [];
    const completed = Array.isArray(campaignsData.data) 
      ? campaignsData.data.filter((c: any) => c && c.id && c.status === 'completed')
      : campaignsData.data.items?.filter((c: any) => c && c.id && c.status === 'completed') || [];
    
    return completed.slice(0, 2).map((c: any) => ({
      id: c.id || '',
      title: c.title || 'Без названия',
      fund: c.partner?.name || c.author?.fullName || 'Организатор',
      image: c.image || mosqueImg,
      collected: Number(c.collected || 0),
      goal: Number(c.goal || 0)
    }));
  }, [campaignsData]);

  // Get partners for fundsByCountry
  const fundsByCountry = useMemo(() => {
    if (!partnersData?.data) return { ru: [], uz: [], tr: [] };
    const partners = Array.isArray(partnersData.data) ? partnersData.data : partnersData.data.items || [];
    
    return {
      ru: partners.filter((p: any) => p.country === 'ru').map((p: any) => ({
        id: p.id,
        name: p.name,
        verified: p.verified
      })),
      uz: partners.filter((p: any) => p.country === 'uz').map((p: any) => ({
        id: p.id,
        name: p.name,
        verified: p.verified
      })),
      tr: partners.filter((p: any) => p.country === 'tr').map((p: any) => ({
        id: p.id,
        name: p.name,
        verified: p.verified
      }))
    };
  }, [partnersData]);

  useEffect(() => {
    if (urgentCampaigns.length > 0) {
      const interval = setInterval(() => {
        setUrgentIndex((prev) => (prev + 1) % urgentCampaigns.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [urgentCampaigns.length]);

  useEffect(() => {
    if (activeUserCampaigns.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % activeUserCampaigns.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeUserCampaigns.length]);

  useEffect(() => {
    // Shuffle funds on mount
    const allFunds = Object.values(fundsByCountry).flat();
    const shuffled = [...allFunds].sort(() => Math.random() - 0.5);
    setShuffledFunds(shuffled);
  }, [fundsByCountry]);

  const nextUrgent = () => {
    if (urgentCampaigns.length > 0) {
      setUrgentIndex((prev) => (prev + 1) % urgentCampaigns.length);
    }
  };
  const prevUrgent = () => {
    if (urgentCampaigns.length > 0) {
      setUrgentIndex((prev) => (prev - 1 + urgentCampaigns.length) % urgentCampaigns.length);
    }
  };

  const nextActive = () => {
    if (activeUserCampaigns.length > 0) {
      setActiveIndex((prev) => (prev + 1) % activeUserCampaigns.length);
    }
  };
  const prevActive = () => {
    if (activeUserCampaigns.length > 0) {
      setActiveIndex((prev) => (prev - 1 + activeUserCampaigns.length) % activeUserCampaigns.length);
    }
  };

  const nextFund = () => setFundIndex((prev) => (prev + 1) % Math.ceil(shuffledFunds.length / 3));
  const prevFund = () => setFundIndex((prev) => (prev - 1 + Math.ceil(shuffledFunds.length / 3)) % Math.ceil(shuffledFunds.length / 3));

  const togglePlanExpand = (id: string) => {
    setExpandedPlans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-4 space-y-6 pt-6 pb-24">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">MubarakWay</h1>
          <p className="text-sm text-muted-foreground">Ваш путь к благому</p>
        </div>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer">
                  <UserIcon className="w-5 h-5" />
                </div>
              </Link>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-10">
                Войти
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="space-y-2">
        <h2 className="text-lg font-bold font-serif px-1">Быстрые платежи</h2>
        <Tabs defaultValue="donate" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="donate" className="rounded-lg text-xs sm:text-sm">Садака</TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg text-xs sm:text-sm">Проект</TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg text-xs sm:text-sm">Подписка</TabsTrigger>
          </TabsList>

          <TabsContent value="donate" className="space-y-4 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle>Быстрое пожертвование</CardTitle>
                  <CardDescription>Выберите фонд и направление помощи</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <Select value={donationCategory} onValueChange={setDonationCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Цель пожертвования" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support_project" className="font-bold text-primary">Поддержать MubarakWay</SelectItem>
                        <SelectItem value="orphans">Помощь сиротам</SelectItem>
                        <SelectItem value="food">Продуктовые наборы</SelectItem>
                        <SelectItem value="mosque">Строительство мечетей</SelectItem>
                        <SelectItem value="zakat">Закят</SelectItem>
                        <SelectItem value="sadaka">Общая Садака</SelectItem>
                      </SelectContent>
                    </Select>

                    {donationCategory !== "support_project" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Страна" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ru">Россия 🇷🇺</SelectItem>
                            <SelectItem value="uz">Узбекистан 🇺🇿</SelectItem>
                            <SelectItem value="tr">Турция 🇹🇷</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={selectedFund} onValueChange={setSelectedFund}>
                          <SelectTrigger>
                            <SelectValue placeholder="Фонд" />
                          </SelectTrigger>
                          <SelectContent>
                            {fundsByCountry[country as keyof typeof fundsByCountry]?.map(fund => (
                              <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium">Сумма (₽)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 300, 500, 1000].map((amount) => (
                        <Button 
                          key={amount} 
                          type="button"
                          variant={quickDonationAmount === amount ? "default" : "outline"} 
                          className={cn(
                            "h-9 hover:border-primary hover:text-primary hover:bg-primary/5",
                            quickDonationAmount === amount && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => setQuickDonationAmount(amount)}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Input 
                      placeholder="Другая сумма" 
                      type="number" 
                      className="text-lg" 
                      value={quickDonationAmount && ![100, 300, 500, 1000].includes(quickDonationAmount) ? quickDonationAmount : ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          setQuickDonationAmount(value);
                        } else if (e.target.value === "") {
                          setQuickDonationAmount(null);
                        }
                      }}
                    />
                  </div>

                  <Button 
                    className="w-full h-12 text-lg font-medium shadow-md shadow-primary/20 mt-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
                    onClick={() => {
                      if (!quickDonationAmount || quickDonationAmount <= 0) {
                        toast.error("Выберите или введите сумму пожертвования");
                        return;
                      }
                      setDonationType("quick");
                      setDonationModalOpen(true);
                    }}
                  >
                    Оплатить
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Безопасный платеж. Принимаем карты РФ и мира.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Funds List - Carousel Removed as per request */}
            {/* <div className="space-y-3 pt-4"> ... </div> */}

            {/* Urgent Collections - Only in Donate Tab */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold font-serif flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Срочные сборы
                </h2>
                <div className="flex items-center gap-3">
                  <Link href="/campaigns?filter=urgent" className="text-xs text-muted-foreground hover:underline">
                    Все
                  </Link>
                  {urgentCampaigns.length > 1 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={prevUrgent}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={nextUrgent}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {campaignsLoading ? (
                <Card className="border-none shadow-md overflow-hidden relative h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </Card>
              ) : urgentCampaigns.length > 0 ? (
                <Link href="/campaigns">
                  <Card className="border-none shadow-md overflow-hidden relative h-48 cursor-pointer hover:opacity-95 transition-opacity group">
                    <img 
                      src={urgentCampaigns[urgentIndex]?.image || emergencyImg} 
                      alt={urgentCampaigns[urgentIndex]?.title || 'Кампания'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-white">
                      <Badge variant="secondary" className="self-start mb-2 bg-red-500 text-white border-none">Срочно</Badge>
                      <h3 className="text-xl font-bold leading-tight">{urgentCampaigns[urgentIndex]?.title}</h3>
                      <p className="text-sm opacity-90 mt-1">{urgentCampaigns[urgentIndex]?.fund}</p>
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 border-none" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 border-none" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="border-none shadow-md overflow-hidden relative min-h-[192px]">
                  <CardContent className="p-6">
                    <EmptyState
                      icon={AlertCircle}
                      title="Нет срочных сборов"
                      description="Срочные сборы скоро появятся. Следите за обновлениями!"
                      action={{
                        label: "Посмотреть все кампании",
                        onClick: () => setLocation("/campaigns")
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Active User Campaigns - Carousel Style */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold font-serif">Активные кампании</h2>
                <div className="flex items-center gap-3">
                   <Link href="/campaigns" className="text-xs text-muted-foreground hover:underline">
                    Все
                  </Link>
                  {activeUserCampaigns.length > 1 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={prevActive}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={nextActive}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {campaignsLoading ? (
                <Card className="border-none shadow-md overflow-hidden relative min-h-[192px]">
                  <CardContent className="p-6">
                    <LoadingState size="md" text="Загрузка кампаний..." />
                  </CardContent>
                </Card>
              ) : activeUserCampaigns.length > 0 ? (
                <Link href="/campaigns">
                  <Card className="border-none shadow-md overflow-hidden relative h-48 cursor-pointer hover:opacity-95 transition-opacity">
                    <img 
                      src={activeUserCampaigns[activeIndex]?.image || mosqueImg} 
                      alt={activeUserCampaigns[activeIndex]?.title || 'Кампания'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-white">
                      <h3 className="text-xl font-bold leading-tight">{activeUserCampaigns[activeIndex]?.title}</h3>
                      <p className="text-sm opacity-90 mt-1">Автор: {activeUserCampaigns[activeIndex]?.author}</p>
                      <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden mt-2">
                          <div 
                            className="bg-white h-full rounded-full" 
                            style={{ width: `${activeUserCampaigns[activeIndex]?.goal ? (activeUserCampaigns[activeIndex].collected / activeUserCampaigns[activeIndex].goal) * 100 : 0}%` }}
                          />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1 font-medium opacity-90">
                          <span>{activeUserCampaigns[activeIndex]?.collected.toLocaleString()} ₽</span>
                          <span>из {activeUserCampaigns[activeIndex]?.goal.toLocaleString()} ₽</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 border-none" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 border-none" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="border-none shadow-md overflow-hidden relative min-h-[192px]">
                  <CardContent className="p-6">
                    <EmptyState
                      icon={TrendingUp}
                      title="Нет активных кампаний"
                      description="Активные кампании скоро появятся. Вы можете создать свою кампанию!"
                      action={{
                        label: "Создать кампанию",
                        onClick: () => setLocation("/campaigns")
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Completed Campaigns */}
            <div className="space-y-3 pt-6 pb-8">
               <div className="flex items-center justify-between px-1">
                 <h2 className="text-lg font-bold font-serif text-muted-foreground">Завершенные</h2>
                 <Link href="/campaigns?tab=completed" className="text-xs text-muted-foreground hover:underline">Архив</Link>
               </div>
               {campaignsLoading ? (
                 <LoadingState size="sm" text="Загрузка завершенных кампаний..." />
               ) : completedCampaigns.length > 0 ? (
                 <div className="grid grid-cols-2 gap-3">
                   {completedCampaigns.map((campaign) => (
                     <Card key={campaign.id} className="overflow-hidden border-none shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                       <div className="h-24 relative grayscale">
                         <img src={campaign.image || mosqueImg} className="w-full h-full object-cover" alt={campaign.title} />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                           <Badge variant="secondary" className="bg-white/90 text-black font-bold">Сбор закрыт</Badge>
                         </div>
                       </div>
                       <CardContent className="p-3">
                         <h3 className="font-bold text-xs leading-tight mb-1 line-clamp-2">{campaign.title}</h3>
                         <p className="text-[10px] text-muted-foreground">Собрано: {campaign.collected.toLocaleString()} ₽</p>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <EmptyState
                   icon={Check}
                   title="Нет завершенных кампаний"
                   description="Завершенные кампании будут отображаться здесь"
                   className="py-8"
                 />
               )}
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-4 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-primary/10 p-6 flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                    <Sparkles className="w-8 h-8 text-primary fill-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-primary-foreground/90 dark:text-primary">Развитие проекта</h3>
                  <p className="text-sm text-muted-foreground max-w-[260px]">
                    Поддержите разработку MubarakWay. Ваша помощь позволяет нам создавать новые инструменты для уммы.
                  </p>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2500].map((amount) => (
                      <Button 
                        key={amount} 
                        type="button"
                        variant={projectDonationAmount === amount ? "default" : "outline"} 
                        className={cn(
                          "h-auto py-3 flex flex-col gap-1 hover:border-primary hover:bg-primary/5",
                          projectDonationAmount === amount && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => setProjectDonationAmount(amount)}
                      >
                        <span className="font-bold text-lg">{amount} ₽</span>
                      </Button>
                    ))}
                  </div>
                  <Input 
                    placeholder="Своя сумма поддержки" 
                    type="number"
                    className="text-center text-lg" 
                    value={projectDonationAmount && ![500, 1000, 2500].includes(projectDonationAmount) ? projectDonationAmount : ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setProjectDonationAmount(value);
                      } else if (e.target.value === "") {
                        setProjectDonationAmount(null);
                      }
                    }}
                  />
                  <Button 
                    className="w-full h-12 text-lg shadow-lg shadow-primary/20"
                    onClick={() => {
                      if (!projectDonationAmount || projectDonationAmount <= 0) {
                        toast.error("Выберите или введите сумму поддержки");
                        return;
                      }
                      setDonationType("mubarakway");
                      setDonationModalOpen(true);
                    }}
                  >
                    Поддержать MubarakWay
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
                  <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Тарифы</h3>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-primary h-8">
                        <Layers className="w-4 h-4 mr-2" />
                        Цены
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                       <DialogHeader>
                         <DialogTitle>Сравнение тарифов</DialogTitle>
                         <DialogDescription>Выберите подходящий план пожертвований</DialogDescription>
                       </DialogHeader>
                       <div className="space-y-8 mt-4">
                         {/* Pro Pricing Table */}
                         <div className="space-y-3">
                           <div className="flex justify-between items-center">
                             <div>
                               <h4 className="font-bold text-lg text-[#3E5F43]">Мутахсин (Pro)</h4>
                               <p className="text-sm text-muted-foreground">5% Садака-джария в фонды</p>
                             </div>
                           </div>
                           
                           <div className="border rounded-xl overflow-hidden text-sm">
                             <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] bg-muted/30 p-3 font-medium text-xs text-muted-foreground">
                               <div>Период</div>
                               <div className="text-center">Бонус</div>
                               <div className="text-right">Цена</div>
                               <div className="text-right">Выгода</div>
                             </div>
                             
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('pro', '1month', 330)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('pro', '1month', 330);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Pro на 1 месяц за 330 ₽"
                            >
                              <div className="font-medium">1 месяц</div>
                              <div className="text-center text-muted-foreground">-</div>
                              <div className="text-right">
                                <span className="font-bold">330 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 17 р.</span>
                              </div>
                              <div className="text-right text-muted-foreground">-</div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer group relative overflow-hidden" 
                              onClick={() => handlePeriodSelect('pro', '6months', 1375)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('pro', '6months', 1375);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Pro на 6 месяцев за 1 375 ₽"
                            >
                              <div className="font-medium">6 месяцев</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+1 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">1 650 ₽</span>
                                <span className="font-bold text-emerald-700">1 375 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 69 р.</span>
                              </div>
                              <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                              <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/10 pointer-events-none transition-colors"></div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('pro', '12months', 2750)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('pro', '12months', 2750);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Pro на 1 год за 2 750 ₽"
                            >
                              <div className="font-medium">1 год</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+2 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">3 300 ₽</span>
                                <span className="font-bold text-emerald-700">2 750 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 138 р.</span>
                              </div>
                              <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('pro', '3years', 7709)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('pro', '3years', 7709);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Pro на 3 года за 7 709 ₽"
                            >
                              <div className="font-medium leading-tight">3 года <span className="block text-[10px] text-muted-foreground font-normal">LifeStyle</span></div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5 h-5 border-amber-200">+7 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">9 570 ₽</span>
                                <span className="font-bold text-amber-700">7 709 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 385 р.</span>
                              </div>
                              <div className="text-right text-amber-600 font-bold text-xs">-19%</div>
                            </div>
                           </div>
                         </div>

                         {/* Premium Pricing Table */}
                         <div className="space-y-3">
                           <div className="flex justify-between items-center">
                             <div>
                               <h4 className="font-bold text-lg text-[#D4C5A3] dark:text-[#E5D5B3]">Сахиб аль-Вакф (Premium)</h4>
                               <p className="text-sm text-muted-foreground">10% Садака-джария в фонды</p>
                             </div>
                           </div>

                           <div className="border rounded-xl overflow-hidden text-sm">
                             <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] bg-muted/30 p-3 font-medium text-xs text-muted-foreground">
                               <div>Период</div>
                               <div className="text-center">Бонус</div>
                               <div className="text-right">Цена</div>
                               <div className="text-right">Выгода</div>
                             </div>
                             
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('premium', '1month', 650)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('premium', '1month', 650);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Premium на 1 месяц за 650 ₽"
                            >
                              <div className="font-medium">1 месяц</div>
                              <div className="text-center text-muted-foreground">-</div>
                              <div className="text-right">
                                <span className="font-bold">650 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 65 р.</span>
                              </div>
                              <div className="text-right text-muted-foreground">-</div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('premium', '6months', 2708)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('premium', '6months', 2708);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Premium на 6 месяцев за 2 708 ₽"
                            >
                              <div className="font-medium">6 месяцев</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+1 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">3 250 ₽</span>
                                <span className="font-bold text-emerald-700">2 708 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 271 р.</span>
                              </div>
                              <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('premium', '12months', 5417)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('premium', '12months', 5417);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Premium на 1 год за 5 417 ₽"
                            >
                              <div className="font-medium">1 год</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+2 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">6 500 ₽</span>
                                <span className="font-bold text-emerald-700">5 417 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 542 р.</span>
                              </div>
                              <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                            </div>
                            
                            <div 
                              className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer group" 
                              onClick={() => handlePeriodSelect('premium', '3years', 15185)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handlePeriodSelect('premium', '3years', 15185);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label="Выбрать тариф Premium на 3 года за 15 185 ₽"
                            >
                              <div className="font-medium leading-tight">3 года <span className="block text-[10px] text-muted-foreground font-normal">LifeStyle</span></div>
                              <div className="text-center">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5 h-5 border-amber-200">+7 мес</Badge>
                              </div>
                              <div className="text-right">
                                <span className="line-through text-muted-foreground text-[10px] block">18 850 ₽</span>
                                <span className="font-bold text-amber-700">15 185 ₽</span>
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">из них ваша садака-джария 1 519 р.</span>
                              </div>
                              <div className="text-right text-amber-600 font-bold text-xs">-22%</div>
                            </div>
                           </div>
                         </div>
                         
                         <p className="text-xs text-center text-muted-foreground">
                           Нажмите на строку с тарифом, чтобы перейти к оплате
                         </p>
                       </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Hero Card */}
              <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Gift className="w-5 h-5" />
                    <span className="font-serif">Садака-пасс</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    Ваша регулярная милостыня
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Сделайте садака-джария на развитие цифровой уммы и получите доступ к знаниям в благодарность.
                  </p>
                  <Separator className="bg-emerald-200/50 dark:bg-emerald-800/50" />
                  <p className="text-xs text-muted-foreground">
                    Приобретая подписку, вы не совершаете покупку. Вы делаете садака-джария (непрерывную милостыню) на развитие глобального проекта.
                    Часть вашего взноса (5% от Pro и 10% от Premium) автоматически направляется в благотворительный фонд.
                  </p>
                </CardContent>
              </Card>

              {/* Plans - Vertical Cards Style */}
              <div className="grid grid-cols-1 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={cn(
                      "rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden border-none shadow-sm",
                      plan.bg,
                      plan.text
                    )}
                  >
                    {plan.id === 'premium' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none" />
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2 opacity-80 mb-1">
                        <div className="w-4 h-4">
                          {plan.id === 'muslim' ? '🌱' : plan.id === 'pro' ? '🪴' : '🌳'}
                        </div>
                        <span className="text-sm font-medium">{plan.subtitle}</span>
                      </div>
                      <h3 className="text-3xl font-bold tracking-tight">{plan.name}</h3>
                      <div className="flex items-end gap-2 mt-1">
                        <p className="text-lg font-medium opacity-90">
                          {typeof plan.price === 'string' ? plan.price : plan.price.monthly}
                          {plan.id !== 'muslim' && <span className="text-sm font-normal opacity-70"> / мес</span>}
                        </p>
                        <Dialog open={selectedPlanId === plan.id} onOpenChange={(open) => {
                          if (!open) setSelectedPlanId(null);
                          else setSelectedPlanId(plan.id);
                        }}>
                             <DialogTrigger asChild>
                               <Button 
                                 variant="link" 
                                 className="p-0 h-auto text-xs text-primary font-bold underline decoration-dashed underline-offset-4 opacity-100 hover:text-primary/80 hover:scale-105 transition-all"
                                 onClick={() => setSelectedPlanId(plan.id)}
                               >
                                 Выбирайте со скидкой
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Сравнение тарифов: {plan.name}</DialogTitle>
                                  <DialogDescription>
                                    {plan.id === 'muslim' ? 'Информация о бесплатном тарифе' : 'Выберите подходящий период оплаты'}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-8 mt-4">
                                  {/* Free Plan Info */}
                                  {plan.id === 'muslim' && (
                                    <div className="space-y-4">
                                      <div className="bg-muted/30 p-4 rounded-lg">
                                        <h4 className="font-bold text-lg mb-2">Муслим (Free)</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                          Это ваш текущий тариф. Вы уже используете все доступные функции бесплатного плана.
                                        </p>
                                        <p className="text-sm font-medium">
                                          Для получения дополнительных возможностей рассмотрите тарифы Pro или Premium.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Pro Pricing Table */}
                                  {plan.id === 'pro' && (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-bold text-lg text-[#3E5F43]">Мутахсин (Pro)</h4>
                                        <p className="text-sm text-muted-foreground">5% Садака-джария в фонды</p>
                                      </div>
                                    </div>
                                    
                                    <div className="border rounded-xl overflow-hidden text-sm">
                                      <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] bg-muted/30 p-3 font-medium text-xs text-muted-foreground">
                                        <div>Период</div>
                                        <div className="text-center">Бонус</div>
                                        <div className="text-right">Цена</div>
                                        <div className="text-right">Выгода</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group focus:bg-muted/10 active:bg-muted/20" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('pro', '1month', 330)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('pro', '1month', 330);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 1 месяц за 330 ₽"
                                      >
                                        <div className="font-medium">1 месяц</div>
                                        <div className="text-center text-muted-foreground">-</div>
                                        <div className="text-right font-bold">330 ₽</div>
                                        <div className="text-right text-muted-foreground">-</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer group relative overflow-hidden focus:bg-emerald-50/60 active:bg-emerald-100/50" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('pro', '6months', 1375)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('pro', '6months', 1375);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 6 месяцев за 1 375 ₽"
                                      >
                                        <div className="font-medium">6 месяцев</div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+1 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">1 650 ₽</span>
                                          <span className="font-bold text-emerald-700">1 375 ₽</span>
                                        </div>
                                        <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                                        <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/10 pointer-events-none transition-colors"></div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group focus:bg-muted/10 active:bg-muted/20" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('pro', '12months', 2750)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('pro', '12months', 2750);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 1 год за 2 750 ₽"
                                      >
                                        <div className="font-medium">1 год</div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+2 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">3 300 ₽</span>
                                          <span className="font-bold text-emerald-700">2 750 ₽</span>
                                        </div>
                                        <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer group focus:bg-amber-50/60 active:bg-amber-100/50" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('pro', '3years', 7709)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('pro', '3years', 7709);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 3 года за 7 709 ₽"
                                      >
                                        <div className="font-medium leading-tight">
                                          3 года 
                                          <span className="block text-[10px] text-muted-foreground font-normal">LifeStyle</span>
                                          <Badge variant="outline" className="mt-1 text-[8px] h-4 px-1 bg-white/50 text-amber-700 border-amber-200">ОГРАНИЧЕНО</Badge>
                                        </div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5 h-5 border-amber-200">+7 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">9 570 ₽</span>
                                          <span className="font-bold text-amber-700">7 709 ₽</span>
                                        </div>
                                        <div className="text-right text-amber-600 font-bold text-xs">-19%</div>
                                      </div>
                                    </div>
                                  </div>
                                  )}

                                  {/* Premium Pricing Table */}
                                  {plan.id === 'premium' && (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-bold text-lg text-[#D4C5A3] dark:text-[#E5D5B3]">Сахиб аль-Вакф (Premium)</h4>
                                        <p className="text-sm text-muted-foreground">10% Садака-джария в фонды</p>
                                      </div>
                                    </div>

                                    <div className="border rounded-xl overflow-hidden text-sm">
                                      <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] bg-muted/30 p-3 font-medium text-xs text-muted-foreground">
                                        <div>Период</div>
                                        <div className="text-center">Бонус</div>
                                        <div className="text-right">Цена</div>
                                        <div className="text-right">Выгода</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group focus:bg-muted/10 active:bg-muted/20" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('premium', '1month', 650)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('premium', '1month', 650);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 1 месяц за 650 ₽"
                                      >
                                        <div className="font-medium">1 месяц</div>
                                        <div className="text-center text-muted-foreground">-</div>
                                        <div className="text-right font-bold">650 ₽</div>
                                        <div className="text-right text-muted-foreground">-</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer group focus:bg-emerald-50/60 active:bg-emerald-100/50" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('premium', '6months', 2708)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('premium', '6months', 2708);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 6 месяцев за 2 708 ₽"
                                      >
                                        <div className="font-medium">6 месяцев</div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+1 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">3 250 ₽</span>
                                          <span className="font-bold text-emerald-700">2 708 ₽</span>
                                        </div>
                                        <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center hover:bg-muted/10 transition-colors cursor-pointer group focus:bg-muted/10 active:bg-muted/20" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('premium', '12months', 5417)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('premium', '12months', 5417);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 1 год за 5 417 ₽"
                                      >
                                        <div className="font-medium">1 год</div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-5 border-emerald-200">+2 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">6 500 ₽</span>
                                          <span className="font-bold text-emerald-700">5 417 ₽</span>
                                        </div>
                                        <div className="text-right text-emerald-600 font-bold text-xs">-16%</div>
                                      </div>
                                      
                                      <div 
                                        className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] p-3 border-t items-center bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer group focus:bg-amber-50/60 active:bg-amber-100/50" 
                                        tabIndex={0}
                                        onClick={() => handlePeriodSelect('premium', '3years', 15185)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePeriodSelect('premium', '3years', 15185);
                                          }
                                        }}
                                        role="button"
                                        aria-label="Выбрать тариф на 3 года за 15 185 ₽"
                                      >
                                        <div className="font-medium leading-tight">
                                          3 года 
                                          <span className="block text-[10px] text-muted-foreground font-normal">LifeStyle</span>
                                          <Badge variant="outline" className="mt-1 text-[8px] h-4 px-1 bg-white/50 text-amber-700 border-amber-200">ОГРАНИЧЕНО</Badge>
                                        </div>
                                        <div className="text-center">
                                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5 h-5 border-amber-200">+7 мес</Badge>
                                        </div>
                                        <div className="text-right">
                                          <span className="line-through text-muted-foreground text-[10px] block">18 850 ₽</span>
                                          <span className="font-bold text-amber-700">15 185 ₽</span>
                                        </div>
                                        <div className="text-right text-amber-600 font-bold text-xs">-22%</div>
                                      </div>
                                    </div>
                                  </div>
                                  )}
                                  
                                  {plan.id !== 'muslim' && (
                                    <p className="text-xs text-center text-muted-foreground">
                                      Нажмите на строку с тарифом, чтобы перейти к оплате
                                    </p>
                                  )}
                                </div>
                             </DialogContent>
                           </Dialog>
                      </div>
                    </div>

                    <ul className="space-y-3 flex-1 py-2">
                      {plan.features.slice(0, expandedPlans[plan.id] ? undefined : 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 mt-0.5 opacity-60 shrink-0" strokeWidth={2.5} />
                          <span className="opacity-90 leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.features.length > 3 && (
                      <button 
                        onClick={() => togglePlanExpand(plan.id)}
                        className="flex items-center justify-center w-full py-2 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
                      >
                        {expandedPlans[plan.id] ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" /> Свернуть
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> Показать еще {plan.features.length - 3}
                          </>
                        )}
                      </button>
                    )}

                    <Button 
                      variant={plan.buttonVariant === 'outline' ? 'outline' : 'default'}
                      className={cn(
                        "w-full rounded-xl h-12 font-medium",
                        plan.buttonVariant === 'outline' 
                          ? "bg-transparent border border-current hover:bg-black/5" 
                          : "bg-[#1F2937] text-white hover:bg-[#374151] dark:bg-black dark:text-white"
                      )}
                      onClick={() => {
                        if (plan.id === 'muslim') {
                          // Free подписка - открываем модальное окно с информацией
                          setSelectedPlanId(plan.id);
                        } else {
                          // Открываем диалог выбора тарифа
                          setSelectedPlanId(plan.id);
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Donation Modal */}
      <DonationModal
        open={donationModalOpen}
        onOpenChange={(open) => {
          setDonationModalOpen(open);
          if (!open) {
            // Reset amounts when modal closes
            setQuickDonationAmount(null);
            setProjectDonationAmount(null);
          }
        }}
        campaignId={selectedCampaignForDonation?.id}
        partnerId={selectedCampaignForDonation?.partnerId}
        campaignTitle={selectedCampaignForDonation?.title}
        category={donationCategory || "sadaka"}
        type={donationType}
        defaultAmount={donationType === "quick" ? quickDonationAmount || undefined : donationType === "mubarakway" ? projectDonationAmount || undefined : undefined}
      />
    </div>
  );
}
