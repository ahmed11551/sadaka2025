import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  User, Settings, History, FileText, CreditCard, 
  Trophy, Star, ChevronRight, LogOut, Heart, Building2, Clock, Users, MessageCircle, Bell, Shield, Globe, Moon, Mail, Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import userAvatar from "@assets/generated_images/user_avatar_placeholder.png";
import { useFavorites } from "@/hooks/use-favorites";
import { useProfile, useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { donationApi, favoriteApi } from "@/lib/api";
import { useFavoriteCampaigns } from "@/hooks/use-campaigns";
import { useSubscriptions } from "@/hooks/use-subscriptions";

export default function ProfilePage() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("subscriptions");
  
  const { favorites, toggleFavorite } = useFavorites();
  const { profile, isLoading: profileLoading } = useProfile();
  const { logout, isAuthenticated } = useAuth();
  
  // Fetch user donations
  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', 'my'],
    queryFn: () => donationApi.getUserDonations(1, 10),
  });

  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['donations', 'stats'],
    queryFn: () => donationApi.getUserStats(),
  });

  // Fetch favorite campaigns
  const { data: favoriteCampaignsData, isLoading: favoriteCampaignsLoading } = useFavoriteCampaigns(1, 10);

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useSubscriptions();

  const favoriteCampaigns = favoriteCampaignsData?.data 
    ? (Array.isArray(favoriteCampaignsData.data) ? favoriteCampaignsData.data : favoriteCampaignsData.data.items || [])
    : [];

  // Extract subscription data
  const subscription = subscriptionsData?.data 
    ? (Array.isArray(subscriptionsData.data) ? subscriptionsData.data[0] : subscriptionsData.data)
    : null;

  useEffect(() => {
    // Parse query params manually since wouter useLocation doesn't give them directly
    const params = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const userStats = {
    donations: statsData?.data?.totalDonations || 0,
    totalAmount: statsData?.data?.totalAmount ? `${Number(statsData.data.totalAmount).toLocaleString()} ₽` : "0 ₽",
    campaigns: statsData?.data?.totalCampaigns || 0
  };

  const donations = donationsData?.data 
    ? (Array.isArray(donationsData.data) ? donationsData.data : donationsData.data.items || [])
    : [];

  const achievements = [
    { id: 1, title: "Первый шаг", icon: "🌱", desc: "Сделайте первое пожертвование", unlocked: true },
    { id: 2, title: "Хранитель традиций", icon: "🕌", desc: "Поддержите 3 проекта строительства мечетей", unlocked: false },
    { id: 3, title: "Сердце уммы", icon: "❤️", desc: "Помогайте регулярно в течение 6 месяцев", unlocked: false },
    { id: 4, title: "Наставник", icon: "📚", desc: "Пожертвуйте на образование суммарно 10 000 ₽", unlocked: false },
    { id: 5, title: "Источник жизни", icon: "💧", desc: "Примите участие в строительстве колодца", unlocked: false },
    { id: 6, title: "Садака-джария", icon: "🌳", desc: "Оформите подписку Premium", unlocked: true },
  ];

  const history = [
    { id: 1, title: "Строительство мечети", date: "12.05.2025", amount: "500 ₽", status: "success" },
    { id: 2, title: "Помощь сиротам", date: "10.05.2025", amount: "1000 ₽", status: "success" },
    { id: 3, title: "Продуктовый набор", date: "01.05.2025", amount: "300 ₽", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 pt-8 bg-[#F9FAF9] dark:bg-background">
        {/* Header Profile Card */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                <AvatarImage src={profile?.avatar || userAvatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                  {profile?.fullName?.[0] || profile?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{profile?.fullName || profile?.username || 'Пользователь'}</h2>
                <p className="text-sm text-muted-foreground">Участник</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Настройки</DialogTitle>
                    <DialogDescription>Управление вашим профилем и предпочтениями</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Уведомления</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="push-notifs" className="cursor-pointer">Push-уведомления</Label>
                        </div>
                        <Switch id="push-notifs" defaultChecked />
                      </div>
                      
                      <div className="pl-7 space-y-3">
                         <div className="flex items-center justify-between">
                          <Label htmlFor="fav-notifs" className="text-sm text-muted-foreground cursor-pointer">Обновления избранных</Label>
                          <Switch id="fav-notifs" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="complete-notifs" className="text-sm text-muted-foreground cursor-pointer">Завершение сборов</Label>
                          <Switch id="complete-notifs" defaultChecked />
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <Label htmlFor="tg-notifs" className="cursor-pointer">Telegram-уведомления</Label>
                            <span className="text-[10px] text-muted-foreground">О поступлениях (для авторов)</span>
                          </div>
                        </div>
                        <Switch id="tg-notifs" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Внешний вид</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Moon className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="dark-mode" className="cursor-pointer">Темная тема</Label>
                        </div>
                        <Switch id="dark-mode" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Аккаунт</h4>
                      <div className="flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span>Язык приложения</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          Русский <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span>Безопасность</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity text-destructive"
                        onClick={() => {
                          logout(undefined, {
                            onSuccess: () => {
                              setLocation("/");
                            }
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-4 h-4" />
                          <span>Выйти из аккаунта</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center flex flex-col justify-center h-24 shadow-sm">
                <span className="text-2xl font-bold text-[#3E5F43]">{userStats.donations}</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-1">Пожертвований</span>
              </div>
              <div className="bg-white border-2 border-[#D4C5A3]/20 rounded-xl p-3 text-center flex flex-col justify-center h-24 shadow-sm relative overflow-hidden">
                <span className="text-2xl font-bold text-[#D4C5A3]">{userStats.totalAmount}</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-1">За все время</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center flex flex-col justify-center h-24 shadow-sm">
                <span className="text-2xl font-bold text-[#3E5F43]">{userStats.campaigns}</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-1">Кампаний</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted/30 p-1 h-12 rounded-xl">
            <TabsTrigger value="history" className="rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">История</TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Подписки</TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Избранное</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Отчёты</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="subscriptions" className="space-y-6 outline-none">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Мои подписки</h3>
              </div>
              
              {subscriptionsLoading ? (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Загрузка подписок...</p>
                  </CardContent>
                </Card>
              ) : subscription ? (
                /* Active Subscription Card */
                <Card className="border-none shadow-md bg-gradient-to-br from-[#3E5F43] to-[#2F4832] text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2">
                          {subscription.tier === 'FREE' ? 'Free' : subscription.tier === 'PRO' ? 'Pro' : subscription.tier === 'PREMIUM' ? 'Premium' : subscription.tier}
                        </Badge>
                        <h3 className="text-2xl font-bold">Ежемесячная помощь</h3>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/70 text-sm mb-1">Статус подписки</p>
                        <p className="text-2xl font-bold capitalize">{subscription.status}</p>
                        {subscription.expiresAt && (
                          <p className="text-sm text-white/70 mt-1">
                            Истекает: {new Date(subscription.expiresAt).toLocaleDateString('ru-RU')}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-300">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-300">Ваша садака-джария</p>
                            <p className="text-[10px] text-white/60">Непрерывная милостыня</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-black/20 p-4 flex justify-between items-center">
                    <span className="text-xs text-white/70">
                      Начата: {new Date(subscription.startedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-auto py-1 px-3 text-xs">
                      Управление
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-1">Нет активных подписок</h3>
                    <p className="text-sm text-muted-foreground mb-4">Оформите подписку, чтобы получить доступ ко всем функциям</p>
                    <Button asChild>
                      <Link href="/">Выбрать тариф</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Достижения
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((ach) => (
                    <Card 
                      key={ach.id} 
                      className={cn(
                        "border-none shadow-sm transition-all",
                        ach.unlocked ? "bg-slate-50" : "bg-slate-100 opacity-70"
                      )}
                    >
                      <CardContent className="p-3 flex flex-col items-center text-center gap-2 h-full justify-center">
                        {ach.unlocked ? (
                          <>
                            <span className="text-2xl filter drop-shadow-sm">{ach.icon}</span>
                            <p className="text-xs font-medium leading-tight">{ach.title}</p>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-1">
                              <Shield className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">{ach.desc}</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 outline-none">
              <h3 className="font-bold text-lg">История операций</h3>
              {donationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-3">
                  {donations.map((donation: any) => {
                    const date = new Date(donation.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const amount = Number(donation.amount || 0);
                    const campaignTitle = donation.campaign?.title || donation.category || 'Пожертвование';
                    
                    return (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Heart className="w-5 h-5 fill-current" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{campaignTitle}</p>
                            <p className="text-xs text-muted-foreground">{date}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm">{amount.toLocaleString()} ₽</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">Нет истории пожертвований</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4 outline-none">
              <h3 className="font-bold text-lg">Избранные проекты</h3>
              {favoriteCampaignsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : favoriteCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {favoriteCampaigns.map((campaign: any) => {
                    const collected = Number(campaign.collected || 0);
                    const goal = Number(campaign.goal || 1);
                    const progress = (collected / goal) * 100;
                    const daysLeft = campaign.deadline 
                      ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <Card key={campaign.id} className="overflow-hidden border-none shadow-md group cursor-pointer">
                        <div className="relative h-32 overflow-hidden">
                          <img 
                            src={campaign.image || '/placeholder-campaign.jpg'} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="h-8 w-8 rounded-full bg-white/90 text-red-500 hover:text-red-600 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(campaign.id);
                              }}
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                              {campaign.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-base leading-tight mb-1">{campaign.title}</h3>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.participantCount || 0}</span>
                              {daysLeft !== null && (
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} дн.` : 'Завершено'}</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-primary">{collected.toLocaleString()} ₽</span>
                              <span className="text-muted-foreground">{goal.toLocaleString()} ₽</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-primary/10" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground">У вас пока нет избранных проектов</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 outline-none">
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground">Отчеты будут доступны после первого пожертвования</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
