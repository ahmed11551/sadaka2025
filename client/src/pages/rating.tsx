import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User as UserIcon, Trophy, Calendar, Users, Link as LinkIcon, Coins, ArrowUpRight, Sparkles, TrendingUp, Lock, Globe, Flag, Check } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { useTopDonors, useRatingStats, useTopCampaigns, useCompletedCampaigns } from "@/hooks/use-rating";

export default function RatingPage() {
  const [activeTab, setActiveTab] = useState("general");

  // Загружаем данные из API (с fallback на статические данные)
  const { data: topDonors = [], isLoading: donorsLoading } = useTopDonors(
    activeTab === "country" ? "ru" : undefined
  );
  const { data: stats, isLoading: statsLoading } = useRatingStats();
  const { data: topCampaigns = [], isLoading: topCampaignsLoading } = useTopCampaigns();
  const { data: completedCampaigns = [], isLoading: completedLoading } = useCompletedCampaigns("ru");

  const handleMarathonJoin = () => {
    toast.success("Вы в деле! Вы успешно зарегистрировались в марафоне Рамадана.");
  };

  const isLoading = donorsLoading || statsLoading || topCampaignsLoading || completedLoading;

  return (
    <div className="p-4 space-y-6 pt-6 pb-24">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Рейтинг</h1>
            <p className="text-sm text-muted-foreground">Топ доноров и рефералов платформы</p>
          </div>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <UserIcon className="w-5 h-5" />
          </div>
        </Link>
      </header>

      {/* Platform Analytics Dashboard */}
      {isLoading ? (
        <LoadingState text="Загрузка статистики..." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-4 flex flex-col justify-between h-24">
              <div className="flex justify-between items-start">
                <TrendingUp className="w-5 h-5 opacity-80" />
                <Badge variant="secondary" className="bg-white/20 text-white border-none hover:bg-white/30 text-[10px] px-1.5">+12%</Badge>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalCollected 
                    ? `${(stats.totalCollected / 1000000).toFixed(1)}M ₽`
                    : '12.5M ₽'}
                </p>
                <p className="text-xs opacity-80">Собрано всего</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex flex-col justify-between h-24">
              <div className="flex justify-between items-start">
                <Users className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.activeDonors?.toLocaleString() || '1,240'}
                </p>
                <p className="text-xs text-muted-foreground">Активных доноров</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant={activeTab === "general" ? "outline" : "ghost"} 
          className={cn(
            "h-12 justify-start text-sm font-medium",
            activeTab === "general" ? "bg-white border-none shadow-sm" : "bg-[#F9FAF9] text-muted-foreground"
          )}
          onClick={() => setActiveTab("general")}
        >
          <Trophy className="w-4 h-4 mr-2" /> Общий рейтинг
        </Button>
        <Button 
          variant={activeTab === "country" ? "outline" : "ghost"} 
          className={cn(
            "h-12 justify-start text-sm font-medium",
            activeTab === "country" ? "bg-white border-none shadow-sm" : "bg-[#F9FAF9] text-muted-foreground"
          )}
          onClick={() => setActiveTab("country")}
        >
          <Globe className="w-4 h-4 mr-2" /> Рейтинг по стране
        </Button>
        <Button 
          variant={activeTab === "top_collections" ? "outline" : "ghost"} 
          className={cn(
            "h-12 justify-start text-sm font-medium",
            activeTab === "top_collections" ? "bg-white border-none shadow-sm" : "bg-[#F9FAF9] text-muted-foreground"
          )}
          onClick={() => setActiveTab("top_collections")}
        >
          <TrendingUp className="w-4 h-4 mr-2" /> Топ сборы
        </Button>
        <Button 
          variant={activeTab === "top_collections_country" ? "outline" : "ghost"} 
          className={cn(
            "h-12 justify-start text-sm font-medium",
            activeTab === "top_collections_country" ? "bg-white border-none shadow-sm" : "bg-[#F9FAF9] text-muted-foreground"
          )}
          onClick={() => setActiveTab("top_collections_country")}
        >
          <Flag className="w-4 h-4 mr-2" /> Топ сборы (RU)
        </Button>
      </div>

      {activeTab === "general" && (
        <div className="space-y-4">
          {donorsLoading ? (
            <LoadingState text="Загрузка рейтинга..." />
          ) : topDonors.length > 0 ? (
            <Card className="border-none shadow-md bg-gradient-to-br from-amber-100 to-orange-50 border-amber-200">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Globe className="w-8 h-8 text-amber-500 fill-amber-500" />
                </div>
                <h3 className="font-bold text-lg text-amber-900">Мировые лидеры</h3>
                <p className="text-sm text-amber-800/80 mt-1 mb-4">Топ доноров по всем странам присутствия платформы</p>
                <div className="w-full space-y-2">
                  {topDonors.slice(0, 3).map((donor, i) => (
                    <div key={donor.id} className="bg-white/60 rounded-lg p-3 flex items-center gap-3">
                      <span className="font-bold text-amber-600 w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                        {donor.country.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm text-amber-900">{donor.name}</p>
                        <p className="text-xs text-amber-800">{donor.amount.toLocaleString()} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Trophy}
              title="Нет данных"
              description="Рейтинг доноров пока пуст"
            />
          )}
        </div>
      )}

      {activeTab === "country" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-sm text-muted-foreground">Лидеры в вашем регионе (Россия)</p>
          </div>
          {donorsLoading ? (
            <LoadingState text="Загрузка рейтинга..." />
          ) : topDonors.length > 0 ? (
            topDonors.map((donor, i) => (
            <div key={donor.id} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
              <span className={cn(
                "font-bold w-6 text-center",
                i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"
              )}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{donor.name}</p>
                <p className="text-xs text-muted-foreground">{donor.donations} пожертвований</p>
              </div>
              <span className="font-bold text-[#3E5F43]">{donor.amount.toLocaleString()} ₽</span>
            </div>
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Нет данных"
              description="Рейтинг доноров по стране пока пуст"
            />
          )}
        </div>
      )}

      {activeTab === "top_collections" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground px-1">Самые масштабные сборы платформы</p>
          {topCampaignsLoading ? (
            <LoadingState text="Загрузка топ сборов..." />
          ) : topCampaigns.length > 0 ? (
            topCampaigns.map((project, i) => (
             <Card key={project.id} className="border-none shadow-sm">
               <CardContent className="p-4">
                 <div className="flex gap-3">
                   <div className="flex flex-col items-center justify-center w-10">
                      <span className={cn("text-lg font-bold", i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-700")}>#{i+1}</span>
                   </div>
                   <div className="flex-1 space-y-2">
                     <h4 className="font-bold text-sm">{project.title}</h4>
                     <div className="space-y-1">
                       <div className="flex justify-between text-xs">
                         <span className="font-medium text-primary">{project.collected.toLocaleString()} ₽</span>
                         <span className="text-muted-foreground">из {project.goal.toLocaleString()} ₽</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${(project.collected / project.goal) * 100}%` }} />
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
            ))
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Нет данных"
              description="Топ сборы пока пусты"
            />
          )}
        </div>
      )}

      {activeTab === "top_collections_country" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground px-1">Завершенные сборы в вашей стране</p>
          {completedLoading ? (
            <LoadingState text="Загрузка завершенных сборов..." />
          ) : completedCampaigns.length > 0 ? (
            completedCampaigns.map((project, i) => (
             <Card key={project.id} className="border-none shadow-sm opacity-90">
               <CardContent className="p-4">
                 <div className="flex gap-3">
                   <div className="flex flex-col items-center justify-center w-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-4 h-4" />
                      </div>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-sm text-muted-foreground line-through decoration-emerald-500/50">{project.title}</h4>
                     <div className="mt-2 flex items-center justify-between">
                       <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Сбор закрыт</Badge>
                       <span className="font-bold text-emerald-700">{project.collected.toLocaleString()} ₽</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
            ))
          ) : (
            <EmptyState
              icon={Check}
              title="Нет данных"
              description="Завершенные сборы пока пусты"
            />
          )}
        </div>
      )}
    </div>
  );
}
