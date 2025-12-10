import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Globe, Mail, ArrowLeft, Heart, Users, MapPin, Layout, Calendar, FileText, ExternalLink, GraduationCap, HandHeart, Coins, User as UserIcon, Loader2, FileBarChart } from "lucide-react";
import { Link } from "wouter";
import logoImg from "@assets/generated_images/logo_for_charity_fund.png";
import { cn } from "@/lib/utils";
import { usePartners, usePartner, usePartnerCampaigns } from "@/hooks/use-partners";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DonationModal } from "@/components/donation-modal";
import { PartnerApplicationModal } from "@/components/partner-application-modal";
import { useInsanPrograms } from "@/hooks/use-insan-programs";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Building2 } from "lucide-react";

const locations = {
  ru: {
    name: "Россия",
    cities: [
      { id: "msk", name: "Москва" },
      { id: "kazan", name: "Казань" },
      { id: "grozny", name: "Грозный" },
      { id: "mah", name: "Махачкала" }
    ]
  },
  uz: {
    name: "Узбекистан",
    cities: [
      { id: "tashkent", name: "Ташкент" },
      { id: "samarkand", name: "Самарканд" }
    ]
  },
  tr: {
    name: "Турция",
    cities: [
      { id: "istanbul", name: "Стамбул" },
      { id: "ankara", name: "Анкара" }
    ]
  }
};

// Partners data will come from API

const fundPrograms = [
  {
    id: 1,
    title: "Помощь Хифз-центрам",
    description: "Помощь Центру заучивания Корана. Каждый день в...",
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    id: 2,
    title: "Садака Джария",
    description: "Непрерывные благие деяния",
    icon: HandHeart,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    id: 3,
    title: "Закят",
    description: "Один из пяти столпов Ислама",
    icon: Coins,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  }
];

export default function PartnersPage() {
  const [match, params] = useRoute("/partners/:id");
  const [selectedFund, setSelectedFund] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("about"); 
  
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  // Fetch partners from API
  const { data: partnersData, isLoading: partnersLoading } = usePartners({
    ...(selectedCountry !== "all" && { country: selectedCountry }),
    ...(selectedCity !== "all" && { city: selectedCity }),
    limit: 50
  });

  // Fetch selected partner details
  const { data: partnerDetails, isLoading: partnerDetailsLoading } = usePartner(selectedFund?.id || '');
  const { data: partnerCampaignsData, isLoading: partnerCampaignsLoading } = usePartnerCampaigns(selectedFund?.id || '', 1, 10);
  
  // Always fetch Insan programs (they will be shown if partner is Insan)
  const { data: insanProgramsData, isLoading: insanProgramsLoading } = useInsanPrograms();
  const insanPrograms = Array.isArray(insanProgramsData) ? insanProgramsData : [];

  // Create Insan partner object (must be before fundWebsite)
  const insanPartner = useMemo(() => {
    if (insanPrograms.length === 0) return null;
    return {
      id: 'insan',
      slug: 'insan',
      name: 'Фонд Инсан',
      nameAr: 'صندوق إنسان',
      description: 'Благотворительный фонд "Инсан" - один из ведущих фондов России, помогающий нуждающимся, сиротам, больным и пострадавшим.',
      country: 'ru',
      city: 'mah',
      verified: true,
      logo: 'https://fondinsan.ru/uploads/cache/Programs/Program16/78e1622e63-2_400x400.jpg',
      website: 'https://fondinsan.ru',
      type: 'Благотворительный фонд',
      categories: ['Закят', 'Садака', 'Помощь нуждающимся'],
      isInsan: true,
      programsCount: insanPrograms.length
    };
  }, [insanPrograms]);

  // Check if selected partner is Insan (by slug or id or name)
  const isInsanPartner = useMemo(() => {
    const fundName = (selectedFund?.name || partnerDetails?.data?.name || '').toLowerCase();
    const fundSlug = (selectedFund?.slug || partnerDetails?.data?.slug || '').toLowerCase();
    const fundId = (selectedFund?.id || '').toLowerCase();
    
    return (
      fundSlug === 'insan' || 
      fundId === 'insan' ||
      fundName.includes('инсан') ||
      fundName.includes('ихсан') ||
      fundName.includes('insan')
    );
  }, [selectedFund, partnerDetails]);
  
  // Get website URL for selected fund
  const fundWebsite = useMemo(() => {
    // Always prioritize selectedFund website if available
    if (selectedFund?.website) {
      return selectedFund.website;
    }
    
    // For Insan partner, use default website (don't depend on insanPartner object)
    if (isInsanPartner) {
      return 'https://fondinsan.ru';
    }
    
    // Fallback to partnerDetails
    return partnerDetails?.data?.website;
  }, [isInsanPartner, selectedFund, partnerDetails]);
  
  // Debug logging (only in development)
  useEffect(() => {
    if (import.meta.env.DEV && selectedFund) {
      console.log('[PartnersPage] Selected fund:', {
        id: selectedFund.id,
        name: selectedFund.name,
        slug: selectedFund.slug,
        isInsanPartner,
      });
      console.log('[PartnersPage] Insan programs:', {
        count: insanPrograms.length,
        isLoading: insanProgramsLoading,
        data: insanPrograms.slice(0, 2),
      });
    }
  }, [selectedFund, isInsanPartner, insanPrograms.length, insanProgramsLoading]);

  // Process partners data
  const partners = useMemo(() => {
    if (!partnersData?.data) return [];
    const data = partnersData.data;
    if (Array.isArray(data)) {
      return data.filter((p: any) => p && p.id);
    }
    if (data && typeof data === 'object' && 'items' in data) {
      return Array.isArray(data.items) ? data.items.filter((p: any) => p && p.id) : [];
    }
    return [];
  }, [partnersData]);

  const filteredPartners = useMemo(() => {
    const filtered = partners.filter((partner: any) => {
      if (!partner || !partner.id) return false;
      if (selectedCountry !== "all" && partner.country !== selectedCountry) return false;
      if (selectedCity !== "all" && partner.city !== selectedCity) return false;
      return true;
    });
    
    // Add Insan partner if programs are loaded and it matches filters
    if (insanPartner && 
        (selectedCountry === "all" || selectedCountry === "ru") &&
        (selectedCity === "all" || selectedCity === "mah")) {
      // Check if Insan is not already in the list
      if (!filtered.find((p: any) => p.id === 'insan' || p.slug === 'insan')) {
        return [insanPartner, ...filtered];
      }
    }
    
    return filtered;
  }, [partners, selectedCountry, selectedCity, insanPartner]);

  // Reset city when country changes
  useEffect(() => {
    if (selectedCountry === "all") {
      setSelectedCity("all");
    } else {
      setSelectedCity("all");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (match && params?.id) {
      const fundId = params.id;
      // Try to find partner by ID or slug
      let found = partners.find((p: any) => p.id === fundId || p.slug === fundId);
      
      // If not found and it's Insan, create Insan partner object
      if (!found && (fundId === 'insan' || fundId.toLowerCase().includes('insan'))) {
        found = {
          id: 'insan',
          slug: 'insan',
          name: 'Фонд Инсан',
          nameAr: 'صندوق إنسان',
          description: 'Благотворительный фонд "Инсан" - один из ведущих фондов России, помогающий нуждающимся, сиротам, больным и пострадавшим.',
          country: 'ru',
          city: 'mah',
          verified: true,
          logo: 'https://fondinsan.ru/uploads/cache/Programs/Program16/78e1622e63-2_400x400.jpg',
          website: 'https://fondinsan.ru',
          type: 'Благотворительный фонд',
          categories: ['Закят', 'Садака', 'Помощь нуждающимся'],
          isInsan: true,
        };
      }
      
      if (found) {
        // Ensure website is set for Insan
        if ((found.id === 'insan' || found.slug === 'insan') && !found.website) {
          found = { ...found, website: 'https://fondinsan.ru' };
        }
        setSelectedFund(found);
      }
    }
  }, [match, params, partners]);

  if (selectedFund) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="p-4 flex items-center gap-4 border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => setSelectedFund(null)} className="-ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-lg">Информация о фонде</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Fund Hero */}
          <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border flex items-center justify-center p-2">
              {selectedFund.logo ? (
                <img 
                  src={selectedFund.logo} 
                  alt={selectedFund.name || 'Фонд'} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              {!selectedFund.logo && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Layout className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="font-bold text-xl flex items-center gap-2">
                {selectedFund?.name || 'Без названия'}
                {selectedFund?.verified && <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />}
              </h2>
              {selectedFund?.nameAr && (
                <p className="text-sm text-muted-foreground font-arabic mt-1">{selectedFund.nameAr}</p>
              )}
              {selectedFund?.type && (
                <Badge variant="secondary" className="mt-2 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                  {selectedFund.type}
                </Badge>
              )}
            </div>
          </div>

          {selectedFund?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedFund.description}
            </p>
          )}

          {/* Quick Stats */}
          {partnerDetailsLoading ? (
            <LoadingState size="sm" text="Загрузка данных..." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Всего собрано</p>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">↗</span>
                    <span className="font-bold text-xl">
                      {partnerDetails?.data?.totalCollected 
                        ? `${(Number(partnerDetails.data.totalCollected) / 1000).toFixed(0)}k ₽`
                        : '0 ₽'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Доноров</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-xl">{partnerDetails?.data?.totalDonors || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-[#3E5F43] hover:bg-[#2F4832] text-white h-12 text-base"
              onClick={() => {
                if (!partnerDetails?.data?.id) {
                  toast.error("Выберите фонд для пожертвования");
                  return;
                }
                setDonationModalOpen(true);
              }}
            >
              <Heart className="w-5 h-5 mr-2 fill-current" /> Пожертвовать
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-base cursor-pointer hover:bg-primary/5 hover:border-primary/50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const website = fundWebsite || (isInsanPartner ? 'https://fondinsan.ru' : selectedFund?.website);
                if (website) {
                  window.open(website, '_blank', 'noopener,noreferrer');
                } else {
                  toast.error("Сайт фонда не указан");
                }
              }}
              disabled={false}
            >
              <Globe className="w-5 h-5 mr-2" /> Сайт
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-base"
              onClick={() => {
                if (fundWebsite) {
                  // Открываем сайт отчетности (основной сайт или можно добавить /reports)
                  const reportUrl = fundWebsite.endsWith('/') 
                    ? fundWebsite + 'reports'
                    : fundWebsite + '/reports';
                  window.open(reportUrl, '_blank', 'noopener,noreferrer');
                } else {
                  toast.error("Сайт фонда не указан");
                }
              }}
              disabled={!fundWebsite}
              title="Отчеты фонда"
            >
              <FileBarChart className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Tabs */}
          <div className="flex gap-4 border-b overflow-x-auto pb-px no-scrollbar">
            <button 
              className={cn("px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors", activeTab === "about" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActiveTab("about")}
            >
              О фонде
            </button>
            <button 
              className={cn("px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors", activeTab === "projects" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActiveTab("projects")}
            >
              Проекты
            </button>
            <button 
              className={cn("px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors", activeTab === "programs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActiveTab("programs")}
            >
              Программы
            </button>
            <button 
              className={cn("px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors", activeTab === "reports" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActiveTab("reports")}
            >
              Отчетность
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">О {selectedFund?.name || 'фонде'}</h3>
                  {selectedFund?.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedFund.description}
                    </p>
                  )}
                </div>

                {/* Impact Stats & Donors */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Наше влияние</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Людей помогли", value: partnerDetails?.data?.totalHelped || 0, icon: Users },
                      { label: "Стран", value: partnerDetails?.data?.country || '-', icon: MapPin },
                      { label: "Проектов", value: partnerDetails?.data?.projectCount || 0, icon: Layout },
                      { label: "Лет работы", value: partnerDetails?.data?.foundedYear ? new Date().getFullYear() - partnerDetails.data.foundedYear : '-', icon: Calendar },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-[#3E5F43]">{stat.value}</span>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Donors section moved here */}
                  <div className="mt-4">
                    <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-bold text-sm">Наши доноры</p>
                          <p className="text-xs text-muted-foreground">450 активных доноров</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("donors")}>Показать</Button>
                    </div>
                  </div>
                </div>

                {/* Contacts */}
                {(fundWebsite || partnerDetails?.data?.email) && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-muted/50 space-y-4">
                    <h3 className="font-bold">Контактная информация</h3>
                    <div className="space-y-3">
                      {fundWebsite && (
                        <a href={fundWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          {fundWebsite.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {partnerDetails?.data?.email && (
                        <a href={`mailto:${partnerDetails.data.email}`} className="flex items-center gap-3 text-sm hover:text-primary">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          {partnerDetails.data.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "projects" && (
               <div className="space-y-4">
                 <h3 className="font-bold text-lg">Активные сборы фонда</h3>
                 {isInsanPartner ? (
                   // Display Insan programs as campaigns
                   insanProgramsLoading ? (
                     <LoadingState size="sm" text="Загрузка программ..." />
                   ) : Array.isArray(insanPrograms) && insanPrograms.length > 0 ? (
                     <div className="space-y-3">
                       {insanPrograms.map((program) => {
                         // Strip HTML tags from description for preview
                         const plainDescription = program.description
                           ?.replace(/<[^>]*>/g, '')
                           ?.replace(/&nbsp;/g, ' ')
                           ?.trim() || program.short || '';
                         
                         return (
                           <Card 
                             key={program.id} 
                             className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all cursor-pointer"
                             onClick={() => {
                               if (program.url) {
                                 window.open(program.url, '_blank', 'noopener,noreferrer');
                               }
                             }}
                           >
                             <div className="flex">
                               <div className="w-24 bg-slate-100 shrink-0 relative">
                                 {program.image ? (
                                   <img 
                                     src={program.image} 
                                     alt={program.title} 
                                     className="w-full h-full object-cover"
                                     onError={(e) => {
                                       (e.target as HTMLImageElement).style.display = 'none';
                                     }}
                                   />
                                 ) : (
                                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                     <Layout className="w-8 h-8" />
                                   </div>
                                 )}
                               </div>
                               <CardContent className="p-3 flex-1">
                                 <h4 className="font-bold text-sm line-clamp-1">{program.title}</h4>
                                 <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{plainDescription}</p>
                                 {program.default_amount && (
                                   <div className="flex items-center gap-2 text-[10px] font-medium mt-2">
                                     <span className="text-primary">Рекомендуемая сумма: {program.default_amount} ₽</span>
                                   </div>
                                 )}
                                 <div className="mt-2 flex items-center gap-2">
                                   <Button 
                                     size="sm" 
                                     className="bg-gradient-to-r from-[#3E5F43] to-[#557C5B] hover:from-[#2F4832] hover:to-[#3E5F43] text-white text-xs h-7 px-3"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if (program.url) {
                                         window.open(program.url, '_blank', 'noopener,noreferrer');
                                       }
                                     }}
                                   >
                                     Подробнее
                                   </Button>
                                 </div>
                               </CardContent>
                             </div>
                           </Card>
                         );
                       })}
                     </div>
                   ) : (
                     <EmptyState
                       icon={GraduationCap}
                       title="Нет активных программ"
                       description="У этого фонда пока нет активных программ"
                     />
                   )
                 ) : (
                   // Display regular campaigns for other partners
                   partnerCampaignsLoading ? (
                     <LoadingState size="sm" text="Загрузка кампаний..." />
                   ) : partnerCampaignsData?.data ? (
                     <div className="space-y-3">
                       {(Array.isArray(partnerCampaignsData.data) ? partnerCampaignsData.data : partnerCampaignsData.data.items || []).map((campaign: any) => {
                         const collected = Number(campaign.collected || 0);
                         const goal = Number(campaign.goal || 1);
                         const progress = (collected / goal) * 100;
                         
                         return (
                           <Card key={campaign.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
                             <div className="flex">
                               <div className="w-24 bg-slate-100 shrink-0 relative">
                                 {campaign.image ? (
                                   <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                     <Layout className="w-8 h-8" />
                                   </div>
                                 )}
                               </div>
                               <CardContent className="p-3 flex-1">
                                 <h4 className="font-bold text-sm line-clamp-1">{campaign.title}</h4>
                                 <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{campaign.description}</p>
                                 <div className="flex justify-between text-[10px] font-medium">
                                   <span className="text-primary">{collected.toLocaleString()} ₽</span>
                                   <span className="text-muted-foreground">из {goal.toLocaleString()} ₽</span>
                                 </div>
                                 <div className="w-full bg-muted/50 h-1 mt-1 rounded-full overflow-hidden">
                                   <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
                                 </div>
                               </CardContent>
                             </div>
                           </Card>
                         );
                       })}
                     </div>
                   ) : (
                     <EmptyState
                       icon={Layout}
                       title="Нет активных кампаний"
                       description="У этого фонда пока нет активных кампаний"
                     />
                   )
                 )}
               </div>
            )}

            {activeTab === "programs" && (
               <div className="space-y-4">
                 <h3 className="font-bold text-lg">Программы фонда</h3>
                 {isInsanPartner ? (
                   // Display Insan programs from API
                   insanProgramsLoading ? (
                     <LoadingState size="sm" text="Загрузка программ..." />
                   ) : Array.isArray(insanPrograms) && insanPrograms.length > 0 ? (
                     <div className="space-y-3">
                       {insanPrograms.map((program) => {
                         // Strip HTML tags from description for preview
                         const plainDescription = program.description
                           ?.replace(/<[^>]*>/g, '')
                           ?.replace(/&nbsp;/g, ' ')
                           ?.trim() || program.short || '';
                         
                         return (
                           <Card key={program.id} className="border-none shadow-sm hover:shadow-md transition-all">
                             <CardContent className="p-4">
                               <div className="flex items-start gap-4">
                                 {program.image && (
                                   <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                     <img 
                                       src={program.image} 
                                       alt={program.title} 
                                       className="w-full h-full object-cover"
                                       onError={(e) => {
                                         (e.target as HTMLImageElement).style.display = 'none';
                                       }}
                                     />
                                   </div>
                                 )}
                                 <div className="flex-1 min-w-0">
                                   <h4 className="font-bold text-sm mb-1">{program.title}</h4>
                                   <p className="text-xs text-muted-foreground line-clamp-3 leading-snug">
                                     {plainDescription}
                                   </p>
                                   {program.default_amount && (
                                     <p className="text-xs text-primary font-medium mt-2">
                                       Рекомендуемая сумма: {program.default_amount} ₽
                                     </p>
                                   )}
                                 </div>
                                 <Button 
                                   size="sm" 
                                   className="bg-gradient-to-r from-[#3E5F43] to-[#557C5B] hover:from-[#2F4832] hover:to-[#3E5F43] text-white text-xs h-8 px-3 shadow-sm shrink-0"
                                   onClick={() => {
                                     if (program.url) {
                                       window.open(program.url, '_blank', 'noopener,noreferrer');
                                     }
                                   }}
                                 >
                                   <ExternalLink className="w-3 h-3 mr-1.5" /> Перейти
                                 </Button>
                               </div>
                             </CardContent>
                           </Card>
                         );
                       })}
                     </div>
                   ) : (
                     <EmptyState
                       icon={GraduationCap}
                       title="Программы не найдены"
                       description="У этого фонда пока нет доступных программ"
                     />
                   )
                 ) : (
                   // Display default programs for other partners
                   <div className="space-y-3">
                     {fundPrograms.map((program) => (
                       <Card key={program.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
                         <CardContent className="p-4 flex items-center gap-4">
                           <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", program.bg)}>
                             <program.icon className={cn("w-6 h-6", program.color)} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-sm truncate">{program.title}</h4>
                             <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-0.5">
                               {program.description}
                             </p>
                           </div>
                           <Button size="sm" className="bg-gradient-to-r from-[#3E5F43] to-[#557C5B] hover:from-[#2F4832] hover:to-[#3E5F43] text-white text-xs h-8 px-3 shadow-sm">
                             <ExternalLink className="w-3 h-3 mr-1.5" /> Перейти
                           </Button>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 )}
               </div>
            )}

            {activeTab === "donors" && (
               <div className="space-y-4">
                 <h3 className="font-bold text-lg">Наши доноры</h3>
                 <div className="p-8 text-center bg-slate-50 rounded-xl">
                   <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                   <p className="text-sm text-muted-foreground">Информация о донорах скрыта</p>
                 </div>
               </div>
            )}

             {activeTab === "reports" && (
               <div className="space-y-6">
                 <div className="space-y-4">
                   <h3 className="font-bold text-lg">Статистика фонда</h3>
                   <p className="text-xs text-muted-foreground -mt-2">Общая информация о деятельности фонда</p>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <Card className="border-none bg-[#F9FAF9] shadow-none">
                       <CardContent className="p-4 py-5">
                         <p className="text-xs text-muted-foreground mb-1">Всего собрано</p>
                         <p className="text-xl font-bold text-[#3E5F43]">0 ₽</p>
                       </CardContent>
                     </Card>
                     <Card className="border-none bg-[#F9FAF9] shadow-none">
                       <CardContent className="p-4 py-5">
                         <p className="text-xs text-muted-foreground mb-1">Доноров</p>
                         <p className="text-xl font-bold text-[#3E5F43]">0</p>
                       </CardContent>
                     </Card>
                     <Card className="border-none bg-[#F9FAF9] shadow-none">
                       <CardContent className="p-4 py-5">
                         <p className="text-xs text-muted-foreground mb-1">Проектов</p>
                         <p className="text-xl font-bold text-[#3E5F43]">13</p>
                       </CardContent>
                     </Card>
                     <Card className="border-none bg-[#F9FAF9] shadow-none">
                       <CardContent className="p-4 py-5">
                         <p className="text-xs text-muted-foreground mb-1">Активных кампаний</p>
                         <p className="text-xl font-bold text-[#3E5F43]">0</p>
                       </CardContent>
                     </Card>
                   </div>
                 </div>

                 <Separator />

                 <div className="space-y-4">
                   <h3 className="font-bold text-lg">Документы</h3>
                   <div className="p-4 border rounded-xl flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                     <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                       <p className="font-medium text-sm">Годовой отчет 2024.pdf</p>
                       <p className="text-xs text-muted-foreground">2.4 MB • 15 янв 2025</p>
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pt-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Фонды-партнеры</h1>
          <p className="text-sm text-muted-foreground">Проверенные организации</p>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <UserIcon className="w-5 h-5" />
          </div>
        </Link>
      </header>

      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Страна" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все страны</SelectItem>
              {Object.entries(locations).map(([key, data]) => (
                <SelectItem key={key} value={key}>{data.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedCountry === "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Город" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              {selectedCountry !== "all" && locations[selectedCountry as keyof typeof locations]?.cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {partnersLoading ? (
          <LoadingState text="Загрузка фондов..." />
        ) : filteredPartners.length > 0 ? (
          filteredPartners.map((partner: any) => {
            if (!partner || !partner.id) return null;
            return (
              <Card key={partner.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all" onClick={() => setSelectedFund(partner)}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-50 shrink-0 overflow-hidden border flex items-center justify-center p-2">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={partner.name || 'Фонд'} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = logoImg;
                        }}
                      />
                    ) : (
                      <img src={logoImg} alt={partner.name || 'Фонд'} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold flex items-center gap-1.5">
                          {partner.name || 'Без названия'}
                          {partner.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />}
                        </h3>
                        <p className="text-xs text-muted-foreground">{partner.city ? `${partner.city}, ${partner.country || ''}` : (partner.country || '')}</p>
                      </div>
                      {partner.website && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(partner.website, '_blank', 'noopener,noreferrer');
                          }}
                          title="Открыть сайт фонда"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {partner.description && (
                      <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                        {partner.description}
                      </p>
                    )}

                    {partner.categories && Array.isArray(partner.categories) && partner.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {partner.categories.map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 h-5 bg-slate-100 text-slate-600 font-normal">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={Building2}
            title="Фонды не найдены"
            description="Попробуйте изменить параметры фильтрации или проверить позже"
            action={{
              label: "Сбросить фильтры",
              onClick: () => {
                setSelectedCountry("all");
                setSelectedCity("all");
              }
            }}
          />
        )}

        <div className="bg-primary/5 rounded-xl p-6 text-center space-y-3 mt-8 border border-primary/10">
          <h3 className="font-serif font-bold text-primary">Хотите стать партнером?</h3>
          <p className="text-sm text-muted-foreground">
            Если вы представляете благотворительный фонд, оставьте заявку на подключение к платформе.
          </p>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-slate-50 text-primary border-primary/20"
            onClick={() => setApplicationModalOpen(true)}
          >
            Оставить заявку
          </Button>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        partnerId={partnerDetails?.data?.id}
        campaignTitle={partnerDetails?.data?.name}
        category="sadaka"
        type="quick"
      />

      {/* Partner Application Modal */}
      <PartnerApplicationModal
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
      />
    </div>
  );
}
